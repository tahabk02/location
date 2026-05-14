import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

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
