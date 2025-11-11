// testResend.js
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testMail() {
  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "your@gmail.com", // ← apna email likh yahan
      subject: "Test mail from Resend 🚀",
      html: "<h2>Yay! Resend API is working 🎉</h2>",
    });
    console.log("✅ Mail sent:", data);
  } catch (err) {
    console.error("❌ Error sending mail:", err);
  }
}

testMail();
