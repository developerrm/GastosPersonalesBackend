const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const config = require('../config');
const prisma = require('../db');
const schemas = require('../schemas');
const { signToken } = require('../middleware/auth');
const { HttpError, asyncHandler } = require('../middleware/errors');

const router = express.Router();
const client = new OAuth2Client(config.googleClientId);

// Verificador reemplazable (útil para pruebas)
router.verifyGoogleToken = async (idToken) => {
  const ticket = await client.verifyIdToken({ idToken, audience: config.googleClientId });
  return ticket.getPayload();
};

router.post(
  '/google',
  asyncHandler(async (req, res) => {
    const { idToken } = schemas.googleLogin.parse(req.body);

    let payload;
    try {
      payload = await router.verifyGoogleToken(idToken);
    } catch {
      throw new HttpError(401, 'Token de Google inválido');
    }
    if (!payload || !payload.sub || !payload.email || payload.email_verified === false) {
      throw new HttpError(401, 'Cuenta de Google no verificada');
    }

    const user = await prisma.user.upsert({
      where: { googleId: payload.sub },
      update: { email: payload.email, name: payload.name },
      create: { googleId: payload.sub, email: payload.email, name: payload.name },
    });

    res.json({
      token: signToken(user.id),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        themePreferences: user.themePreferences,
      },
    });
  })
);

module.exports = router;
