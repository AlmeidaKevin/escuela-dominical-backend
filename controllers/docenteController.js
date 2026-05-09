const Attendance    = require('../models/Attendance');
const Notification  = require('../models/Notification');
const WeeklyContent = require('../models/WeeklyContent');
const Class         = require('../models/Class');

// ─── ASISTENCIA ─────────────────────────────────────────────────────

// @route  POST /api/docente/attendance/batch
// @desc   Docente registra asistencia de toda su clase de un golpe
exports.markAttendanceBatch = async (req, res, next) => {
  try {
    const { registros } = req.body;
    if (!Array.isArray(registros) || registros.length === 0)
      return res.status(400).json({ msg: 'Se requiere un array de registros' });

    // Verificar que la clase pertenece al docente
    const claseId = registros[0].clase;
    const clase = await Class.findById(claseId);
    if (!clase) return res.status(404).json({ msg: 'Clase no encontrada' });
    if (clase.docente?.toString() !== req.user._id.toString())
      return res.status(403).json({ msg: 'No tienes permiso sobre esta clase' });

    const fechaNorm = new Date(registros[0].fecha || Date.now());
    fechaNorm.setHours(0, 0, 0, 0);

    const ops = registros.map(r => ({
      updateOne: {
        filter: { clase: r.clase, estudiante: r.estudiante, fecha: fechaNorm },
        update: { $set: { presente: r.presente ?? false } },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(ops);
    res.json({ msg: `${registros.length} registros guardados` });
  } catch (err) { next(err); }
};

// @route  GET /api/docente/attendance/:claseId
// @desc   Ver historial de asistencia de una clase
exports.getAttendanceByClass = async (req, res, next) => {
  try {
    const clase = await Class.findById(req.params.claseId);
    if (!clase) return res.status(404).json({ msg: 'Clase no encontrada' });
    if (clase.docente?.toString() !== req.user._id.toString())
      return res.status(403).json({ msg: 'No tienes permiso sobre esta clase' });

    const records = await Attendance.find({ clase: req.params.claseId })
      .populate('estudiante', 'nombre email')
      .sort({ fecha: -1 });

    res.json(records);
  } catch (err) { next(err); }
};

// ─── NOTIFICACIONES (recibir) ────────────────────────────────────────

// @route  GET /api/docente/notifications
// @desc   Docente recibe notificaciones globales del admin
exports.getNotifications = async (req, res, next) => {
  try {
    const notifs = await Notification.find({ tipo: { $in: ['global', 'docente'] } })
      .populate('autor', 'nombre')
      .sort({ fecha: -1 })
      .limit(30);
    res.json(notifs);
  } catch (err) { next(err); }
};

// ─── CONTENIDO SEMANAL ───────────────────────────────────────────────

// @route  GET /api/docente/weekly/:claseId
// @desc   Ver o crear el contenido de la semana actual para una clase
exports.getWeeklyContent = async (req, res, next) => {
  try {
    const clase = await Class.findById(req.params.claseId);
    if (!clase) return res.status(404).json({ msg: 'Clase no encontrada' });
    if (clase.docente?.toString() !== req.user._id.toString())
      return res.status(403).json({ msg: 'No tienes permiso sobre esta clase' });

    const semana = getMonday(new Date());
    let content = await WeeklyContent.findOne({ clase: req.params.claseId, semana })
      .populate('avisos.autor', 'nombre');

    if (!content) {
      content = await WeeklyContent.create({ clase: req.params.claseId, semana });
    }

    res.json(content);
  } catch (err) { next(err); }
};

// @route  PUT /api/docente/weekly/:claseId
// @desc   Docente actualiza tema, versículo, explicación, actividad de la semana
exports.updateWeeklyContent = async (req, res, next) => {
  try {
    const clase = await Class.findById(req.params.claseId);
    if (!clase) return res.status(404).json({ msg: 'Clase no encontrada' });
    if (clase.docente?.toString() !== req.user._id.toString())
      return res.status(403).json({ msg: 'No tienes permiso sobre esta clase' });

    const semana = getMonday(new Date());
    const { tema, versiculo, explicacion, actividad, publicado } = req.body;
    const update = {};
    if (tema        !== undefined) update.tema        = tema;
    if (versiculo   !== undefined) update.versiculo   = versiculo;
    if (explicacion !== undefined) update.explicacion = explicacion;
    if (actividad   !== undefined) update.actividad   = actividad;
    if (publicado   !== undefined) update.publicado   = publicado;

    const content = await WeeklyContent.findOneAndUpdate(
      { clase: req.params.claseId, semana },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('avisos.autor', 'nombre');

    res.json(content);
  } catch (err) { next(err); }
};

// @route  POST /api/docente/weekly/:claseId/aviso
// @desc   Docente publica un aviso para su grupo
exports.addAviso = async (req, res, next) => {
  try {
    const { texto } = req.body;
    if (!texto?.trim()) return res.status(400).json({ msg: 'El texto del aviso es obligatorio' });

    const semana = getMonday(new Date());
    const content = await WeeklyContent.findOneAndUpdate(
      { clase: req.params.claseId, semana },
      {
        $push: {
          avisos: { texto: texto.trim(), autor: req.user._id, fecha: new Date() },
        },
      },
      { new: true, upsert: true }
    ).populate('avisos.autor', 'nombre');

    res.json(content);
  } catch (err) { next(err); }
};

// ─── Helper: obtener el lunes de la semana actual ────────────────────
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=dom, 1=lun ...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
