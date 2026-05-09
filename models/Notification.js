const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    mensaje: {
      type: String,
      required: [true, 'El mensaje es obligatorio'],
      trim: true,
    },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // 'global' = visible en página pública y para docentes
    // 'docente' = solo visible para docentes autenticados
    tipo: {
      type: String,
      enum: ['global', 'docente'],
      default: 'global',
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
