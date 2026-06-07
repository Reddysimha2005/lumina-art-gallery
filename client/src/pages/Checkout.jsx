import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const res = await initializeRazorpay();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setProcessing(false);
        return;
      }

      // Create order on backend based on user's cart
      const orderRes = await api.post('/orders/create');
      const { razorpayOrder } = orderRes.data;

      // Fetch the Razorpay Key ID from the backend securely
      const keyRes = await api.get('/orders/razorpay-key');
      
      const options = {
        key: keyRes.data.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Lumina Art Gallery',
        description: 'Cart Purchase',
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            await api.post('/orders/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            alert('Payment Successful!');
            fetchCart(); // Refresh cart to empty state
            navigate('/orders');
          } catch (err) {
            alert('Payment verification failed');
          }
        },
        theme: { color: '#d4af37' }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      paymentObject.on('payment.failed', function (response) {
        alert('Payment Failed');
        console.error(response.error);
      });
    } catch (err) {
      console.error('Checkout error', err);
      alert(err.response?.data?.message || 'Error initiating checkout');
    } finally {
      setProcessing(false);
    }
  };

  if (!cart) return <div className="min-h-screen flex items-center justify-center">Loading Checkout...</div>;

  let subtotal = 0;
  if (cart?.items) {
    subtotal = cart.items.reduce((acc, item) => acc + (item.paintingId.price * item.quantity), 0);
  }
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  if (cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-serif mb-8 text-[#d4af37]">Secure Checkout</h1>
        <p className="text-gray-400 mb-4">Your cart is empty.</p>
        <button onClick={() => navigate('/gallery')} className="btn-primary">Return to Gallery</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-12 pb-28 md:pb-12">
      <h1 className="text-3xl font-serif mb-8 text-center text-[#d4af37]">Secure Checkout</h1>
      <div className="card p-8 md:p-12">
        <h2 className="text-xl font-serif mb-6 border-b border-[#333] pb-4">Order Summary</h2>
        
        <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2">
          {cart.items.map(item => (
            <div key={item.paintingId._id} className="flex gap-4 items-center border-b border-[#333]/50 pb-4">
              <img src={item.paintingId.imageUrl} alt={item.paintingId.title} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1">
                <h3 className="font-serif">{item.paintingId.title}</h3>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-[#d4af37]">₹{(item.paintingId.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4 mb-8 text-sm text-gray-400 bg-[#1a1a1a] p-6 rounded-lg border border-[#333]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (18%)</span>
            <span>₹{gst.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-white text-lg font-serif pt-4 border-t border-[#333]">
            <span>Total to Pay</span>
            <span className="text-[#d4af37]">₹{Math.round(total).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <button 
          onClick={handlePayment} 
          disabled={processing} 
          className="w-full btn-primary disabled:opacity-50 py-4 text-lg"
        >
          {processing ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
