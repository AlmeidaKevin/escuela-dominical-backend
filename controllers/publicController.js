const Class         = require('../models/Class');
const WeeklyContent = require('../models/WeeklyContent');
const Notification  = require('../models/Notification');

// ─── Helper ──────────────────────────────────────────────────────────
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// @route  GET /api/public/classes
// @desc   Listado de clases activas (sin datos sensibles) para la página pública
exports.getPublicClasses = async (req, res, next) => {
  try {
    const classes = await Class.find({ activa: true })
      .select('nombre descripcion')
      .sort({ nombre: 1 });
    res.json(classes);
  } catch (err) { next(err); }
};

// @route  GET /api/public/classes/:id/content
// @desc   Contenido semanal publicado de una clase (tema, versículo, actividad, avisos)
exports.getPublicClassContent = async (req, res, next) => {
  try {
    const semana = getMonday(new Date());

    const content = await WeeklyContent.findOne({
      clase: req.params.id,
      semana,
      publicado: true,
    })
      .select('tema versiculo explicacion actividad avisos semana')
      .populate('avisos.autor', 'nombre');

    if (!content)
      return res.json(null); // La clase existe pero no hay contenido publicado esta semana

    res.json(content);
  } catch (err) { next(err); }
};

// @route  GET /api/public/notifications
// @desc   Avisos globales visibles para todos (página pública)
exports.getPublicNotifications = async (req, res, next) => {
  try {
    const notifs = await Notification.find({ tipo: 'global' })
      .select('mensaje fecha')
      .sort({ fecha: -1 })
      .limit(10);
    res.json(notifs);
  } catch (err) { next(err); }
};
