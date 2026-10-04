const express = require('express');
const prisma = require('../db');
const schemas = require('../schemas');
const { asyncHandler } = require('../middleware/errors');

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

module.exports = router;
