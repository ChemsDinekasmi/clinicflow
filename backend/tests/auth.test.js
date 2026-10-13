process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://test:test@localhost:5432/test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.NODE_ENV = 'test';

// La base est mockée : les tests n'ont pas besoin de PostgreSQL
jest.mock('../src/db/pool', () => ({ query: jest.fn(), pool: {} }));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const db = require('../src/db/pool');
const app = require('../src/app');

const PATIENT_ID = '11111111-1111-4111-8111-111111111111';

afterEach(() => db.query.mockReset());

describe('Auth & permissions', () => {
  test('POST /api/auth/login avec des identifiants valides retourne un token', async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        {
          id: '22222222-2222-4222-8222-222222222222',
          fullName: 'Admin ClinicFlow',
          email: 'admin@clinicflow.com',
          role: 'admin',
          createdAt: new Date().toISOString(),
          password_hash: await bcrypt.hash('password123', 4),
        },
      ],
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@clinicflow.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ email: 'admin@clinicflow.com', role: 'admin' });
    expect(res.body.user.password_hash).toBeUndefined();
  });

  test('GET /api/patients sans token retourne 401', async () => {
    const res = await request(app).get('/api/patients');

    expect(res.status).toBe(401);
    expect(db.query).not.toHaveBeenCalled();
  });

  test('DELETE /api/patients/:id par un staff retourne 403', async () => {
    const token = jwt.sign(
      { sub: '33333333-3333-4333-8333-333333333333', email: 'staff1@clinicflow.com', role: 'staff' },
      process.env.JWT_SECRET,
    );

    const res = await request(app)
      .delete(`/api/patients/${PATIENT_ID}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(db.query).not.toHaveBeenCalled();
  });
});
