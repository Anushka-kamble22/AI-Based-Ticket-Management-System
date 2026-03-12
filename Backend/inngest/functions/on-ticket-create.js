import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import analyzeTicket from "../../utils/ai.js";

export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },

  async ({ event, step }) => {

    const { ticketId } = event.data;

    const ticket = await step.run("fetch-ticket", async () => {
      return await Ticket.findById(ticketId);
    });

    if (!ticket) return;

    const aiResponse = await step.run("run-ai", async () => {
      return await analyzeTicket(ticket);
    });

    if (!aiResponse) {

      await Ticket.findByIdAndUpdate(
        ticket._id,
        {
          aiSummary: "AI service temporarily unavailable.",
          helpfulNotes: "Please try again later.",
          relatedSkills: [],
          priority: "MEDIUM"
        },
        { returnDocument: "after" }
      );

      console.log("❌ AI Failed");
      return;
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticket._id,
      {
        aiSummary: aiResponse.summary,
        helpfulNotes: aiResponse.helpfulNotes,
        relatedSkills: aiResponse.relatedSkills,
        priority: aiResponse.priority
      },
      { new: true }
    );

    /* 🔥 Realtime Update */

    const io = global.io;

    if (io) {
      io.emit("ticketUpdated", updatedTicket);
    }

    console.log("✅ AI analysis completed");

  }
);