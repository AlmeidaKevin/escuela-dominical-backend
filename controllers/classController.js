const Class = require('../models/Class');
const User  = require('../models/User');

// ─── ADMIN ──────────────────────────────────────────────────────────

// @route  GET /api/admin/classes
exports.getClasses = async (req, res, next) => {
  try {
    const classes = await Class.find()
      .populate('docente', 'nombre email')
      .populate('estudiantes', 'nombre email rol')
      .sort({ createdAt: -1 });
    res.json(classes);
  } catch (err) { next(err); }
};

// @route  GET /api/admin/classes/:id
exports.getClassById = async (req, res, next) => {
  try {
    const clase = await Class.findById(req.params.id)
      .populate('docente', 'nombre email')
      .populate('estudiantes', 'nombre email rol');
    if (!clase) return res.status(404).json({ msg: 'Clase no encontrada' });
    res.json(clase);
  } catch (err) { next(err); }
};

// @route  POST /api/admin/classes
exports.createClass = async (req, res, next) => {
  try {
    const { nombre, descripcion, docente } = req.body;
    if (!nombre) return res.status(400).json({ msg: 'El nombre es obligatorio' });

    const clase = await Class.create({
      nombre,
      descripcion: descripcion || '',
      docente: docente || null,
    });
    await clase.populate('docente', 'nombre email');
    res.status(201).json(clase);
  } catch (err) { next(err); }
};

// @route  PUT /api/admin/classes/:id
exports.updateClass = async (req, res, next) => {
  try {
    const { nombre, descripcion, docente, activa } = req.body;
    const update = {};
    if (nombre      !== undefined) update.nombre      = nombre;
    if (descripcion !== undefined) update.descripcion = descripcion;
    if (docente     !== undefined) update.docente     = docente || null;
    if (activa      !== undefined) update.activa      = activa;

    const clase = await Class.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('docente', 'nombre email')
      .populate('estudiantes', 'nombre email rol');
    if (!clase) return res.status(404).json({ msg: 'Clase no encontrada' });
    res.json(clase);
  } catch (err) { next(err); }
};

// @route  DELETE /api/admin/classes/:id
exports.deleteClass = async (req, res, next) => {
  try {
    const clase = await Class.findByIdAndDelete(req.params.id);
    if (!clase) return res.status(404).json({ msg: 'Clase no encontrada' });
    res.json({ msg: 'Clase eliminada correctamente' });
  } catch (err) { next(err); }
};

// @route  PUT /api/admin/classes/:id/students
// @desc   Reemplaza la lista de estudiantes de la clase (array de IDs)
exports.setStudents = async (req, res, next) => {
  try {
    const { estudiantes } = req.body; // array de ObjectIds
    if (!Array.isArray(estudiantes))
      return res.status(400).json({ msg: 'Se esperaba un array de IDs' });

    const clase = await Class.findByIdAndUpdate(
      req.params.id,
      { estudiantes },
      { new: true }
    )
      .populate('docente', 'nombre email')
      .populate('estudiantes', 'nombre email rol');

    if (!clase) return res.status(404).json({ msg: 'Clase no encontrada' });
    res.json(clase);
  } catch (err) { next(err); }
};

// @route  POST /api/admin/classes/:id/students/:estudianteId
// @desc   Agrega un estudiante a la clase
exports.addStudent = async (req, res, next) => {
  try {
    const clase = await Class.findById(req.params.id);
    if (!clase) return res.status(404).json({ msg: 'Clase no encontrada' });

    const { estudianteId } = req.params;
    if (clase.estudiantes.map(e => e.toString()).includes(estudianteId))
      return res.status(400).json({ msg: 'El estudiante ya está en esta clase' });

    clase.estudiantes.push(estudianteId);
    await clase.save();
    await clase.populate('estudiantes', 'nombre email rol');
    await clase.populate('docente', 'nombre email');
    res.json(clase);
  } catch (err) { next(err); }
};

// @route  DELETE /api/admin/classes/:id/students/:estudianteId
// @desc   Quita un estudiante de la clase
exports.removeStudent = async (req, res, next) => {
  try {
    const clase = await Class.findById(req.params.id);
    if (!clase) return res.status(404).json({ msg: 'Clase no encontrada' });

    clase.estudiantes = clase.estudiantes.filter(
      e => e.toString() !== req.params.estudianteId
    );
    await clase.save();
    await clase.populate('estudiantes', 'nombre email rol');
    await clase.populate('docente', 'nombre email');
    res.json(clase);
  } catch (err) { next(err); }
};

// ─── DOCENTE ────────────────────────────────────────────────────────

// @route  GET /api/docente/classes
// @desc   Clases asignadas al docente autenticado
exports.getMyClasses = async (req, res, next) => {
  try {
    const classes = await Class.find({ docente: req.user._id })
      .populate('estudiantes', 'nombre email')
      .sort({ createdAt: -1 });
    res.json(classes);
  } catch (err) { next(err); }
};

// @route  GET /api/docente/classes/:id/students
// @desc   Listado de estudiantes de una clase (solo si el docente es el asignado)
exports.getClassStudents = async (req, res, next) => {
  try {
    const clase = await Class.findById(req.params.id)
      .populate('estudiantes', 'nombre email');

    if (!clase) return res.status(404).json({ msg: 'Clase no encontrada' });

    // Verificar que el docente sea el dueño de la clase
    if (clase.docente?.toString() !== req.user._id.toString())
      return res.status(403).json({ msg: 'No tienes acceso a esta clase' });

    res.json(clase.estudiantes);
  } catch (err) { next(err); }
};
