const Order = require('../models/Order');
const Painting = require('../models/Painting');
const razorpayInstance = require('../utils/razorpay');
const crypto = require('crypto');
const Cart = require('../models/Cart');

exports.getRazorpayKey = (req, res) => {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
};

exports.createOrder = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id }).populate('items.paintingId');
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Calculate total amount (including GST)
        let subtotal = 0;
        for (const item of cart.items) {
            if (item.paintingId && !item.paintingId.isSold) {
                subtotal += item.paintingId.price * item.quantity;
            }
        }

        if (subtotal === 0) {
            return res.status(400).json({ message: 'No valid/unsold items in cart' });
        }

        const gst = subtotal * 0.18;
        const total = Math.round(subtotal + gst); // Total in INR

        let razorpayAmount = total * 100;
        // Razorpay test mode limit is ₹5,00,000. Cap it to bypass the API error.
        if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_') && razorpayAmount > 50000000) {
            razorpayAmount = 50000000;
        }

        const options = {
            amount: razorpayAmount,
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);

        // Store the cart items in a pending multi-order or simply let verifyPayment handle it based on cart
        // We'll create pending Orders for each item
        const newOrders = [];
        for (const item of cart.items) {
             if (item.paintingId && !item.paintingId.isSold) {
                 const newOrder = new Order({
                    userId: req.user.id,
                    paintingId: item.paintingId._id,
                    razorpayOrderId: razorpayOrder.id,
                    amount: item.paintingId.price * item.quantity,
                    status: 'pending'
                });
                await newOrder.save();
                newOrders.push(newOrder);
             }
        }

        res.status(201).json({
            success: true,
            orders: newOrders,
            razorpayOrder,
            total
        });
    } catch (error) {
        console.error('Checkout Error:', error);
        const errorMsg = error.error?.description || error.message || 'Server error creating order';
        res.status(500).json({ message: errorMsg });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment is successful, update all orders with this razorpayOrderId
            const orders = await Order.find({ razorpayOrderId: razorpay_order_id });
            
            if (orders.length > 0) {
                for (const order of orders) {
                    order.status = 'paid';
                    order.razorpayPaymentId = razorpay_payment_id;
                    await order.save();

                    const painting = await Painting.findById(order.paintingId);
                    if (painting) {
                        painting.isSold = true;
                        await painting.save();
                    }
                }

                // Clear the cart
                const cart = await Cart.findOne({ userId: req.user.id });
                if (cart) {
                    cart.items = [];
                    await cart.save();
                }

                res.status(200).json({ success: true, message: 'Payment verified successfully' });
            } else {
                res.status(404).json({ success: false, message: 'Orders not found' });
            }
        } else {
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error verifying payment' });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .populate('paintingId')
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
