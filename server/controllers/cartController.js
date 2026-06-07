const Cart = require('../models/Cart');
const Painting = require('../models/Painting');

exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id }).populate('items.paintingId');
        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [] });
            await cart.save();
        }
        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { paintingId } = req.body;
        const painting = await Painting.findById(paintingId);

        if (!painting) return res.status(404).json({ message: 'Painting not found' });
        if (painting.isSold) return res.status(400).json({ message: 'Painting is already sold' });

        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.paintingId.toString() === paintingId);
        if (itemIndex > -1) {
            // Since these are unique paintings, usually quantity is 1, but we'll allow updates.
            cart.items[itemIndex].quantity += 1;
        } else {
            cart.items.push({ paintingId, quantity: 1 });
        }

        await cart.save();
        cart = await cart.populate('items.paintingId');
        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateQuantity = async (req, res) => {
    try {
        const { paintingId } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1' });

        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const itemIndex = cart.items.findIndex(item => item.paintingId.toString() === paintingId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            await cart.save();
            await cart.populate('items.paintingId');
            res.status(200).json(cart);
        } else {
            res.status(404).json({ message: 'Item not found in cart' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.removeItem = async (req, res) => {
    try {
        const { paintingId } = req.params;
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter(item => item.paintingId.toString() !== paintingId);
        await cart.save();
        await cart.populate('items.paintingId');
        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.status(200).json({ message: 'Cart cleared', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
