// Backend/utils/ai.js

import fetch from "node-fetch";

const analyzeTicket = async (ticket) => {
  try {
    console.log("🤖 Running AI for:", ticket._id);

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY missing");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
Analyze this support ticket and return JSON:

{
 "summary": "Short summary",
 "priority": "low | medium | high",
 "helpfulNotes": "Detailed solution guidance",
 "relatedSkills": ["Skill1", "Skill2"]
}

Priority rules:
- HIGH → system crash, payment failure, security issue
- MEDIUM → feature not working
- LOW → general questions or minor issues

Title: ${ticket.title}
Description: ${ticket.description}
`
                }
              ]
            }
          ]
        }),
      }
    );

    const data = await response.json();

    console.log("Gemini Raw Response:", JSON.stringify(data, null, 2));

    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const cleaned = rawText.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(cleaned);

    return {
      summary: parsed.summary || "",
      priority: ["low", "medium", "high"].includes(parsed.priority)
        ? parsed.priority
        : "medium",
      helpfulNotes: parsed.helpfulNotes || "",
      relatedSkills: parsed.relatedSkills || [],
    };

  } catch (err) {
    console.log("❌ AI Failed:", err.message);
    return null;
  }
};

export default analyzeTicket;