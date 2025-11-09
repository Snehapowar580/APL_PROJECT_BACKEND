import jwt from 'jsonwebtoken';

/**
 * Middleware to authenticate and authorize admin users using JWT
 */
const authAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing or malformed.',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Confirm admin identifier exists
    if (!decoded || (!decoded.adminId && decoded.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or missing admin credentials in token.',
      });
    }

    // 🧾 Attach decoded token for downstream use
    req.admin = decoded;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.',
      });
    }

    console.error('❌ Admin Auth Error:', error.message);
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to access this resource.',
    });
  }
};

export default authAdmin;
