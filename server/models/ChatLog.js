const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // optional if guests use it
    message: { type: String, required: true },
    response: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ChatLog', chatLogSchema);
