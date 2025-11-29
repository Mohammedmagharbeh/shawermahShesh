const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ msg: "User context missing" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Insufficient permissions" });
    }

    return next();
  };

module.exports = requireRole;
