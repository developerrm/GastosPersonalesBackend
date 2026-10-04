const express = require('express');
const prisma = require('../db');
const schemas = require('../schemas');
const { HttpError, asyncHandler } = require('../middleware/errors');

const router = express.Router();

// Garantiza que banco y categoría referenciados pertenezcan al usuario
async function assertOwnedRefs(userId, { bankId, categoryId }) {
  if (bankId && !(await prisma.bank.findFirst({ where: { id: bankId, userId }, select: { id: true } }))) {
    throw new HttpError(400, 'bankId no válido');
  }
  if (
    categoryId &&
    !(await prisma.category.findFirst({ where: { id: categoryId, userId }, select: { id: true } }))
  ) {
    throw new HttpError(400, 'categoryId no válido');
  }
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(
      await prisma.expense.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'asc' } })
    );
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = schemas.expense.parse(req.body);
    await assertOwnedRefs(req.userId, data);
    res.status(201).json(await prisma.expense.create({ data: { ...data, userId: req.userId } }));
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = schemas.uuid.parse(req.params.id);
    const data = schemas.expenseUpdate.parse(req.body);
    await assertOwnedRefs(req.userId, data);
    const { count } = await prisma.expense.updateMany({ where: { id, userId: req.userId }, data });
    if (!count) throw new HttpError(404, 'Gasto no encontrado');
    res.json(await prisma.expense.findFirst({ where: { id, userId: req.userId } }));
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = schemas.uuid.parse(req.params.id);
    const { count } = await prisma.expense.deleteMany({ where: { id, userId: req.userId } });
    if (!count) throw new HttpError(404, 'Gasto no encontrado');
    res.status(204).end();
  })
);

module.exports = router;
