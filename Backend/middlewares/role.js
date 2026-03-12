export const allowRoles = (...roles) => {
  return (req, res, next) => {

    // Check if user exists in request
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }

    // Check if user's role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access denied"
      });
    }

    // Allow request to continue
    next();

  };
};