import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (process.env.DEV_KEY === 'true') { next(); return; }
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded._id).select('-password');
      req.user.token = token;
      console.log("Handled by instance:", process.env.HOSTNAME);
      next();
    } else {
      res.status(401).json({ ec: 401, em: 'Not authorized, no token' });
    }
  }
  catch (error) {
    console.error(error);
    res.status(401).json({ ec: 401, em: 'Not authorized, token failed' });
  }
};

export const admin = (req, res, next) => {
  if (process.env.DEV_KEY === 'true') { next(); return; }
  if (req.user && req.user.isManager) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a manager' });
  }
};