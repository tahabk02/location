import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";
import { sendAdminNotification } from "../services/notificationService.js";

export const createBooking = async (req, res) => {
  try {
    const bookings = getCollection("bookings");
    const cars = getCollection("cars");
    const { carId, startDate, endDate, location, options } = req.body;
    const bookingLocation = location || options?.location || "Maroc";
    const userId = req.user.id;

    // Get car info for the invoice and to get the agencyId
    const car = await cars.findOne({ _id: new ObjectId(carId) });
    if (!car) return res.status(404).json({ message: "Car not found" });

    const agencyId = car.agencyId || "default";

    // Calculate total amount
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) || 1;
    const totalAmount = days * car.pricePerDay;

    const booking = {
      agencyId,
      userId: new ObjectId(userId),
      carId: new ObjectId(carId),
      carInfo: {
        brand: car.brand,
        model: car.model,
        pricePerDay: car.pricePerDay,
      },
      startDate,
      endDate,
      location: bookingLocation,
      totalAmount,
      status: "confirmed",
      invoiceNumber: `INV-${Date.now()}`,
      contractNumber: `CON-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`,
      createdAt: new Date(),
      options: options || {},
    };
...
export const signContract = async (req, res) => {
  try {
    const bookings = getCollection("bookings");
    const { id } = req.params;
    const { signature } = req.body; // base64 image
    const agencyId = req.user.agencyId || "default";

    const result = await bookings.updateOne(
      { _id: new ObjectId(id), agencyId },
      { 
        $set: { 
          signature, 
          signedAt: new Date(),
          isSigned: true 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Contrat signé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la signature", error: error.message });
  }
};

    const result = await bookings.insertOne(booking);
    const insertedBooking = { _id: result.insertedId, ...booking };

    // Update car status to reserved
    await cars.updateOne(
      { _id: new ObjectId(carId) },
      { $set: { available: false, status: "reserved" } }
    );

    // Send Admin Notifications (SMS, WhatsApp, Site)
    await sendAdminNotification(agencyId, insertedBooking);

    res.status(201).json(insertedBooking);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating booking", error: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = getCollection("bookings");
    const agencyId = req.user.agencyId || "default";
    
    const list = await bookings
      .aggregate([
        { $match: { $or: [{ agencyId }, { agencyId: { $exists: false } }] } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      ])
      .toArray();
    res.json(list);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = getCollection("bookings");
    const list = await bookings
      .find({ userId: new ObjectId(req.user.id) })
      .toArray();
    res.json(list);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching my bookings", error: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const bookings = getCollection("bookings");
    const { id } = req.params;
    const { status } = req.body;
    const agencyId = req.user.agencyId || "default";

    const result = await bookings.updateOne(
      { _id: new ObjectId(id), agencyId }, 
      { $set: { status } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Booking not found or unauthorized" });
    }

    res.json({ message: "Booking status updated" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating booking", error: error.message });
  }
};

export const updateBookingInspection = async (req, res) => {
  try {
    const bookings = getCollection("bookings");
    const { id } = req.params;
    const { type, photos, notes } = req.body; // type: 'check-in' or 'check-out'
    const agencyId = req.user.agencyId || "default";

    const updateData = {};
    if (type === 'check-in') {
      updateData.checkIn = { photos, notes, date: new Date() };
    } else if (type === 'check-out') {
      updateData.checkOut = { photos, notes, date: new Date() };
    } else {
      return res.status(400).json({ message: "Invalid inspection type" });
    }

    const result = await bookings.updateOne(
      { _id: new ObjectId(id), agencyId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Booking not found or unauthorized" });
    }

    res.json({ message: "Booking inspection updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating inspection", error: error.message });
  }
};
