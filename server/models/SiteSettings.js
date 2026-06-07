const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    siteName: { type: String, default: 'Lumina Art Gallery' },
    logoUrl: { type: String, default: '' },
    maintenanceMode: { type: Boolean, default: false },
    chatbotEnabled: { type: Boolean, default: true },
    gstPercentage: { type: Number, default: 18 },
    razorpayTestMode: { type: Boolean, default: true },
    maxCartItems: { type: Number, default: 10 }
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
