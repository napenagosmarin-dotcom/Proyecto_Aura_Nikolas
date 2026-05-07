const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { sendPasswordResetEmail } = require('../services/email.service');

// Temporal en memoria
const resetTokens = new Map();

router.post('/login', authController.login);
router.post('/register', authController.register);

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hora

    resetTokens.set(token, { email, expiresAt });

    await sendPasswordResetEmail(email, token);

    res.json({ message: 'Si el correo existe, recibirás un enlace en breve.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar la solicitud.' });
  }
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  const record = resetTokens.get(token);

  if (!record || Date.now() > record.expiresAt) {
    return res.status(400).json({ error: 'Token inválido o expirado.' });
  }

  resetTokens.delete(token);
  res.json({ message: 'Contraseña actualizada correctamente.' });
});

module.exports = router;