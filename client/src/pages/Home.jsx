import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import PaintingCard from '../components/PaintingCard';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/paintings?featured=true');
        setFeatured(res.data.paintings || res.data);
      } catch (err) {
        console.error('Error fetching featured', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?q=80&w=2000&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-30 scale-105 transform hover:scale-100 transition-transform duration-[20s]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-[#d4af37] tracking-[0.3em] uppercase text-sm mb-6">Curated Excellence</p>
          <h1 className="text-5xl md:text-7xl font-serif mb-8 leading-tight">Discover the Art of<br/>Tomorrow.</h1>
          <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light">
            An exclusive collection of contemporary masterpieces, tailored for the modern collector.
          </p>
          <Link to="/gallery" className="btn-primary inline-block">Explore Collection</Link>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12 border-b border-[#333] pb-4">
          <h2 className="text-3xl md:text-4xl font-serif">Curated Masterpieces</h2>
          <Link to="/gallery" className="text-[#d4af37] flex items-center hover:text-white transition-colors uppercase tracking-widest text-sm group">
            View All Collection <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="flex space-x-6 overflow-x-hidden">
            {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse card h-96 min-w-[300px] md:min-w-[400px]" />)}
          </div>
        ) : (
          <div className="relative group">
            <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar space-x-6 pb-8">
              {featured.map(painting => (
                <div key={painting._id} className="snap-start shrink-0 w-[85vw] sm:w-[350px] md:w-[400px]">
                  <PaintingCard painting={painting} />
                </div>
              ))}
            </div>
            
            {/* Scroll indicators (purely visual for non-touch devices) */}
            <div className="absolute top-1/2 -left-4 -translate-y-1/2 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/80 text-white p-3 rounded-full border border-[#333] pointer-events-none">
                <ChevronLeft size={24} />
              </div>
            </div>
            <div className="absolute top-1/2 -right-4 -translate-y-1/2 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/80 text-white p-3 rounded-full border border-[#333] pointer-events-none">
                <ChevronRight size={24} />
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
