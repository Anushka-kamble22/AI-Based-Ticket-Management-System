import { inngest } from "../client.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";

export const onUserSignup = inngest.createFunction(
  { id: "on-user-signup", retries: 2 },
  { event: "user/signup" },

  async ({ event, step }) => {
    try {
      const { email } = event.data;

      // 1️⃣ Fetch user safely
      const user = await step.run("get-user-email", async () => {
        const userObject = await User.findOne({ email });
        if (!userObject) {
          throw new NonRetriableError("User no longer exists in our database");
        }
        return userObject;
      });

      // 2️⃣ Send welcome email
      await step.run("send-welcome-email", async () => {
        const subject = "Welcome to the app";
        const message = `Hi,

Thanks for signing up. We're glad to have you onboard!
`;

        await sendMail(user.email, subject, message);
      });

      console.log("✅ Welcome email sent");

      return { success: true };

    } catch (error) {
      console.error("❌ Error running signup workflow", error);
      return { success: false };
    }
  }
);