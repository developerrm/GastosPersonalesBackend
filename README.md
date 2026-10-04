# GastosPersonalesBackend

Backend Node.js (Express + Prisma + PostgreSQL) multitenant para Gastos Personales, con login mediante Google OAuth2 y JWT.
Cada usuario solo accede a sus propios datos: todas las consultas se filtran por `user_id` (los pagos mensuales, a través de su gasto).

## Endpoints

Todos excepto `/health` y `/auth/google` requieren un JWT en el header `Authorization` con esquema Bearer (`Authorization: Bearer <token>`).

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/google` | Body `{ "idToken": "<Google ID token>" }` → `{ token, user }` |
| GET/POST | `/expenses` | Listar / crear gastos |
| PUT/DELETE | `/expenses/:id` | Actualizar / eliminar gasto |
| GET | `/payments/:monthKey` | Pagos del mes (`YYYY-MM`); crea los pendientes que falten |
| PUT | `/payments/:id` | Actualizar pago (`amount`, `status`, `paidDate`, `notes`) |
| GET/POST | `/incomes` | Listar / crear ingreso mensual |
| PUT | `/incomes/:monthKey` | Actualizar ingreso del mes |
| GET/POST | `/categories` | Listar / crear categorías |
| GET/POST | `/banks` | Listar / crear bancos |

Entradas validadas con Zod (400 con detalle), errores con formato `{ "error": "..." }`.

## Setup local

1. Requisitos: Node.js 22+ y PostgreSQL.
2. `npm install`
3. `cp .env.example .env` y completa `DATABASE_URL`, `JWT_SECRET` (`openssl rand -hex 32`), `GOOGLE_CLIENT_ID` y `CORS_ORIGINS`.
4. `npx prisma migrate deploy` (o `npm run prisma:migrate` en desarrollo)
5. `npm run dev` → http://localhost:3000/health
6. Pruebas: `npm test`

### Google Client ID
En Google Cloud Console → APIs y servicios → Credenciales → ID de cliente OAuth (Aplicación web). Agrega el origen del frontend (p. ej. `https://developerrm.github.io`). En React usa Google Identity Services, y envía el `credential` (ID token) a `POST /auth/google`; luego guarda el `token` devuelto y envíalo como Bearer.

## Deploy en Railway

1. Crea un proyecto en Railway y añade un servicio **PostgreSQL**.
2. Añade un servicio desde este repositorio (usa el `Dockerfile`).
3. En el servicio del backend define variables: `DATABASE_URL` (referencia `${{Postgres.DATABASE_URL}}`, puedes añadir `?connection_limit=5`), `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `CORS_ORIGINS`, `NODE_ENV=production`. `PORT` lo inyecta Railway.
4. Las migraciones se aplican automáticamente al iniciar el contenedor (`prisma migrate deploy`).

### Costos ($5/mes)
Un solo proceso Node con heap limitado a 256 MB, pool de conexiones pequeño y rate limiting. Para 3 usuarios cabe cómodamente en el plan; configura un límite de uso en Railway para evitar excedentes.
