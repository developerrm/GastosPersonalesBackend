const jwt = require('jsonwebtoken');
const config = require('../config');
const { HttpError } = require('./errors');

function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new HttpError(401, 'Token requerido'));
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    req.userId = payload.sub;
    return next();
  } catch {
    return next(new HttpError(401, 'Token inválido o expirado'));
  }
}

function signToken(userId) {
  return jwt.sign({}, config.jwtSecret, {
    subject: userId,
    expiresIn: config.jwtExpiresIn,
    algorithm: 'HS256',
  });
}

module.exports = { requireAuth, signToken };
