const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    description: String,
    mbti: String,
    enneagram: String,
    variant: String,
    tritype: Number,
    socionics: String,
    sloan: String,
    psyche: String,
    image: {
        type: String,
        default: 'https://soulverse.boo.world/images/1.png'
    },
}, { timestamps: true });

profileSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove _id (keep id), remove any Mongo internals if present
        ret.id = ret._id ? String(ret._id) : ret.id;
        delete ret._id;
        return ret;
    }
});

module.exports = mongoose.model('Profile', profileSchema);
