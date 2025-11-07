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

describe('Profile routes (router mounted at /)', () => {
    let createdProfileId;
    const name = 'Budi Tester';

    test('POST / -> create profile and return JSON 201', async () => {
        const payload = {
            name,
            description: 'Deskripsi untuk testing',
            mbti: 'INTJ',
        };

        const res = await request(app)
            .post('/')
            .send(payload)
            .expect(201)
            .expect('Content-Type', /json/);

        const body = res.body;
        // model uses toJSON transform which yields `id` and removes _id, but create returns mongoose doc
        const id = body.id || body._id || (body._id && body._id.toString());
        expect(id).toBeDefined();
        createdProfileId = id;

        expect(body.name).toBeDefined();
        expect(body.name).toBe(name);
    });

    test('GET / -> returns array containing created profile', async () => {
        const res = await request(app)
            .get('/')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(Array.isArray(res.body)).toBe(true);
        const found = res.body.find(item => {
            const itemId = item.id || item._id || (item._id && item._id.toString());
            return String(itemId) === String(createdProfileId) || item.name === name;
        });
        expect(found).toBeTruthy();
    });

    test('GET /:id -> renders HTML containing profile name', async () => {
        const res = await request(app)
            .get(`/${createdProfileId}`)
            .expect(200)
            .expect('Content-Type', /html/);

        expect(res.text).toContain(name);
        expect(res.text).toContain('Deskripsi untuk testing');
    });

    test('GET /:id -> 404 when not found', async () => {
        const nonExist = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(`/${nonExist}`)
            .expect(404);

        expect(res.text).toMatch(/Profile not found/i);
    });

    test('GET /:id -> 400 on invalid id format', async () => {
        await request(app)
            .get('/invalid-id-format')
            .expect(400);
    });
});
