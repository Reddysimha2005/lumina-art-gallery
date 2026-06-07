import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User as UserIcon, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { cart, toggleCart } = useCart();
  const navigate = useNavigate();

  const cartItemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/gallery?search=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#333] z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="font-serif text-2xl font-bold tracking-widest text-[#d4af37]">
            LUMINA
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                placeholder="Search artworks, artists..."
                className="w-full bg-[#171717] border border-[#333] text-[#f5f5f5] rounded-full py-2 pl-4 pr-10 focus:outline-none focus:border-[#d4af37] transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-[#d4af37]">
                <Search size={20} />
              </button>
            </form>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/gallery" className="hover:text-[#d4af37] transition-colors uppercase text-sm tracking-wider">Gallery</Link>
            <button onClick={toggleCart} className="text-gray-400 hover:text-[#d4af37] relative transition-colors">
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#d4af37] text-[#0a0a0a] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'admin' && (
                  <Link to="/admin" className="hover:text-[#d4af37] transition-colors uppercase text-sm tracking-wider">Admin</Link>
                )}
                <Link to="/profile" className="hover:text-[#d4af37] transition-colors"><UserIcon size={20} /></Link>
                <button onClick={() => { logout(); navigate('/'); }} className="text-sm text-gray-400 hover:text-white transition-colors">Logout</button>
              </div>
            ) : (
              <Link to="/login" className="btn-outline px-4 py-2 text-sm">Login</Link>
            )}
          </div>

          {/* Mobile menu button & Cart */}
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={toggleCart} className="text-gray-400 hover:text-[#d4af37] relative transition-colors">
              <ShoppingCart size={24} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#d4af37] text-[#0a0a0a] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-[#f5f5f5] hover:text-[#d4af37]">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#171717] border-b border-[#333]">
          <div className="px-4 pt-4 pb-6 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-[#262626] border border-[#333] rounded-full py-2 pl-4 pr-10 focus:outline-none focus:border-[#d4af37]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400"><Search size={20}/></button>
            </form>
            <div className="flex flex-col space-y-4 pt-4">
              <Link to="/gallery" onClick={() => setIsOpen(false)} className="uppercase text-sm tracking-wider">Gallery</Link>
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="uppercase text-sm tracking-wider text-[#d4af37]">Admin Dashboard</Link>
                  )}
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="uppercase text-sm tracking-wider">Profile</Link>
                  <button onClick={() => { logout(); setIsOpen(false); navigate('/'); }} className="uppercase text-sm tracking-wider text-left text-gray-400">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="uppercase text-sm tracking-wider text-[#d4af37]">Login</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
