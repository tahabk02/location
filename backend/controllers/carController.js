import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";

export const getAllCars = async (req, res) => {
  try {
    const cars = getCollection("cars");
    const userRole = req.user?.role;
    const userAgencyId = req.user?.agencyId || "default";

    let query = {};

    // For public (no user), show only default or unassigned cars
    if (!req.user) {
      if (req.query.agencyId) {
        query = { agencyId: req.query.agencyId };
      } else {
        query = { $or: [{ agencyId: "default" }, { agencyId: { $exists: false } }] };
      }
    } 
    // For clients, show their agency cars
    else if (userRole === "client") {
      query = { $or: [{ agencyId: userAgencyId }, { agencyId: { $exists: false } }] };
    }
    // For admin and superadmin, show EVERYTHING to avoid 'empty data' confusion
    else {
      query = {};
    }

    const list = await cars.find(query).toArray();
    res.json(list);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cars", error: error.message });
  }
};

export const getCarById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid car ID format" });
    }
    const cars = getCollection("cars");
    const car = await cars.findOne({ _id: new ObjectId(id) });
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(car);
  } catch (error) {
    console.error("Error fetching car:", error);
    res
      .status(500)
      .json({ message: "Error fetching car", error: error.message });
  }
};

export const createCar = async (req, res) => {
  try {
    const agencyId = req.user?.agencyId || "default";
    console.log(`📥 Creating car for agency ${agencyId}:`, req.body.brand, req.body.model);
    const cars = getCollection("cars");
    const images = Array.isArray(req.body.images)
      ? req.body.images
      : req.body.images
        ? [req.body.images]
        : [];

    const carData = {
      agencyId,
      brand: req.body.brand,
      model: req.body.model,
      category: req.body.category || "Luxe",
      pricePerDay: Number(req.body.pricePerDay),
      seats: Number(req.body.seats) || 5,
      fuel: req.body.fuel || "Essence",
      speed: req.body.speed || "250 km/h",
      image: req.body.image || images[0] || "",
      images,
      videoUrl: req.body.videoUrl || "",
      available: req.body.available !== undefined ? req.body.available : true,
      status: req.body.status || "available",
      insuranceExpiry: req.body.insuranceExpiry || null,
      technicalVisitExpiry: req.body.technicalVisitExpiry || null,
      vignetteExpiry: req.body.vignetteExpiry || null,
      lastOilChangeKm: Number(req.body.lastOilChangeKm) || null,
      nextOilChangeKm: Number(req.body.nextOilChangeKm) || null,
      createdAt: new Date(),
    };

    const result = await cars.insertOne(carData);
    console.log("✅ Car created with ID:", result.insertedId);
    res.status(201).json({ _id: result.insertedId, ...carData });
  } catch (error) {
    console.error("❌ Error creating car:", error);
    res
      .status(500)
      .json({ message: "Error creating car", error: error.message });
  }
};

export const updateCar = async (req, res) => {
  try {
    const cars = getCollection("cars");
    const { id } = req.params;
    const agencyId = req.user?.agencyId || "default";

    const updateData = { ...req.body };
    if (updateData.pricePerDay)
      updateData.pricePerDay = Number(updateData.pricePerDay);
    if (updateData.seats) updateData.seats = Number(updateData.seats);
    if (updateData.images && !Array.isArray(updateData.images)) {
      updateData.images = [updateData.images];
    }
    if (updateData.images && updateData.images.length > 0) {
      updateData.image = updateData.images[0];
    }
    delete updateData._id;
    delete updateData.agencyId; // Don't allow changing agency

    const query = { _id: new ObjectId(id) };
    if (req.user.role !== "superadmin") {
      query.agencyId = agencyId;
    }

    const result = await cars.updateOne(query, { $set: updateData });
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Car not found or unauthorized" });
    }
    
    res.json({ message: "Car updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating car", error: error.message });
  }
};

export const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Format d'ID invalide" });
    }

    const cars = getCollection("cars");
    const agencyId = req.user?.agencyId || "default";
    
    // Superadmin can delete anything, Admin can only delete from their agency
    const query = { _id: new ObjectId(id) };
    if (req.user.role !== "superadmin") {
      query.$or = [{ agencyId }, { agencyId: { $exists: false } }];
    }

    const result = await cars.deleteOne(query);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Voiture non trouvée ou non autorisée" });
    }
    
    res.json({ message: "Voiture supprimée avec succès" });
  } catch (error) {
    console.error("❌ Delete car error:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression", error: error.message });
  }
};

export const updateCarStatus = async (req, res) => {
  try {
    const cars = getCollection("cars");
    const { id } = req.params;
    const { status, available } = req.body;
    const agencyId = req.user?.agencyId || "default";
    
    const query = { _id: new ObjectId(id) };
    if (req.user.role !== "superadmin") {
      query.agencyId = agencyId;
    }

    await cars.updateOne(query, { $set: { status, available, updatedAt: new Date() } });
    res.json({ message: "Car status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating car status", error: error.message });
  }
};

export const getMaintenanceAlerts = async (req, res) => {
  try {
    const cars = getCollection("cars");
    const agencyId = req.user?.agencyId || "default";
    
    const query = req.user.role === "superadmin" ? {} : { agencyId };
    const allCars = await cars.find(query).toArray();
    
    const today = new Date();
    const fifteenDaysLater = new Date(today.getTime() + (15 * 24 * 60 * 60 * 1000));
    const fifteenDaysStr = fifteenDaysLater.toISOString().split('T')[0];

    const alerts = allCars.filter(car => {
      try {
        const hasExpiryAlert = (car.insuranceExpiry && car.insuranceExpiry <= fifteenDaysStr) ||
                              (car.technicalVisitExpiry && car.technicalVisitExpiry <= fifteenDaysStr) ||
                              (car.vignetteExpiry && car.vignetteExpiry <= fifteenDaysStr);
        
        const nextOil = Number(car.nextOilChangeKm);
        const lastOil = Number(car.lastOilChangeKm);
        const hasOilAlert = !isNaN(nextOil) && !isNaN(lastOil) && nextOil > 0 && (nextOil - lastOil <= 1000);
        
        return hasExpiryAlert || hasOilAlert;
      } catch (e) {
        return false;
      }
    });
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching alerts", error: error.message });
  }
};
