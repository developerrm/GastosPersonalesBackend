const express = require('express');
const prisma = require('../db');
const schemas = require('../schemas');
const { asyncHandler } = require('../middleware/errors');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await prisma.bank.findMany({ where: { userId: req.userId }, orderBy: { name: 'asc' } }));
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = schemas.bank.parse(req.body);
    res.status(201).json(await prisma.bank.create({ data: { ...data, userId: req.userId } }));
  })
);

module.exports = router;
