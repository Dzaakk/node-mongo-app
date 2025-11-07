const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    system: { type: String, enum: ['mbti', 'enneagram', 'zodiac'], required: true },
    value: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

const commentSchema = new mongoose.Schema({
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: '' },
    body: { type: String, default: '' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    votes: [voteSchema]
}, { timestamps: true });

commentSchema.virtual('likeCount').get(function () {
    return (this.likes || []).length;
});

commentSchema.set('toJSON', {
    virtuals: true, versionKey: false, transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
    }
});

module.exports = mongoose.model('Comment', commentSchema);
