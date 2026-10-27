// Middleware to ensure user is logged in via Express session
const ensureAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: 'Authentication required. Please log in to continue.',
  });
};

module.exports = {
  ensureAuthenticated,
};
