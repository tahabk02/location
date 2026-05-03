import { getCollection } from "../config/db.js";

export const getSettings = async (req, res) => {
  try {
    const settings = getCollection("settings");
    let data = await settings.findOne({});
    
    const defaults = {
      name: "LuxeDrive Premium",
      email: "contact@luxedrive.ma",
      phone: "+212 600 000 000",
      address: "Boulevard d'Anfa, Casablanca",
      currency: "DH",
      taxRate: "20",
      galleryImages: [
        "https://images.pexels.com/photos/1237116/pexels-photo-1237116.jpeg",
        "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg",
        "https://images.pexels.com/photos/vehicle-road-driving-speed-1000768.jpeg",
        "https://images.pexels.com/photos/981129/pexels-photo-981129.jpeg"
      ],
      galleryVideoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    };

    if (!data) {
      data = { ...defaults };
      await settings.insertOne(data);
    } else {
      // Force defaults if gallery is empty
      let needsUpdate = false;
      if (!data.galleryImages || data.galleryImages.length === 0) {
        data.galleryImages = defaults.galleryImages;
        needsUpdate = true;
      }
      if (!data.galleryVideoUrl) {
        data.galleryVideoUrl = defaults.galleryVideoUrl;
        needsUpdate = true;
      }
      if (needsUpdate) {
        await settings.updateOne({ _id: data._id }, { $set: { 
          galleryImages: data.galleryImages,
          galleryVideoUrl: data.galleryVideoUrl 
        }});
      }
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching settings" });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = getCollection("settings");
    const updateData = { ...req.body };
    delete updateData._id;
    await settings.updateOne({}, { $set: updateData }, { upsert: true });
    res.json({ message: "Settings updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating settings" });
  }
};
