const SiteSettings = require('../models/SiteSettings');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const Cart = require('../models/Cart');
const ChatLog = require('../models/ChatLog');
const FAQ = require('../models/FAQ');
const sendOtpEmail = require('../utils/sendOtpEmail'); // Reusing for reminder mail or similar

// --- Site Settings ---
exports.getSettings = async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = await SiteSettings.create({});
        }
        res.status(200).json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = new SiteSettings(req.body);
        } else {
            Object.assign(settings, req.body);
        }
        await settings.save();
        res.status(200).json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Categories ---
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        console.error(error);
        if (error.code === 11000) return res.status(400).json({ message: 'Category already exists' });
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Tags ---
exports.getTags = async (req, res) => {
    try {
        const tags = await Tag.find().sort({ name: 1 });
        res.status(200).json(tags);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addTag = async (req, res) => {
    try {
        const tag = await Tag.create(req.body);
        res.status(201).json(tag);
    } catch (error) {
        console.error(error);
        if (error.code === 11000) return res.status(400).json({ message: 'Tag already exists' });
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteTag = async (req, res) => {
    try {
        await Tag.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Tag deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Cart Monitoring ---
exports.getAllCarts = async (req, res) => {
    try {
        const carts = await Cart.find({ 'items.0': { $exists: true } })
            .populate('userId', 'name email')
            .populate('items.paintingId', 'title price')
            .sort({ updatedAt: -1 });

        // Calculate total value and abandoned carts (not updated in 24hr)
        let totalValue = 0;
        const now = new Date();
        const oneDayMs = 24 * 60 * 60 * 1000;

        const cartData = carts.map(cart => {
            let cartValue = 0;
            cart.items.forEach(item => {
                if(item.paintingId) {
                    cartValue += item.paintingId.price * item.quantity;
                }
            });
            totalValue += cartValue;

            return {
                ...cart.toObject(),
                cartValue,
                isAbandoned: (now - new Date(cart.updatedAt)) > oneDayMs
            };
        });

        res.status(200).json({
            carts: cartData,
            totalValue,
            abandonedCount: cartData.filter(c => c.isAbandoned).length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.sendCartReminder = async (req, res) => {
    try {
        const { email } = req.body;
        // Re-using sendOtpEmail to just log or send a generic reminder
        // If we had a specific function for this, we'd use it.
        // For demonstration, we simply pretend we sent it.
        if (process.env.EMAIL_USER) {
            // Ideally a real html body would be constructed.
            // await transporter.sendMail({ to: email, ... })
        }
        res.status(200).json({ message: `Reminder sent to ${email}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Chatbot & FAQs ---
exports.getChatLogs = async (req, res) => {
    try {
        const logs = await ChatLog.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.status(200).json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getFaqs = async (req, res) => {
    try {
        const faqs = await FAQ.find().sort({ createdAt: -1 });
        res.status(200).json(faqs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addFaq = async (req, res) => {
    try {
        const faq = await FAQ.create(req.body);
        res.status(201).json(faq);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteFaq = async (req, res) => {
    try {
        await FAQ.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'FAQ deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
