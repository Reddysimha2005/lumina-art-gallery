import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Image, Heart, Clock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Don't show on desktop
  return (
    <div className="md:hidden fixed bottom-0 w-full bg-[#0a0a0a]/95 backdrop-blur-md border-t border-[#333] z-50">
      <div className="flex justify-around items-center h-16 px-2">
        <NavItem to="/" icon={<Home />} label="Home" active={location.pathname === '/'} />
        <NavItem to="/gallery" icon={<Image />} label="Gallery" active={location.pathname === '/gallery'} />
        {user && (
          <>
            <NavItem to="/profile" icon={<Heart />} label="Wishlist" active={location.pathname === '/profile' && !location.hash} />
            <NavItem to="/orders" icon={<Clock />} label="Orders" active={location.pathname === '/orders'} />
          </>
        )}
        <NavItem to={user ? "/profile" : "/login"} icon={<User />} label="Profile" active={location.pathname === '/login' || location.pathname === '/profile'} />
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? 'text-[#d4af37]' : 'text-gray-400 hover:text-[#f5f5f5]'} transition-colors`}
  >
    {React.cloneElement(icon, { size: 20 })}
    <span className="text-[10px] uppercase tracking-wider">{label}</span>
  </Link>
);

export default BottomNav;
