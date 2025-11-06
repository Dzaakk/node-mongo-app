'use strict';

const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');


router.post('/', async (req, res) => {
  try {
    const data = {
      name: req.body.name || 'A Martinez',
      description: req.body.description || 'Adolph Larrue Martinez III.',
      mbti: req.body.mbti || 'ISFJ',
      enneagram: req.body.enneagram || '9w3',
      variant: req.body.variant || 'sp/so',
      tritype: req.body.tritype || 725,
      socionics: req.body.socionics || 'SEE',
      sloan: req.body.sloan || 'RCOEN',
      psyche: req.body.psyche || 'FEVL',
      image: 'https://soulverse.boo.world/images/1.png'
    };

    const newProfile = await Profile.create(data);
    return res.status(201).json(newProfile);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create profile' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).lean();
    if (!profile) return res.status(404).send('Profile not found');
    return res.render('profile_template', { profile });
  } catch (err) {
    console.error(err);
    return res.status(400).send('Invalid ID format');
  }
});

router.get('/', async (req, res) => {
  const all = await Profile.find().lean();
  return res.json(all);
});

module.exports = function () {
  return router;
};
