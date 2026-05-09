// Manejo centralizado de errores
const errorHandler = (err, req, res, next) => {
  console.error('🔴 Error:', err.message);

  // Error de clave duplicada en MongoDB (ej: email repetido)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      msg: `El campo "${field}" ya está en uso`,
    });
  }

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ msg: messages.join(', ') });
  }

  // Error de cast (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({ msg: 'ID no válido' });
  }

  res.status(err.statusCode || 500).json({
    msg: err.message || 'Error interno del servidor',
  });
};

module.exports = errorHandler;
