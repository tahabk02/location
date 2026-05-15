import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

/**
 * Configure Nodemailer for Gmail
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send Password Reset Email
 */
export const sendResetEmail = async (email, code) => {
  try {
    const mailOptions = {
      from: `"Luxe Drive" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Code de réinitialisation de mot de passe",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #2563eb; text-align: center;">Réinitialisation de mot de passe</h2>
          <p>Bonjour,</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe. Voici votre code de validation :</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${code}</span>
          </div>
          <p>Ce code est valable pendant 1 heure.</p>
          <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.</p>
          <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280; text-align: center;">© ${new Date().getFullYear()} Luxe Drive. Tous droits réservés.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Reset code sent to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("Error sending reset email:", error);
    return false;
  }
};

/**
 * Notification Service to handle SMS, WhatsApp, and Site notifications
 */
export const sendAdminNotification = async (agencyId, bookingData) => {
  try {
    const settings = getCollection("settings");
    const notifications = getCollection("notifications");
    
    // 1. Get Agency Settings for the phone number
    const agencySettings = await settings.findOne({ agencyId }) || await settings.findOne({ agencyId: "default" });
    const adminPhone = agencySettings?.phone || process.env.ADMIN_PHONE;

    const message = `Nouvelle réservation: ${bookingData.carInfo.brand} ${bookingData.carInfo.model} du ${bookingData.startDate} au ${bookingData.endDate}. Total: ${bookingData.totalAmount} DH.`;

    // 2. Save Site Notification
    const siteNotification = {
      agencyId,
      message,
      type: "booking",
      read: false,
      createdAt: new Date(),
      data: {
        bookingId: bookingData._id,
        carId: bookingData.carId
      }
    };
    await notifications.insertOne(siteNotification);

    // 3. Send SMS (Placeholder for Twilio/Infobip)
    if (adminPhone) {
      console.log(`[SMS] Sending to ${adminPhone}: ${message}`);
      // await sendSMS(adminPhone, message);
    }

    // 4. Send WhatsApp (Placeholder)
    if (adminPhone) {
      console.log(`[WhatsApp] Sending to ${adminPhone}: ${message}`);
      // await sendWhatsApp(adminPhone, message);
    }

    return true;
  } catch (error) {
    console.error("Error sending admin notification:", error);
    return false;
  }
};

/**
 * Example SMS function using Twilio
 * To use: npm install twilio
 */
/*
const sendSMS = async (to, body) => {
  const client = await import('twilio').then(m => m.default(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  ));
  
  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER, // Or Alphanumeric Sender ID for Morocco
    to
  });
};
*/

/**
 * Example WhatsApp function using Twilio
 */
/*
const sendWhatsApp = async (to, body) => {
  const client = await import('twilio').then(m => m.default(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  ));
  
  return client.messages.create({
    body,
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${to}`
  });
};
*/
