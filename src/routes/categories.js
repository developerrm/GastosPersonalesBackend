const express = require('express');
const prisma = require('../db');
const schemas = require('../schemas');
const { HttpError, asyncHandler } = require('../middleware/errors');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(
      await prisma.category.findMany({ where: { userId: req.userId }, orderBy: { name: 'asc' } })
    );
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = schemas.category.parse(req.body);
    res.status(201).json(await prisma.category.create({ data: { ...data, userId: req.userId } }));
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = schemas.uuid.parse(req.params.id);
    const { count } = await prisma.category.deleteMany({ where: { id, userId: req.userId } });
    if (!count) throw new HttpError(404, 'Categoría no encontrada');
    res.status(204).end();
  })
);

module.exports = router;
