const Notification = require('../models/Notification');

// @route  GET /api/admin/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const notifs = await Notification.find()
      .populate('autor', 'nombre')
      .sort({ fecha: -1 })
      .limit(50);
    res.json(notifs);
  } catch (err) { next(err); }
};

// @route  POST /api/admin/notifications
exports.createNotification = async (req, res, next) => {
  try {
    const { mensaje, tipo } = req.body;
    if (!mensaje?.trim())
      return res.status(400).json({ msg: 'El mensaje es obligatorio' });

    const notif = await Notification.create({
      mensaje: mensaje.trim(),
      tipo: tipo || 'global',
      autor: req.user._id,
    });
    await notif.populate('autor', 'nombre');
    res.status(201).json(notif);
  } catch (err) { next(err); }
};

// @route  DELETE /api/admin/notifications/:id
exports.deleteNotification = async (req, res, next) => {
  try {
    const notif = await Notification.findByIdAndDelete(req.params.id);
    if (!notif) return res.status(404).json({ msg: 'Notificación no encontrada' });
    res.json({ msg: 'Notificación eliminada' });
  } catch (err) { next(err); }
};
