const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { requireAuth } = require('./middleware/auth');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/auth', require('./routes/auth'));
app.use('/expenses', requireAuth, require('./routes/expenses'));
app.use('/payments', requireAuth, require('./routes/payments'));
app.use('/incomes', requireAuth, require('./routes/incomes'));
app.use('/categories', requireAuth, require('./routes/categories'));
app.use('/banks', requireAuth, require('./routes/banks'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
