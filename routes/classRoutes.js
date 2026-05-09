const router = require('express').Router();
const {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  setStudents,
  addStudent,
  removeStudent,
} = require('../controllers/classController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/',                              getClasses);
router.get('/:id',                           getClassById);
router.post('/',                             createClass);
router.put('/:id',                           updateClass);
router.delete('/:id',                        deleteClass);

// Gestión de estudiantes
router.put('/:id/students',                       setStudents);          // reemplaza lista completa
router.post('/:id/students/:estudianteId',         addStudent);           // agrega uno
router.delete('/:id/students/:estudianteId',       removeStudent);        // quita uno

module.exports = router;
