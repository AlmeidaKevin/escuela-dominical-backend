const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@iglesia.com';
    const password = process.env.ADMIN_PASS || '123456';

    const exists = await User.findOne({ email });

    if (!exists) {
      const hash = await bcrypt.hash(password, 10);
      await User.create({
        nombre: 'Administrador',
        email,
        password: hash,
        rol: 'admin',
      });
      console.log(`✅ Admin creado: ${email} / ${password}`);
    } else {
      console.log(`ℹ️  Admin ya existe: ${email}`);
    }
  } catch (error) {
    console.error('❌ Error al crear admin:', error.message);
  }
};

module.exports = createAdmin;
