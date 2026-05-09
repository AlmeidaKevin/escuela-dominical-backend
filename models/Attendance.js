const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    clase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    estudiante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fecha: {
      type: Date,
      required: true,
      default: Date.now,
    },
    presente: {
      type: Boolean,
      default: false,
    },
    observacion: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// Índice compuesto para evitar duplicados por clase+estudiante+fecha
attendanceSchema.index({ clase: 1, estudiante: 1, fecha: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
