import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        setOrders(res.data);
      } catch (err) {
        console.error('Error fetching orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Orders...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif mb-8">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-[#171717] rounded-xl border border-[#333]">
          <p className="text-gray-400 mb-4">You haven't acquired any artworks yet.</p>
          <Link to="/gallery" className="text-[#d4af37] hover:underline uppercase tracking-wider text-sm">Explore Gallery</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="card p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
              {order.paintingId && (
                <img 
                  src={order.paintingId.imageUrl} 
                  alt={order.paintingId.title} 
                  className="w-24 h-24 object-cover rounded" 
                />
              )}
              <div className="flex-1 w-full">
                <div className="flex flex-col md:flex-row justify-between mb-4 gap-2">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Order ID</p>
                    <p className="font-mono text-sm text-gray-300">{order.razorpayOrderId}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Date</p>
                    <p className="text-sm text-gray-300">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {order.paintingId ? (
                  <div className="flex justify-between items-center border-t border-[#333] pt-4">
                    <div>
                      <Link to={`/painting/${order.paintingId._id}`} className="font-serif text-lg hover:text-[#d4af37] transition-colors">
                        {order.paintingId.title}
                      </Link>
                      <p className="text-sm text-gray-400">{order.paintingId.artist}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-lg">₹{order.amount.toLocaleString('en-IN')}</p>
                      <span className={`text-xs uppercase tracking-wider px-2 py-1 rounded-sm ${order.status === 'paid' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 italic border-t border-[#333] pt-4">Painting details no longer available</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
