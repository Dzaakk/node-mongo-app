const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
        const u = await User.create({ name: name.trim() });
        return res.status(201).json(u);
    } catch (err) {
        console.error('POST /users', err);
        return res.status(500).json({ error: 'Failed to create user' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const u = await User.findById(req.params.id).lean();
        if (!u) return res.status(404).json({ error: 'User not found' });
        return res.json(u);
    } catch (e) {
        return res.status(400).json({ error: 'Invalid id' });
    }
});

module.exports = router;
