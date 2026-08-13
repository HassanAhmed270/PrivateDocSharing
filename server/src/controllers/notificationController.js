import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      organization: req.organizationId,
      recipientType: "internal_user",
      recipient: req.user._id,
    })
      .populate(
        "documentRequest",
        "status message createdAt"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        notifications,
      },
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching notifications.",
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        organization: req.organizationId,
        recipientType: "internal_user",
        recipient: req.user._id,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data: {
        notification,
      },
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating notification.",
    });
  }
};
