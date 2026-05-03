import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";

export const createBooking = async (req, res) => {
  try {
    const bookings = getCollection("bookings");
    const cars = getCollection("cars");
    const { carId, startDate, endDate, location, options } = req.body;
    const bookingLocation = location || options?.location || "Maroc";
    const userId = req.user.id;

    // Get car info for the invoice
    const car = await cars.findOne({ _id: new ObjectId(carId) });
    if (!car) return res.status(404).json({ message: "Car not found" });

    // Calculate total amount
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) || 1;
    const totalAmount = days * car.pricePerDay;

    const booking = {
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
      createdAt: new Date(),
      options: options || {},
    };

    const result = await bookings.insertOne(booking);
    res.status(201).json({ _id: result.insertedId, ...booking });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating booking", error: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = getCollection("bookings");
    const list = await bookings
      .aggregate([
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
    await bookings.updateOne({ _id: new ObjectId(id) }, { $set: { status } });
    res.json({ message: "Booking status updated" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating booking", error: error.message });
  }
};
