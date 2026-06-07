import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, ZoomIn, ShoppingBag } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const PaintingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [painting, setPainting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchPainting = async () => {
      try {
        const res = await api.get(`/paintings/${id}`);
        setPainting(res.data);
        if (user && res.data.likes.includes(user.id)) {
          setIsLiked(true);
        }
      } catch (err) {
        console.error('Error fetching painting', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPainting();
  }, [id, user]);

  const toggleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/paintings/${id}/like`);
      setIsLiked(res.data.message === 'Liked');
      // Update local state for likes count if needed, but not strictly required for UX
    } catch (err) {
      console.error('Error toggling like', err);
    }
  };

  const handleBuy = () => {
    if (!user) {
      navigate('/login');
    } else {
      addToCart(painting._id);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!painting) return <div className="min-h-screen flex items-center justify-center">Painting not found.</div>;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0a]">
      {/* Mobile Swipe Back Indicator (visual only, actual gesture handled by browser) */}
      <div className="md:hidden p-4">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back to Gallery
        </button>
      </div>

      <div className="flex flex-col md:flex-row h-full md:h-[calc(100vh-64px)]">
        {/* Image Section */}
        <div 
          className={`relative w-full md:w-1/2 lg:w-3/5 bg-[#111] flex items-center justify-center overflow-hidden cursor-zoom-in ${isZoomed ? 'fixed inset-0 z-50 bg-black/95' : ''}`}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          {isZoomed && (
            <button className="absolute top-4 right-4 text-white p-2 z-50 bg-black/50 rounded-full" onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}>
              <ArrowLeft size={24} />
            </button>
          )}
          <img 
            src={painting.imageUrl} 
            alt={painting.title} 
            className={`transition-all duration-300 ${isZoomed ? 'w-[95vw] h-[95vh] object-contain cursor-zoom-out' : 'w-full max-h-[80vh] md:max-h-none object-cover md:h-full'}`} 
          />
          {!isZoomed && (
            <div className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full hidden md:block">
              <ZoomIn size={24} />
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className={`w-full md:w-1/2 lg:w-2/5 p-6 md:p-12 lg:p-16 flex flex-col justify-center ${isZoomed ? 'hidden' : 'block'}`}>
          <div className="hidden md:block mb-8">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white uppercase tracking-wider text-xs">
              <ArrowLeft size={16} className="mr-2" /> Back
            </button>
          </div>

          <p className="text-[#d4af37] tracking-[0.2em] uppercase text-sm mb-4">{painting.category}</p>
          <h1 className="text-4xl md:text-5xl font-serif mb-2 leading-tight">{painting.title}</h1>
          <p className="text-xl text-gray-400 mb-8">{painting.artist}, {painting.year}</p>

          <div className="grid grid-cols-2 gap-4 mb-8 text-sm border-y border-[#333] py-6">
            <div>
              <span className="block text-gray-500 uppercase tracking-wider mb-1">Medium</span>
              <span>{painting.medium}</span>
            </div>
            <div>
              <span className="block text-gray-500 uppercase tracking-wider mb-1">Dimensions</span>
              <span>{painting.dimensions}</span>
            </div>
          </div>

          <p className="text-gray-300 leading-relaxed mb-10 font-light">
            {painting.description}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <div className="text-3xl font-serif">
              ₹{painting.price.toLocaleString('en-IN')}
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={toggleLike}
                className={`p-4 border rounded-none transition-colors ${isLiked ? 'border-red-500 text-red-500' : 'border-[#333] text-gray-400 hover:border-[#d4af37] hover:text-[#d4af37]'}`}
              >
                <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
              <button 
                onClick={handleBuy}
                disabled={painting.isSold}
                className="btn-primary min-w-[160px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={18} />
                {painting.isSold ? 'Sold Out' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaintingDetail;
