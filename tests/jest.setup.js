const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

module.exports = {
    async setup() {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        process.env.MONGO_URI = uri;
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    },

    async teardown() {
        try {
            if (mongoose.connection.readyState !== 0) {
                await mongoose.connection.dropDatabase();
                await mongoose.disconnect();
            }
        } catch (e) {
            // ignore
        }
        if (mongoServer) {
            await mongoServer.stop();
        }
    }
};
