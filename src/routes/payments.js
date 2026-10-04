const express = require('express');
const prisma = require('../db');
const schemas = require('../schemas');
const { HttpError, asyncHandler } = require('../middleware/errors');

const router = express.Router();

// Devuelve los pagos del mes; crea filas "pending" para los gastos que aún no tienen una
router.get(
  '/:monthKey',
  asyncHandler(async (req, res) => {
    const monthKey = schemas.monthKey.parse(req.params.monthKey);
    const expenses = await prisma.expense.findMany({
      where: { userId: req.userId },
      select: { id: true },
    });
    if (expenses.length) {
      await prisma.monthlyExpensePayment.createMany({
        data: expenses.map((e) => ({ expenseId: e.id, monthKey })),
        skipDuplicates: true,
      });
    }
    res.json(
      await prisma.monthlyExpensePayment.findMany({
        where: { monthKey, expense: { userId: req.userId } },
        orderBy: { createdAt: 'asc' },
      })
    );
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = schemas.uuid.parse(req.params.id);
    const data = schemas.paymentUpdate.parse(req.body);
    const { count } = await prisma.monthlyExpensePayment.updateMany({
      where: { id, expense: { userId: req.userId } },
      data,
    });
    if (!count) throw new HttpError(404, 'Pago no encontrado');
    res.json(await prisma.monthlyExpensePayment.findUnique({ where: { id } }));
  })
);

module.exports = router;
