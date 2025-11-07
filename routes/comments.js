const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const User = require('../models/user');
const mongoose = require('mongoose');

router.post('/', async (req, res) => {
    try {
        const { profileId, userId, title, body, votes } = req.body;
        if (!profileId || !userId) return res.status(400).json({ error: 'profileId and userId required' });

        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ error: 'Invalid userId' });

        const doc = new Comment({
            profile: profileId,
            user: userId,
            title: title || '',
            body: body || '',
            votes: []
        });

        if (Array.isArray(votes)) {
            for (const v of votes) {
                if (!v.system || !v.value) continue;
                if (!['mbti', 'enneagram', 'zodiac'].includes(v.system)) continue;
                doc.votes.push({ user: userId, system: v.system, value: v.value });
            }
        }

        await doc.save();

        // modern populate (Mongoose v6+)
        await doc.populate('user', 'name');

        return res.status(201).json(doc);
    } catch (err) {
        console.error('POST /comments error:', err && err.stack ? err.stack : err);
        return res.status(500).json({ error: 'Failed to create comment' });
    }
});


router.get('/', async (req, res) => {
    try {
        const { profile, sort = 'recent', filter = 'all', filterValue, limit = 50, skip = 0 } = req.query;
        if (!profile) return res.status(400).json({ error: 'profile query param required' });

        const match = { profile: mongoose.Types.ObjectId(profile) };

        if (filter !== 'all' && filterValue) {
            match['votes'] = { $elemMatch: { system: filter, value: filterValue } };
        }

        const pipeline = [
            { $match: match },
            { $addFields: { likeCount: { $size: { $ifNull: ['$likes', []] } } } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
        ];

        if (sort === 'best') {
            pipeline.push({ $sort: { likeCount: -1, createdAt: -1 } });
        } else {
            pipeline.push({ $sort: { createdAt: -1 } });
        }

        pipeline.push({ $skip: Number(skip) || 0 }, { $limit: Math.min(100, Number(limit) || 50) });

        pipeline.push({
            $project: {
                likes: 1, likeCount: 1, votes: 1, title: 1, body: 1, profile: 1, user: { _id: '$user._id', name: '$user.name' }, createdAt: 1, updatedAt: 1
            }
        });

        const results = await Comment.aggregate(pipeline);
        return res.json(results);
    } catch (err) {
        console.error('GET /comments', err);
        return res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

router.post('/:id/like', async (req, res) => {
    try {
        const { userId } = req.body;
        const { id } = req.params;
        if (!userId) return res.status(400).json({ error: 'userId required' });

        const c = await Comment.findById(id);
        if (!c) return res.status(404).json({ error: 'Comment not found' });

        const idx = c.likes.findIndex(x => String(x) === String(userId));
        let liked;
        if (idx === -1) {
            c.likes.push(mongoose.Types.ObjectId(userId));
            liked = true;
        } else {
            c.likes.splice(idx, 1);
            liked = false;
        }
        await c.save();
        return res.json({ liked, likeCount: c.likes.length });
    } catch (err) {
        console.error('POST /comments/:id/like', err);
        return res.status(500).json({ error: 'Failed to toggle like' });
    }
});

router.post('/:id/vote', async (req, res) => {
    try {
        const { userId, system, value } = req.body;
        const { id } = req.params;
        if (!userId || !system || !value) return res.status(400).json({ error: 'userId, system and value required' });
        if (!['mbti', 'enneagram', 'zodiac'].includes(system)) return res.status(400).json({ error: 'Invalid system' });

        const c = await Comment.findById(id);
        if (!c) return res.status(404).json({ error: 'Comment not found' });

        const existing = c.votes.find(v => String(v.user) === String(userId) && v.system === system);
        if (existing) {
            existing.value = value;
            existing.createdAt = new Date();
        } else {
            c.votes.push({ user: mongoose.Types.ObjectId(userId), system, value });
        }

        await c.save();
        return res.json({ success: true, votes: c.votes });
    } catch (err) {
        console.error('POST /comments/:id/vote', err);
        return res.status(500).json({ error: 'Failed to save vote' });
    }
});

module.exports = router;
