const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ msg: 'No autorizado: token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Adjuntamos el usuario completo (sin password) al request
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ msg: 'No autorizado: usuario no encontrado' });
    }
    next();
  } catch (err) {
    res.status(401).json({ msg: 'No autorizado: token inválido' });
  }
};

// Solo permite ciertos roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        msg: `Acceso denegado: se requiere rol ${roles.join(' o ')}`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
