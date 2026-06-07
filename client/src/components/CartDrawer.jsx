import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartDrawer = () => {
  const { cart, isCartOpen, toggleCart, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    toggleCart();
    navigate('/checkout');
  };

  let subtotal = 0;
  if (cart?.items) {
    subtotal = cart.items.reduce((acc, item) => acc + (item.paintingId.price * item.quantity), 0);
  }
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={toggleCart}></div>
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-[#111] border-l border-[#333] shadow-2xl flex flex-col transform transition-transform duration-300">
        <div className="flex justify-between items-center p-6 border-b border-[#333]">
          <h2 className="text-2xl font-serif text-[#d4af37]">Your Cart</h2>
          <button onClick={toggleCart} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!cart || cart.items.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p>Your cart is empty.</p>
              <button onClick={toggleCart} className="mt-4 text-[#d4af37] underline">Continue Exploring</button>
            </div>
          ) : (
            cart.items.map((item) => (
              <div key={item.paintingId._id} className="flex gap-4 bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
                <img src={item.paintingId.imageUrl} alt={item.paintingId.title} className="w-20 h-20 object-cover rounded" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-lg leading-tight">{item.paintingId.title}</h3>
                    <p className="text-xs text-gray-500">{item.paintingId.artist}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-[#d4af37] font-medium">₹{item.paintingId.price.toLocaleString()}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-[#222] rounded border border-[#333]">
                        <button onClick={() => updateQuantity(item.paintingId._id, item.quantity - 1)} className="p-1 hover:text-white text-gray-400">
                          <Minus size={14} />
                        </button>
                        <span className="px-2 text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.paintingId._id, item.quantity + 1)} className="p-1 hover:text-white text-gray-400">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.paintingId._id)} className="text-red-500 hover:text-red-400 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <div className="p-6 bg-[#0a0a0a] border-t border-[#333]">
            <div className="space-y-2 mb-6 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>GST (18%)</span>
                <span>₹{gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white text-lg font-serif pt-2 border-t border-[#333]">
                <span>Total</span>
                <span className="text-[#d4af37]">₹{Math.round(total).toLocaleString()}</span>
              </div>
            </div>
            <button onClick={handleCheckout} className="w-full btn-primary py-3 text-lg">
              Proceed to Pay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
