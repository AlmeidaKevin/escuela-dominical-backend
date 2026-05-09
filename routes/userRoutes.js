const router = require('express').Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  adminResetPassword,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/',                    getUsers);
router.get('/:id',                 getUserById);
router.post('/',                   createUser);
router.put('/:id',                 updateUser);
router.put('/:id/reset-password',  adminResetPassword);
router.delete('/:id',              deleteUser);

module.exports = router;
