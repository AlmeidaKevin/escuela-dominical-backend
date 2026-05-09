const router = require('express').Router();
const {
  login,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Públicas
router.post('/login',                    login);
router.post('/forgot-password',          forgotPassword);
router.put('/reset-password/:token',     resetPassword);

// Protegidas (cualquier rol autenticado)
router.get('/me',                        protect, getMe);
router.put('/change-password',           protect, changePassword);
router.put('/profile',                   protect, updateProfile);

module.exports = router;
