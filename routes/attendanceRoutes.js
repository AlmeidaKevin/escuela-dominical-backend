const router = require('express').Router();
const {
  markAttendance,
  markAttendanceBatch,
  getAttendance,
  getReportByClass,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/', getAttendance);
router.post('/', markAttendance);
router.post('/batch', markAttendanceBatch);
router.get('/report/:claseId', getReportByClass);

module.exports = router;
