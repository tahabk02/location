import { getCollection } from "../config/db.js";
import { ObjectId } from "mongodb";

export const getAdminNotifications = async (req, res) => {
  try {
    const notifications = getCollection("notifications");
    const agencyId = req.user?.agencyId || "default";

    // Get notifications from the real notifications collection
    const list = await notifications
      .find({ agencyId })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    // Map to a common format for the frontend
    const formattedList = list.map(n => ({
      id: n._id,
      message: n.message,
      time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : "Récemment",
      type: n.type === 'booking' ? "success" : "info",
      icon: n.type === 'booking' ? "Calendar" : "Users",
      read: n.read || false
    }));

    res.json(formattedList);
  } catch (error) {
    console.error("Error in getAdminNotifications:", error);
    res.status(500).json({ message: "Error fetching notifications", error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notifications = getCollection("notifications");
    const { id } = req.params;
    const agencyId = req.user?.agencyId || "default";

    await notifications.updateOne(
      { _id: new ObjectId(id), agencyId },
      { $set: { read: true } }
    );

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification", error: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const notifications = getCollection("notifications");
    const agencyId = req.user?.agencyId || "default";

    await notifications.updateMany(
      { agencyId, read: false },
      { $set: { read: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notifications", error: error.message });
  }
};
