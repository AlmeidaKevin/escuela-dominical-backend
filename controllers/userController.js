const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendWelcomeEmail } = require('../utils/emailService');

// @route  GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { rol, search } = req.query;
    const filter = {};
    if (rol && rol !== 'todos') filter.rol = rol;
    if (search) {
      filter.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { email:  { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { next(err); }
};

// @route  GET /api/admin/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) { next(err); }
};

// @route  POST /api/admin/users
// @desc   Admin crea usuario → genera contraseña temporal → envía correo
exports.createUser = async (req, res, next) => {
  try {
    const { nombre, email, rol } = req.body;
    if (!nombre || !email)
      return res.status(400).json({ msg: 'Nombre y email son obligatorios' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'El email ya está registrado' });

    // Generar contraseña temporal aleatoria de 8 caracteres
    const tempPassword = crypto.randomBytes(4).toString('hex'); // ej: "a3f9c1d2"
    const hash = await bcrypt.hash(tempPassword, 10);

    const user = await User.create({
      nombre,
      email,
      password: hash,
      rol: rol || 'niño',
      mustChangePassword: true,
    });

    // Enviar correo de bienvenida con las credenciales
    try {
      await sendWelcomeEmail({ nombre, email, password: tempPassword, rol: user.rol });
    } catch (emailErr) {
      // No bloqueamos si el correo falla — logeamos y continuamos
      console.error('⚠️  Error enviando correo de bienvenida:', emailErr.message);
    }

    res.status(201).json({
      user,
      msg: `Usuario creado. Se envió un correo a ${email} con las credenciales.`,
    });
  } catch (err) { next(err); }
};

// @route  PUT /api/admin/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { nombre, email, rol, activo } = req.body;
    const update = {};
    if (nombre !== undefined) update.nombre = nombre;
    if (email  !== undefined) update.email  = email;
    if (rol    !== undefined) update.rol    = rol;
    if (activo !== undefined) update.activo = activo;

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true, runValidators: true,
    });
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) { next(err); }
};

// @route  PUT /api/admin/users/:id/reset-password
// @desc   Admin resetea contraseña del usuario (genera nueva temporal y manda correo)
exports.adminResetPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    const tempPassword = crypto.randomBytes(4).toString('hex');
    user.password = await bcrypt.hash(tempPassword, 10);
    user.mustChangePassword = true;
    await user.save({ validateBeforeSave: false });

    try {
      await sendWelcomeEmail({
        nombre: user.nombre,
        email: user.email,
        password: tempPassword,
        rol: user.rol,
      });
    } catch (emailErr) {
      console.error('⚠️  Error enviando correo de reset:', emailErr.message);
    }

    res.json({ msg: `Contraseña reseteada. Se envió un correo a ${user.email}.` });
  } catch (err) { next(err); }
};

// @route  DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
    res.json({ msg: 'Usuario eliminado correctamente' });
  } catch (err) { next(err); }
};
