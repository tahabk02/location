import { getCollection } from "../config/db.js";

export const getSettings = async (req, res) => {
  try {
    const settings = getCollection("settings");
    let agencyId = req.query.agencyId || req.header("x-agency-id") || req.user?.agencyId || "default";
    
    let data = await settings.findOne({ agencyId });
    
    // If missing, check if it's the 'default' one
    if (!data && (agencyId === "default" || req.user?.role === "superadmin")) {
        // Find ANY settings if we are superadmin and 'default' is missing
        data = await settings.findOne({});
    }

    const defaults = {
      agencyId: "default",
      name: "AVENIR KAMIL CAR",
      email: "contact@avenirkamilcar.ma",
      phone: "+212 661 000 000",
      address: "Casablanca, Maroc",
      currency: "DH",
      taxRate: "20",
      logoUrl: "",
      primaryColor: "#2563eb",
      galleryImages: [
        "https://images.pexels.com/photos/1237116/pexels-photo-1237116.jpeg",
        "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
        "https://images.pexels.com/photos/vehicle-road-driving-speed-1000768.jpeg",
        "https://images.pexels.com/photos/981129/pexels-photo-981129.jpeg"
      ],
      galleryVideoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    };

    if (!data) {
      data = { ...defaults, agencyId: agencyId || "default" };
      // Don't auto-insert here to avoid pollution, just return defaults
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching settings", error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = getCollection("settings");
    // If superadmin, allow updating by agencyId in body or query, else use user's agencyId
    const agencyId = (req.user?.role === "superadmin" ? (req.body.agencyId || req.query.agencyId) : null) || req.user?.agencyId || "default";
    
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.agencyId;
    
    await settings.updateOne({ agencyId }, { $set: updateData }, { upsert: true });
    res.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Error updating settings", error: error.message });
  }
};
