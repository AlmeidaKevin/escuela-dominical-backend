const router = require('express').Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  getMyClasses,
  getClassStudents,
} = require('../controllers/classController');
const {
  markAttendanceBatch,
  getAttendanceByClass,
  getNotifications,
  getWeeklyContent,
  updateWeeklyContent,
  addAviso,
} = require('../controllers/docenteController');

// Todas las rutas requieren docente autenticado
router.use(protect, authorize('docente'));

// Clases asignadas
router.get('/classes',                    getMyClasses);
router.get('/classes/:id/students',       getClassStudents);

// Asistencia
router.post('/attendance/batch',          markAttendanceBatch);
router.get('/attendance/:claseId',        getAttendanceByClass);

// Notificaciones (recibir)
router.get('/notifications',              getNotifications);

// Contenido semanal
router.get('/weekly/:claseId',            getWeeklyContent);
router.put('/weekly/:claseId',            updateWeeklyContent);
router.post('/weekly/:claseId/aviso',     addAviso);

module.exports = router;
