import Organization from "../models/Organization.js";
import User from "../models/User.js";

export const createOrganization = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Organization name is required.",
      });
    }

    if (req.user.organization) {
      return res.status(409).json({
        success: false,
        message: "User already belongs to an organization.",
      });
    }

    const organization = await Organization.create({
      name: name.trim(),
      owner: req.user._id,
      members: [req.user._id],
    });

    await User.findByIdAndUpdate(req.user._id, {
      organization: organization._id,
      role: "admin",
    });

    return res.status(201).json({
      success: true,
      message: "Organization created successfully.",
      data: {
        organization: {
          id: organization._id,
          name: organization.name,
          owner: organization.owner,
          members: organization.members,
          isActive: organization.isActive,
        },
      },
    });
  } catch (error) {
    console.error("Create organization error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating organization.",
    });
  }
};

export const getMyOrganization = async (req, res) => {
  try {
    if (!req.user.organization) {
      return res.status(404).json({
        success: false,
        message: "User does not belong to an organization.",
      });
    }

    const organization = await Organization.findOne({
      _id: req.organizationId,
      isActive: true,
    }).populate("members", "name email role organization");

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        organization,
      },
    });
  } catch (error) {
    console.error("Get organization error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching organization.",
    });
  }
};

export const getOrganizationMembers = async (req, res) => {
  try {
    const organization = await Organization.findOne({
      _id: req.organizationId,
      isActive: true,
    }).populate("members", "name email role organization");

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        members: organization.members,
      },
    });
  } catch (error) {
    console.error("Get organization members error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching organization members.",
    });
  }
};