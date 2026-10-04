const { PrismaClient, Prisma } = require('@prisma/client');

// Los montos se devuelven como números en el JSON (el frontend los espera así)
Prisma.Decimal.prototype.toJSON = function toJSON() {
  return this.toNumber();
};

// Una sola instancia con pocas conexiones (plan económico de Railway)
module.exports = new PrismaClient();
