const mongoose = require('mongoose');

const weeklyContentSchema = new mongoose.Schema(
  {
    clase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    // Semana a la que pertenece (lunes de esa semana, normalizado)
    semana: {
      type: Date,
      required: true,
    },
    tema: {
      type: String,
      required: [true, 'El tema es obligatorio'],
      trim: true,
    },
    versiculo: {
      type: String,
      trim: true,
      default: '',
    },
    explicacion: {
      type: String,
      trim: true,
      default: '',
    },
    actividad: {
      type: String,
      trim: true,
      default: '',
    },
    // Avisos del docente para los niños de esa clase
    avisos: [
      {
        texto: String,
        fecha: { type: Date, default: Date.now },
        autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    publicado: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Índice: una sola entrada por clase por semana
weeklyContentSchema.index({ clase: 1, semana: 1 }, { unique: true });

module.exports = mongoose.model('WeeklyContent', weeklyContentSchema);
