import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import PaintingCard from '../components/PaintingCard';

const Profile = () => {
  const { user, logout } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        // Fetch all paintings, then filter by user's likes
        // In a real app, you might have a specific endpoint for the wishlist
        // For simplicity, we filter locally based on the painting's likes array containing the user ID
        const res = await api.get('/paintings');
        const userWishlist = (res.data.paintings || []).filter(p => p.likes.includes(user.id));
        setWishlist(userWishlist);
      } catch (err) {
        console.error('Error fetching wishlist', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-[#333] pb-8 gap-4">
        <div>
          <h1 className="text-4xl font-serif mb-2">{user.name}</h1>
          <p className="text-gray-400">{user.email}</p>
        </div>
        <button onClick={logout} className="btn-outline px-6 py-2 text-sm">Sign Out</button>
      </div>

      <div>
        <h2 className="text-2xl font-serif mb-8 flex items-center">
          <span className="text-[#d4af37] mr-3">|</span> My Wishlist
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse card h-72" />)}
          </div>
        ) : wishlist.length === 0 ? (
          <div className="text-center py-16 bg-[#171717] rounded-xl border border-[#333]">
            <p className="text-gray-400 mb-4">Your wishlist is empty.</p>
            <a href="/gallery" className="text-[#d4af37] hover:underline uppercase tracking-wider text-sm">Discover Artworks</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map(painting => (
              <PaintingCard key={painting._id} painting={painting} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
