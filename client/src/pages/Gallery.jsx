import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import PaintingCard from '../components/PaintingCard';

const CATEGORIES = ['All', 'Abstract', 'Realism', 'Impressionism', 'Portrait', 'Landscape', 'Modern', 'Mythology', 'Wildlife', 'Street Art', 'Spiritual', 'Contemporary Indian'];
const MEDIUMS = ['Oil on Canvas', 'Watercolor', 'Acrylic', 'Digital', 'Charcoal', 'Mixed Media'];

const Gallery = () => {
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  const [filters, setFilters] = useState({
    category: '',
    medium: '',
    sort: 'newest'
  });

  useEffect(() => {
    setPage(1);
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchPaintings();
  }, [filters, searchQuery, page]);

  const fetchPaintings = async () => {
    setLoading(true);
    try {
      let url = `/paintings?page=${page}&limit=${limit}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      if (filters.category) url += `category=${filters.category}&`;
      if (filters.medium) url += `medium=${filters.medium}&`;
      if (filters.sort) url += `sort=${filters.sort}&`;
      
      const res = await api.get(url);
      setPaintings(res.data.paintings);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error('Error fetching paintings', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ category: '', medium: '', sort: 'newest' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-serif mb-2">The Collection</h1>
          <p className="text-gray-400">
            {searchQuery ? `Search results for "${searchQuery}"` : 'Explore our curated selection of fine art.'}
          </p>
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-sm uppercase tracking-wider border border-[#333] px-4 py-2 hover:border-[#d4af37] hover:text-[#d4af37] transition-colors"
        >
          <Filter size={16} />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className="bg-[#171717] p-6 rounded-xl mb-8 border border-[#333] animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6 border-b border-[#333] pb-4">
            <h3 className="font-serif text-xl">Filter Artworks</h3>
            <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Category</label>
              <select 
                className="input-field"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                <option value="">All Categories</option>
                {CATEGORIES.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Medium</label>
              <select 
                className="input-field"
                value={filters.medium}
                onChange={(e) => setFilters({...filters, medium: e.target.value})}
              >
                <option value="">All Mediums</option>
                {MEDIUMS.map(med => <option key={med} value={med}>{med}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Sort By</label>
              <select 
                className="input-field"
                value={filters.sort}
                onChange={(e) => setFilters({...filters, sort: e.target.value})}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={clearFilters} className="text-sm text-gray-400 hover:text-white uppercase tracking-wider">Clear All</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => <div key={i} className="animate-pulse card h-96" />)}
        </div>
      ) : paintings.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-xl mb-4">No artworks found matching your criteria.</p>
          <button onClick={clearFilters} className="text-[#d4af37] hover:underline">Clear filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paintings.map(painting => (
              <PaintingCard key={painting._id} painting={painting} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 space-x-4">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-[#333] rounded-full text-gray-400 hover:text-white hover:border-[#d4af37] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <span className="text-gray-400 font-serif text-lg">
                Page {page} of {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-[#333] rounded-full text-gray-400 hover:text-white hover:border-[#d4af37] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Gallery;
