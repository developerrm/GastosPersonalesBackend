const config = require('./config');

if (!config.jwtSecret || config.jwtSecret.length < 32) {
  console.error('JWT_SECRET es requerido y debe tener al menos 32 caracteres');
  process.exit(1);
}
if (!config.googleClientId) {
  console.error('GOOGLE_CLIENT_ID es requerido');
  process.exit(1);
}

const app = require('./app');
const prisma = require('./db');

const server = app.listen(config.port, () => {
  console.log(`API escuchando en el puerto ${config.port}`);
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
