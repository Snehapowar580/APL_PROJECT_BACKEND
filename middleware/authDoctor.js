import jwt from 'jsonwebtoken';

const authDoctor = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Check if the token is present and formatted correctly
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login again.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
   
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

     req.user = { docId: decoded.docId };

    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({
      success: true,
      message: 'Token invalid or expired. Please login again.',
    });
  }
};

export default authDoctor;
