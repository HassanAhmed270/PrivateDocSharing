import ExternalRecipient from "../models/ExternalRecipient.js";

export const createExternalRecipient = async (req, res) => {
  try {
    const {
      name,
      email,
      company,
      phone,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingRecipient = await ExternalRecipient.findOne({
      organization: req.organizationId,
      email: normalizedEmail,
    });

    if (existingRecipient) {
      return res.status(409).json({
        success: false,
        message: "External recipient already exists.",
      });
    }

    const recipient = await ExternalRecipient.create({
      organization: req.organizationId,
      name: name.trim(),
      email: normalizedEmail,
      company: company?.trim() || "",
      phone: phone?.trim() || "",
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "External recipient created successfully.",
      data: {
        recipient,
      },
    });
  } catch (error) {
    console.error("Create external recipient error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating external recipient.",
    });
  }
};


export const getExternalRecipients = async (req, res) => {
  try {
    const recipients = await ExternalRecipient.find({
      organization: req.organizationId,
      status: "active",
    })
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        recipients,
      },
    });
  } catch (error) {
    console.error("Get external recipients error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching external recipients.",
    });
  }
};


export const getExternalRecipientById = async (req, res) => {
  try {
    const { id } = req.params;

    const recipient = await ExternalRecipient.findOne({
      _id: id,
      organization: req.organizationId,
      status: "active",
    }).populate("createdBy", "name email role");

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "External recipient not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        recipient,
      },
    });
  } catch (error) {
    console.error("Get external recipient error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching external recipient.",
    });
  }
};


export const deactivateExternalRecipient = async (req, res) => {
  try {
    const { id } = req.params;

    const recipient = await ExternalRecipient.findOneAndUpdate(
      {
        _id: id,
        organization: req.organizationId,
        status: "active",
      },
      {
        status: "inactive",
      },
      {
        new: true,
      }
    );

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "External recipient not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "External recipient deactivated successfully.",
      data: {
        recipient,
      },
    });
  } catch (error) {
    console.error("Deactivate external recipient error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deactivating external recipient.",
    });
  }
};