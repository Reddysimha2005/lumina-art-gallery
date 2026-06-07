const mongoose = require('mongoose');

const paintingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    year: { type: Number },
    medium: { type: String, required: true },
    dimensions: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { 
        type: String, 
        enum: ['Abstract', 'Realism', 'Impressionism', 'Portrait', 'Landscape', 'Modern', 'Mythology', 'Wildlife', 'Street Art', 'Spiritual', 'Contemporary Indian'], 
        required: true 
    },
    imageUrl: { type: String, required: true },
    isSold: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Painting', paintingSchema);
