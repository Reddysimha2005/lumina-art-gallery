import React from 'react';
import { Link } from 'react-router-dom';

const PaintingCard = ({ painting }) => {
  return (
    <Link to={`/painting/${painting._id}`} className="group block">
      <div className="card">
        <div className="relative aspect-[4/5] overflow-hidden">
          <img 
            src={painting.imageUrl} 
            alt={painting.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {painting.isSold && (
            <div className="absolute top-4 right-4 bg-red-600 text-white text-xs uppercase tracking-widest px-3 py-1 font-bold">
              Sold
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-5">
          <p className="text-[#d4af37] text-xs uppercase tracking-widest mb-2">{painting.category}</p>
          <h3 className="text-xl mb-1 truncate">{painting.title}</h3>
          <p className="text-gray-400 text-sm mb-4 truncate">{painting.artist}, {painting.year}</p>
          <div className="flex justify-between items-center">
            <span className="font-serif text-lg">₹{painting.price.toLocaleString('en-IN')}</span>
            <span className="text-xs uppercase tracking-wider border-b border-[#d4af37] text-[#d4af37] group-hover:text-white transition-colors">View Details</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PaintingCard;
