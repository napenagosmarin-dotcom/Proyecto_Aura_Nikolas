const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendPasswordResetEmail = async (toEmail, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: toEmail,
    subject: 'Recuperación de contraseña - Aura Travel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Recupera tu contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <a href="${resetUrl}" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          Restablecer contraseña
        </a>
        <p style="color: #666; margin-top: 20px;">Este enlace expira en <strong>1 hora</strong>.</p>
        <p style="color: #666;">Si no solicitaste esto, ignora este correo.</p>
      </div>
    `,
  });

  if (error) throw new Error(`Error enviando email: ${error.message}`);
  return data;
};

module.exports = { sendPasswordResetEmail };