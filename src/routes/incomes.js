const express = require('express');
const prisma = require('../db');
const schemas = require('../schemas');
const { HttpError, asyncHandler } = require('../middleware/errors');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(
      await prisma.monthlyIncome.findMany({
        where: { userId: req.userId },
        orderBy: { monthKey: 'desc' },
      })
    );
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = schemas.incomeCreate.parse(req.body);
    const exists = await prisma.monthlyIncome.findFirst({
      where: { userId: req.userId, monthKey: data.monthKey },
      select: { id: true },
    });
    if (exists) throw new HttpError(409, 'Ya existe un ingreso para ese mes');
    res.status(201).json(await prisma.monthlyIncome.create({ data: { ...data, userId: req.userId } }));
  })
);

router.put(
  '/:monthKey',
  asyncHandler(async (req, res) => {
    const monthKey = schemas.monthKey.parse(req.params.monthKey);
    const data = schemas.incomeUpdate.parse(req.body);
    const { count } = await prisma.monthlyIncome.updateMany({
      where: { userId: req.userId, monthKey },
      data,
    });
    if (!count) throw new HttpError(404, 'Ingreso no encontrado');
    res.json(await prisma.monthlyIncome.findFirst({ where: { userId: req.userId, monthKey } }));
  })
);

module.exports = router;
