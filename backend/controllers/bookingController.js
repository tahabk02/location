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
    
    let baseAmount = days * car.pricePerDay;
    let insuranceAmount = 0;
    
    if (options?.insurance === "basic") insuranceAmount = baseAmount * 0.1;
    else if (options?.insurance === "premium") insuranceAmount = baseAmount * 0.15;
    else if (options?.insurance === "ultimate") insuranceAmount = baseAmount * 0.2;

    const deliveryFee = (options?.location && options.location.includes("domicile")) ? 50 : 0;
    const finalTotalAmount = baseAmount + insuranceAmount + deliveryFee;

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
      totalAmount: finalTotalAmount,
      paymentMethod: req.body.paymentMethod || "manual",
      paymentStatus: req.body.paymentStatus || "pending",
      status: "confirmed",
      invoiceNumber: `INV-${Date.now()}`,
      contractNumber: `CON-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`,
      createdAt: new Date(),
      options: options || {},
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
    
    // Superadmin sees everything, Admin sees their agency or legacy data
    const matchQuery = req.user.role === "superadmin" 
      ? {} 
      : { $or: [{ agencyId }, { agencyId: { $exists: false } }] };

    const list = await bookings
      .aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        // Using $unwind with preserveNullAndEmptyArrays in case user was deleted
        { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
        { $sort: { createdAt: -1 } }
      ])
      .toArray();

    // Map to ensure user object exists even if lookup failed
    const formattedList = list.map(b => ({
      ...b,
      user: b.userDetails || { name: "Utilisateur inconnu", email: "N/A" }
    }));

    res.json(formattedList);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const bookings = getCollection("bookings");
    const { id } = req.params;
    const { status } = req.body;
    const agencyId = req.user.agencyId || "default";

    const query = { _id: new ObjectId(id) };
    if (req.user.role !== "superadmin") {
      query.$or = [{ agencyId }, { agencyId: { $exists: false } }];
    }

    const result = await bookings.updateOne(
      query,
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Booking not found or unauthorized" });
    }

    res.json({ message: "Booking status updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating status", error: error.message });
  }
};

export const updateBookingInspection = async (req, res) => {
  try {
    const bookings = getCollection("bookings");
    const { id } = req.params;
    const { type, photos, notes } = req.body;
    const agencyId = req.user.agencyId || "default";

    const updateField = type === 'check-in' ? 'checkInInspection' : 'checkOutInspection';

    const query = { _id: new ObjectId(id) };
    if (req.user.role !== "superadmin") {
      query.$or = [{ agencyId }, { agencyId: { $exists: false } }];
    }

    const result = await bookings.updateOne(
      query,
      { 
        $set: { 
          [updateField]: {
            photos,
            notes,
            date: new Date()
          },
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Booking not found or unauthorized" });
    }

    res.json({ message: "Inspection updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating inspection", error: error.message });
  }
};

export const signContract = async (req, res) => {
  try {
    const bookings = getCollection("bookings");
    const { id } = req.params;
    const { signature } = req.body; // base64 image
    const agencyId = req.user.agencyId || "default";

    const query = { _id: new ObjectId(id) };
    if (req.user.role !== "superadmin") {
      query.$or = [{ agencyId }, { agencyId: { $exists: false } }];
    }

    const result = await bookings.updateOne(
      query,
      { 
        $set: { 
          signature, 
          signedAt: new Date(),
          isSigned: true,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Booking not found or unauthorized" });
    }

    res.json({ message: "Contrat signé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la signature", error: error.message });
  }
};
