process.env.JWT_SECRET = 'x'.repeat(40);
process.env.GOOGLE_CLIENT_ID = 'test-client';

const test = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');
const { signToken } = require('../src/middleware/auth');

let server;
let base;
test.before(async () => {
  await new Promise((r) => {
    server = app.listen(0, r);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server.close());

test('health es público', async () => {
  const res = await fetch(`${base}/health`);
  assert.strictEqual(res.status, 200);
});

for (const path of ['/expenses', '/payments/2025-01', '/incomes', '/categories', '/banks']) {
  test(`${path} requiere JWT`, async () => {
    const res = await fetch(base + path);
    assert.strictEqual(res.status, 401);
  });
}

test('JWT inválido es rechazado', async () => {
  const res = await fetch(`${base}/expenses`, { headers: { Authorization: 'Bearer invalid' } });
  assert.strictEqual(res.status, 401);
});

test('validación de entrada', async () => {
  const headers = {
    Authorization: `Bearer ${signToken('11111111-1111-4111-8111-111111111111')}`,
    'Content-Type': 'application/json',
  };
  let res = await fetch(`${base}/expenses`, { method: 'POST', headers, body: '{}' });
  assert.strictEqual(res.status, 400);
  res = await fetch(`${base}/payments/2025-13`, { headers });
  assert.strictEqual(res.status, 400);
  res = await fetch(`${base}/expenses/not-a-uuid`, { method: 'DELETE', headers });
  assert.strictEqual(res.status, 400);
});

test('POST /auth/google rechaza token inválido', async () => {
  const res = await fetch(`${base}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: 'bad' }),
  });
  assert.strictEqual(res.status, 401);
});
