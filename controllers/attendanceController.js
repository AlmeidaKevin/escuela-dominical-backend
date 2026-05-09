const Attendance = require('../models/Attendance');

// @route  POST /api/admin/attendance/batch
exports.markAttendanceBatch = async (req, res, next) => {
  try {
    const { registros } = req.body;
    if (!Array.isArray(registros) || registros.length === 0)
      return res.status(400).json({ msg: 'Se requiere un array de registros' });

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

// @route  POST /api/admin/attendance
exports.markAttendance = async (req, res, next) => {
  try {
    const { clase, estudiante, fecha, presente } = req.body;
    if (!clase || !estudiante)
      return res.status(400).json({ msg: 'Clase y estudiante son obligatorios' });

    const fechaNorm = new Date(fecha || Date.now());
    fechaNorm.setHours(0, 0, 0, 0);

    const record = await Attendance.findOneAndUpdate(
      { clase, estudiante, fecha: fechaNorm },
      { presente: presente ?? false },
      { upsert: true, new: true }
    );
    res.status(201).json(record);
  } catch (err) { next(err); }
};

// @route  GET /api/admin/attendance
exports.getAttendance = async (req, res, next) => {
  try {
    const { clase, fecha, estudiante } = req.query;
    const filter = {};
    if (clase)      filter.clase      = clase;
    if (estudiante) filter.estudiante = estudiante;
    if (fecha) {
      const d = new Date(fecha); d.setHours(0, 0, 0, 0);
      const next = new Date(d);  next.setDate(next.getDate() + 1);
      filter.fecha = { $gte: d, $lt: next };
    }
    const records = await Attendance.find(filter)
      .populate('estudiante', 'nombre email')
      .populate('clase', 'nombre')
      .sort({ fecha: -1 });
    res.json(records);
  } catch (err) { next(err); }
};

// @route  GET /api/admin/attendance/report/:claseId
exports.getReportByClass = async (req, res, next) => {
  try {
    const records = await Attendance.find({ clase: req.params.claseId })
      .populate('estudiante', 'nombre email');

    const map = {};
    records.forEach(r => {
      const id = r.estudiante._id.toString();
      if (!map[id]) map[id] = { estudiante: r.estudiante, total: 0, presentes: 0 };
      map[id].total++;
      if (r.presente) map[id].presentes++;
    });

    const report = Object.values(map).map(e => ({
      ...e,
      porcentaje: e.total > 0 ? Math.round((e.presentes / e.total) * 100) : 0,
    }));
    res.json(report);
  } catch (err) { next(err); }
};
