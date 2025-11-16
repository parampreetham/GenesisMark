import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  // 1. Get the token from the 'Authorization' header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided, authorization denied.' });
  }

  // 2. Check for 'Bearer <token>' format
  const token = authHeader.split(' ')[1]; // Get the token part
  if (!token) {
    return res.status(401).json({ error: 'Token is malformed, authorization denied.' });
  }

  try {
    // 3. Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 4. If valid, add the user's info to the request object
    // This makes req.user available in our /upload and /verify routes
    req.user = decoded.user;
    
    // 5. Pass control to the next function (the endpoint handler)
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid.' });
  }
};

export default authMiddleware;