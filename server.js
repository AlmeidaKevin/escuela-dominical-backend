require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const connectDB  = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const createAdmin  = require('./utils/createAdmin');

const app = express();

// ─── Middlewares globales ────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Rutas públicas (sin autenticación) ─────────────────────────────
app.use('/api/public',  require('./routes/publicRoutes'));
app.use('/api/auth',    require('./routes/authRoutes'));

// ─── Rutas protegidas — Admin ────────────────────────────────────────
app.use('/api/admin/users',         require('./routes/userRoutes'));
app.use('/api/admin/classes',       require('./routes/classRoutes'));
app.use('/api/admin/attendance',    require('./routes/attendanceRoutes'));
app.use('/api/admin/notifications', require('./routes/notificationRoutes'));

// ─── Rutas protegidas — Docente ──────────────────────────────────────
app.use('/api/docente', require('./routes/docenteRoutes'));

// ─── Health check ────────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ─── 404 ─────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ msg: `Ruta no encontrada: ${req.originalUrl}` })
);

// ─── Manejo centralizado de errores ──────────────────────────────────
app.use(errorHandler);

// ─── Arranque ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await createAdmin();
  app.listen(PORT, () =>
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  );
});


