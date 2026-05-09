const router = require('express').Router();
const {
  getNotifications,
  createNotification,
  deleteNotification,
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/', getNotifications);
router.post('/', createNotification);
router.delete('/:id', deleteNotification);

module.exports = router;
