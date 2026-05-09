const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // contraseña de aplicación de Google
  },
});

/**
 * Envía el correo de bienvenida + contraseña temporal al nuevo usuario.
 * Se llama cuando el admin crea un docente o un niño (con cuenta).
 */
const sendWelcomeEmail = async ({ nombre, email, password, rol }) => {
  const rolLabel = rol === 'docente' ? 'Docente' : 'Usuario';
  const loginUrl = `${process.env.FRONTEND_URL}/login`;

  const html = `
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
        .creds { background: #f1f3f8; border-radius: 8px; padding: 18px 22px; margin: 24px 0; }
        .creds p { margin: 6px 0; font-size: 14px; color: #374151; }
        .creds strong { color: #1a1a2e; }
        .btn { display: inline-block; margin-top: 8px; padding: 12px 28px;
               background: #4f6ef7; color: #fff; text-decoration: none;
               border-radius: 8px; font-size: 15px; font-weight: 600; }
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
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Un administrador ha creado tu cuenta como <strong>${rolLabel}</strong> en el sistema de la Escuela Dominical. Estas son tus credenciales de acceso:</p>
          <div class="creds">
            <p>📧 <strong>Correo:</strong> ${email}</p>
            <p>🔑 <strong>Contraseña temporal:</strong> ${password}</p>
          </div>
          <p>Te recomendamos cambiar tu contraseña después de ingresar por primera vez.</p>
          <a href="${loginUrl}" class="btn">Ingresar al sistema →</a>
        </div>
        <div class="footer">
          Este correo fue enviado automáticamente. Si tienes dudas, contacta al administrador.
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Escuela Dominical ✦" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: '🎉 Tu cuenta en la Escuela Dominical está lista',
    html,
  });
};

/**
 * Correo de recuperación de contraseña con enlace de reset.
 */
const sendPasswordResetEmail = async ({ nombre, email, resetUrl }) => {
  const html = `
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
        .body { padding: 32px 36px; }
        .body p { color: #374151; font-size: 15px; line-height: 1.7; }
        .note { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px;
                padding: 14px 18px; margin: 20px 0; font-size: 13px; color: #92400e; }
        .btn { display: inline-block; margin-top: 8px; padding: 12px 28px;
               background: #4f6ef7; color: #fff; text-decoration: none;
               border-radius: 8px; font-size: 15px; font-weight: 600; }
        .footer { padding: 20px 36px; border-top: 1px solid #e5e7eb;
                  font-size: 12px; color: #9ca3af; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✦ Iglesia Verbo — Escuela Dominical</h1>
        </div>
        <div class="body">
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón para continuar:</p>
          <a href="${resetUrl}" class="btn">Restablecer contraseña →</a>
          <div class="note">⚠️ Este enlace expira en <strong>30 minutos</strong>. Si no solicitaste este cambio, ignora este correo.</div>
        </div>
        <div class="footer">
          Este correo fue enviado automáticamente. Si tienes dudas, contacta al administrador.
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Escuela Dominical ✦" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: '🔐 Restablecer contraseña — Escuela Dominical',
    html,
  });
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };
