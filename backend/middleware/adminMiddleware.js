/**
 * adminMiddleware.js
 * Restricts access to admin users only.
 * Must be used after the `protect` middleware (which sets req.user).
 */

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({
    success: false,
    message: "Access denied: Admins only",
  });
};

module.exports = adminOnly;
