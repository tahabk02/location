import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getCollection, connectDB } from "../config/db.js";
import { ObjectId } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Payment Intent
 */
router.post("/create-intent", async (req, res) => {
  try {
    const { amount, bookingId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Montant invalide" });
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects cents
      currency: "mad",
      metadata: {
        bookingId: bookingId || "",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ message: "Erreur lors de la création du paiement", error: error.message });
  }
});

/**
 * Handle Webhook logic in a reusable function
 */
export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const bookingId = paymentIntent.metadata.bookingId;

    if (bookingId) {
      try {
        const bookings = getCollection("bookings");
        await bookings.updateOne(
          { _id: new ObjectId(bookingId) },
          { 
            $set: { 
              paymentStatus: "paid",
              stripePaymentIntentId: paymentIntent.id,
              updatedAt: new Date()
            } 
          }
        );
        console.log(`✅ Payment successful for booking ${bookingId}`);
      } catch (dbError) {
        console.error("Database update error in webhook:", dbError);
      }
    }
  }

  res.json({ received: true });
};

export default router;
