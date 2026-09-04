const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      req.admin = await Admin.findById(decoded.id).select('-password');
      if (!req.admin) {
        return res.status(401).json({ message: 'Administrador no encontrado' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'No autorizado, token inválido o expirado' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, no se proporcionó token' });
  }
};

module.exports = { protect };
