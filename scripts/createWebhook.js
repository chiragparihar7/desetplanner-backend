import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

async function createWebhook() {
  try {
    const response = await axios.post(
      "https://api.test.paymennt.com/mer/v2.0/webhooks",
      {
        address: "https://desetplanner-backend.onrender.com/api/payment/webhook",
      },
      {
        headers: {
          "X-Paymennt-Api-Key": process.env.PAYMENT_API_KEY,
          "X-Paymennt-Api-Secret": process.env.PAYMENT_SECRET_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("🔥 Webhook Created Successfully!");
    console.log(response.data);
  } catch (error) {
    console.log("❌ Webhook Create Failed");
    console.log(error.response?.data || error.message);
  }
}

createWebhook();
