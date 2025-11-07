const request = require('supertest');
const mongoose = require('mongoose');
const setupDB = require('./jest.setup');

let app;

beforeAll(async () => {
    await setupDB.setup();
    app = require('../app');
});

afterAll(async () => {
    await setupDB.teardown();
});

describe('Users API', () => {
    let createdUser;

    test('POST /api/users -> 201 and returns created user', async () => {
        const payload = { name: 'Alice' };

        const res = await request(app)
            .post('/api/users')
            .send(payload)
            .expect(201)
            .expect('Content-Type', /json/);

        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('name', 'Alice');

        createdUser = res.body;
    });

    test('POST /api/users -> 400 if name missing or empty', async () => {
        await request(app)
            .post('/api/users')
            .send({})
            .expect(400);

        await request(app)
            .post('/api/users')
            .send({ name: '   ' })
            .expect(400);
    });

    test('GET /api/users/:id -> 200 and returns user', async () => {
        const res = await request(app)
            .get(`/api/users/${createdUser._id}`)
            .expect(200)
            .expect('Content-Type', /json/);

        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('_id', createdUser._id);
        expect(res.body).toHaveProperty('name', createdUser.name);
    });

    test('GET /api/users/:id -> 404 when user not found', async () => {
        const nonExist = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(`/api/users/${nonExist}`)
            .expect(404);

        expect(res.body).toHaveProperty('error');
    });

    test('GET /api/users/:id -> 400 on invalid id format', async () => {
        await request(app)
            .get('/api/users/invalid-id')
            .expect(400);
    });
});
