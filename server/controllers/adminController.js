const Painting = require('../models/Painting');
const Order = require('../models/Order');
const User = require('../models/User');

exports.addPainting = async (req, res) => {
    try {
        const { title, artist, year, medium, dimensions, description, price, category } = req.body;
        
        let imageUrl = req.body.imageUrl; // fallback
        if (req.file && req.file.path) {
            imageUrl = req.file.path;
        }

        if (!imageUrl) {
            return res.status(400).json({ message: 'Image is required' });
        }
        
        const painting = new Painting({
            title, artist, year, medium, dimensions, description, price, category, imageUrl,
            isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
            isSold: req.body.isSold === 'true' || req.body.isSold === true
        });

        await painting.save();
        res.status(201).json({ message: 'Painting added successfully', painting });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updatePainting = async (req, res) => {
    try {
        const updateData = { ...req.body };
        
        if (req.file && req.file.path) {
            updateData.imageUrl = req.file.path;
        }

        // explicitly parse booleans
        if (updateData.isFeatured !== undefined) {
            updateData.isFeatured = updateData.isFeatured === 'true' || updateData.isFeatured === true;
        }
        if (updateData.isSold !== undefined) {
            updateData.isSold = updateData.isSold === 'true' || updateData.isSold === true;
        }

        const painting = await Painting.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!painting) return res.status(404).json({ message: 'Painting not found' });
        res.status(200).json({ message: 'Painting updated', painting });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deletePainting = async (req, res) => {
    try {
        const painting = await Painting.findByIdAndDelete(req.params.id);
        if (!painting) return res.status(404).json({ message: 'Painting not found' });
        res.status(200).json({ message: 'Painting deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.bulkDeletePaintings = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No valid IDs provided' });
        }
        await Painting.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ message: 'Paintings deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'name email')
            .populate('paintingId', 'title artist')
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
            .populate('userId', 'name email')
            .populate('paintingId', 'title artist');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.status(200).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash -otp -otpExpiry').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const totalPaintings = await Painting.countDocuments();
        const activePaintings = await Painting.countDocuments({ isSold: false });
        const soldPaintings = await Painting.countDocuments({ isSold: true });

        const totalUsers = await User.countDocuments();
        
        const orders = await Order.find().populate('paintingId', 'title artist');
        const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
        
        // Let's get today's and this month's revenue roughly
        const now = new Date();
        const today = new Date(now.setHours(0,0,0,0));
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
        const monthOrders = orders.filter(o => new Date(o.createdAt) >= firstDayOfMonth);

        const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
        const thisMonthRevenue = monthOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

        const recentOrders = await Order.find()
            .populate('userId', 'name email')
            .populate('paintingId', 'title')
            .sort({ createdAt: -1 })
            .limit(5);

        // Dummy low stock (assuming all are unique, so 1 copy left is just unsold)
        const lowStockPaintings = await Painting.find({ isSold: false }).limit(5);

        res.status(200).json({
            paintings: { total: totalPaintings, active: activePaintings, sold: soldPaintings },
            users: { total: totalUsers },
            revenue: {
                total: totalRevenue,
                today: todayRevenue,
                thisMonth: thisMonthRevenue,
                todayOrders: todayOrders.length,
                monthOrders: monthOrders.length,
                totalOrders: orders.length
            },
            recentOrders,
            lowStockPaintings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
