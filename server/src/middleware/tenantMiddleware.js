export const requireOrganization = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (!req.user.organization) {
    return res.status(403).json({
      success: false,
      message: "User does not belong to an organization.",
    });
  }

  req.organizationId = req.user.organization.toString();

  next();
};