const { z } = require('zod');

const uuid = z.string().uuid();
const monthKey = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Formato esperado YYYY-MM');
const color = z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'Color hexadecimal inválido');
const amount = z.coerce.number().min(0).max(9999999999);
const day = z.coerce.number().int().min(1).max(31);
const optionalText = (max) => z.string().max(max).nullish();

const googleLogin = z.object({ idToken: z.string().min(1) });

const bank = z.object({
  name: z.string().trim().min(1).max(100),
  color: color.optional(),
  accountType: optionalText(100),
  accountNumber: optionalText(50),
});

const category = z.object({
  name: z.string().trim().min(1).max(100),
  icon: z.string().max(50).optional(),
  color: color.optional(),
});

const expense = z.object({
  name: z.string().trim().min(1).max(150),
  bankId: uuid.nullish(),
  categoryId: uuid.nullish(),
  billingDay: day.optional(),
  dueDay: day.optional(),
  estimatedAmount: amount,
  priority: z.enum(['low', 'medium', 'high']).optional(),
  notes: optionalText(2000),
});

const expenseUpdate = expense.partial();

const paymentUpdate = z.object({
  amount: amount.nullish(),
  status: z.enum(['pending', 'paid', 'partial']).optional(),
  paidDate: z.coerce.date().nullish(),
  notes: optionalText(2000),
});

const incomeCreate = z.object({
  monthKey,
  baseSalary: amount.optional(),
  extraIncome: amount.optional(),
  notes: optionalText(2000),
});

const incomeUpdate = incomeCreate.omit({ monthKey: true });

module.exports = {
  uuid,
  monthKey,
  googleLogin,
  bank,
  category,
  expense,
  expenseUpdate,
  paymentUpdate,
  incomeCreate,
  incomeUpdate,
};
