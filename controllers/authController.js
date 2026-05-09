const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../utils/emailService');

// ─── Helpers ────────────────────────────────────────────────────────
const signToken = (user) =>
  jwt.sign({ id: user._id, rol: user.rol }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

// @route  POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: 'Email y contraseña son obligatorios' });

    const user = await User.findOne({ email }).select('+password');
    if (!user)
      return res.status(400).json({ msg: 'Credenciales inválidas' });

    if (!user.activo)
      return res.status(403).json({ msg: 'Esta cuenta está desactivada' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: 'Credenciales inválidas' });

    const token = signToken(user);

    res.json({
      token,
      mustChangePassword: user.mustChangePassword,
      user: {
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json(req.user);
};

// @route  PUT /api/auth/change-password
// @desc   Cambio de contraseña (usuario autenticado, incluye primer ingreso)
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ msg: 'Contraseña actual y nueva son obligatorias' });
    if (newPassword.length < 6)
      return res.status(400).json({ msg: 'La nueva contraseña debe tener al menos 6 caracteres' });

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: 'La contraseña actual es incorrecta' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await user.save();

    res.json({ msg: 'Contraseña actualizada correctamente' });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/auth/forgot-password
// @desc   Solicitar enlace de recuperación de contraseña
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ msg: 'El email es obligatorio' });

    const user = await User.findOne({ email });
    // No revelamos si el email existe o no (seguridad)
    if (!user)
      return res.json({ msg: 'Si el correo existe, recibirás un enlace en breve' });

    // Generar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 min
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await sendPasswordResetEmail({
      nombre: user.nombre,
      email: user.email,
      resetUrl,
    });

    res.json({ msg: 'Si el correo existe, recibirás un enlace en breve' });
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/auth/reset-password/:token
// @desc   Restablecer contraseña con el token del correo
exports.resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ msg: 'La contraseña debe tener al menos 6 caracteres' });

    const hashed = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user)
      return res.status(400).json({ msg: 'El enlace es inválido o ha expirado' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ msg: 'Contraseña restablecida. Ya puedes iniciar sesión.' });
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/auth/profile
// @desc   Actualizar perfil propio (nombre, email)
exports.updateProfile = async (req, res, next) => {
  try {
    const { nombre, email } = req.body;
    const update = {};
    if (nombre) update.nombre = nombre;
    if (email) update.email = email;

    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
      runValidators: true,
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
};
