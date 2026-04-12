const jwt = require('jsonwebtoken');

/**
 * Express middleware that enforces authentication.
 * Expects:  Authorization: Bearer <token>
 * Sets:     req.userId  (MongoDB ObjectId string of the authenticated user)
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';

  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired — please log in again' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = requireAuth;
