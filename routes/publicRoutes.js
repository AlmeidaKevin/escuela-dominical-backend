const router = require('express').Router();
const {
  getPublicClasses,
  getPublicClassContent,
  getPublicNotifications,
} = require('../controllers/publicController');

// Sin autenticación — para la página pública de los niños
router.get('/classes',              getPublicClasses);
router.get('/classes/:id/content',  getPublicClassContent);
router.get('/notifications',        getPublicNotifications);

module.exports = router;
