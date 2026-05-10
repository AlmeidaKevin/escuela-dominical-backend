const nodemailer = require('nodemailer');

/**
 * 🔐 Validar variables de entorno al iniciar
 */
if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS || !process.env.FRONTEND_URL) {
  throw new Error('Faltan variables de entorno requeridas');
}

/**
 * 🚀 Configuración SMTP (estable para Render)
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

/**
 * 🎨 Template base reutilizable
 */
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 0; }
  .container { max-width: 520px; margin: 40px auto; background: #fff;
               border-radius: 12px; overflow: hidden;
               box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  .header { background: #1a1a2e; padding: 32px 36px; text-align: center; }
  .header h1 { color: #fff; font-size: 20px; margin: 0; font-weight: 600; }
  .header p  { color: rgba(255,255,255,0.55); font-size: 13px; margin: 6px 0 0; }
  .body { padding: 32px 36px; }
  .body p { color: #374151; font-size: 15px; line-height: 1.7; }
  .box { background: #f1f3f8; border-radius: 8px; padding: 18px 22px; margin: 24px 0; }
  .btn { display: inline-block; margin-top: 12px; padding: 12px 28px;
         background: #4f6ef7; color: #fff; text-decoration: none;
         border-radius: 8px; font-size: 15px; font-weight: 600; }
  .note { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px;
          padding: 14px 18px; margin: 20px 0; font-size: 13px; color: #92400e; }
  .footer { padding: 20px 36px; border-top: 1px solid #e5e7eb;
            font-size: 12px; color: #9ca3af; text-align: center; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✦ Iglesia Verbo</h1>
      <p>Escuela Dominical — Sistema de Gestión</p>
    </div>

    <div class="body">
      ${content}
    </div>

    <div class="footer">
      Este correo fue enviado automáticamente. Si tienes dudas, contacta al administrador.
    </div>
  </div>
</body>
</html>
`;

/**
 * 📩 Función genérica para enviar correos
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Escuela Dominical ✦" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('❌ Error enviando correo:', error);
    throw new Error('No se pudo enviar el correo');
  }
};

/**
 * 🎉 Correo de bienvenida (CON ACTIVACIÓN, NO PASSWORD)
 */
const sendWelcomeEmail = async ({ nombre, email, token, rol }) => {
  const rolLabel = rol === 'docente' ? 'Docente' : 'Usuario';

  const activationUrl = `${process.env.FRONTEND_URL}/create-password?token=${token}`;

  const content = `
    <p>Hola <strong>${nombre}</strong>,</p>

    <p>Un administrador ha creado tu cuenta como <strong>${rolLabel}</strong>.</p>

    <p>Para activar tu cuenta y crear tu contraseña, haz clic en el botón:</p>

    <a href="${activationUrl}" class="btn">Crear contraseña →</a>

    <div class="note">
      ⚠️ Este enlace expira en <strong>30 minutos</strong>.
    </div>

    <p>Si el botón no funciona, copia este enlace:</p>
    <p>${activationUrl}</p>
  `;

  const html = baseTemplate(content);

  await sendEmail({
    to: email,
    subject: '🎉 Activa tu cuenta — Escuela Dominical',
    html,
  });
};

/**
 * 🔐 Correo de recuperación de contraseña
 */
const sendPasswordResetEmail = async ({ nombre, email, token }) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const content = `
    <p>Hola <strong>${nombre}</strong>,</p>

    <p>Recibimos una solicitud para restablecer tu contraseña.</p>

    <a href="${resetUrl}" class="btn">Restablecer contraseña →</a>

    <div class="note">
      ⚠️ Este enlace expira en <strong>30 minutos</strong>.
      Si no solicitaste este cambio, ignora este correo.
    </div>

    <p>O copia este enlace:</p>
    <p>${resetUrl}</p>
  `;

  const html = baseTemplate(content);

  await sendEmail({
    to: email,
    subject: '🔐 Restablecer contraseña — Escuela Dominical',
    html,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
