'use strict';

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const { connectDB } = require('./db');
const Profile = require('./models/profile');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

app.use('/', require('./routes/profile')());
app.use('/api/users', require('./routes/users'));
app.use('/api/comments', require('./routes/comments'));

async function seedDefaultProfile() {
    const count = await Profile.countDocuments();
    if (count === 0) {
        await Profile.create({
            name: "A Martinez",
            description: "Adolph Larrue Martinez III.",
            mbti: "ISFJ",
            enneagram: "9w3",
            variant: "sp/so",
            tritype: 725,
            socionics: "SEE",
            sloan: "RCOEN",
            psyche: "FEVL",
            image: "https://soulverse.boo.world/images/1.png",
        });
        console.log('Seeded default profile');
    }
}

async function startServer() {
    try {
        await connectDB();
        await seedDefaultProfile();

        app.listen(port, () => {
            console.log('Express started. Listening on %s', port);
        });
    } catch (err) {
        console.error('Failed to start app', err);
        process.exit(1);
    }
}

if (require.main === module && process.env.NODE_ENV !== 'test') {
    startServer();
}

module.exports = app;
