// tests/comments.test.js
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

describe('Comments API', () => {
    let userA, userB, profile, comment;

    test('create two users', async () => {
        const r1 = await request(app).post('/api/users').send({ name: 'Alice' }).expect(201);
        const r2 = await request(app).post('/api/users').send({ name: 'Bob' }).expect(201);

        userA = r1.body;
        userB = r2.body;

        expect(userA).toHaveProperty('_id');
        expect(userB).toHaveProperty('_id');
    });

    test('create a profile (POST /)', async () => {
        const payload = { name: 'Profile for comments', description: 'desc' };
        const res = await request(app).post('/').send(payload).expect(201);
        const id = res.body.id || res.body._id || (res.body._id && String(res.body._id));
        expect(id).toBeDefined();
        profile = { id, ...res.body };
    });

    test('create a comment (POST /api/comments)', async () => {
        const body = {
            profileId: profile.id,
            userId: userA._id,
            title: 'Hello',
            body: 'This is a test comment'
        };

        const res = await request(app)
            .post('/api/comments')
            .send(body)
            .expect(201)
            .expect('Content-Type', /json/);

        expect(res.body).toBeDefined();
        const cid = res.body.id || res.body._id || (res.body._id && String(res.body._id));
        expect(cid).toBeDefined();
        comment = { id: cid, ...res.body };
    });

});
