const Painting = require('../models/Painting');
const User = require('../models/User');

exports.getAllPaintings = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, sort, search, page, limit, featured } = req.query;

        let query = {};

        if (featured === 'true') {
            query.isFeatured = true;
        }

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { artist: { $regex: search, $options: 'i' } }
            ];
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'price_asc') sortOption = { price: 1 };
        if (sort === 'price_desc') sortOption = { price: -1 };

        // Pagination
        const pageNumber = parseInt(page, 10) || 1;
        const limitNumber = parseInt(limit, 10) || 100; // Default large enough for old behavior
        const skip = (pageNumber - 1) * limitNumber;

        const paintings = await Painting.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNumber);
            
        const total = await Painting.countDocuments(query);

        res.status(200).json({
            paintings,
            total,
            page: pageNumber,
            pages: Math.ceil(total / limitNumber)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPaintingById = async (req, res) => {
    try {
        const painting = await Painting.findById(req.params.id);
        if (!painting) return res.status(404).json({ message: 'Painting not found' });
        res.status(200).json(painting);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.toggleLike = async (req, res) => {
    try {
        const painting = await Painting.findById(req.params.id);
        const user = await User.findById(req.user.id);
        
        if (!painting || !user) return res.status(404).json({ message: 'Not found' });

        const isLiked = painting.likes.some(id => id.toString() === req.user.id.toString());
        
        if (isLiked) {
            painting.likes.pull(req.user.id);
            user.wishlist.pull(painting._id);
        } else {
            painting.likes.push(req.user.id);
            user.wishlist.push(painting._id);
        }

        await painting.save();
        await user.save();
        
        res.status(200).json({ message: isLiked ? 'Unliked' : 'Liked', likes: painting.likes, wishlist: user.wishlist });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
