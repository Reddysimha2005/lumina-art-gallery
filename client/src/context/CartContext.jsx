import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      const res = await api.get('/cart');
      setCart(res.data);
    } catch (err) {
      console.error('Error fetching cart', err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (paintingId) => {
    if (!user) return alert('Please login first');
    try {
      const res = await api.post('/cart/add', { paintingId });
      setCart(res.data);
      setIsCartOpen(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding to cart');
    }
  };

  const updateQuantity = async (paintingId, quantity) => {
    if (quantity < 1) return;
    try {
      const res = await api.put(`/cart/update/${paintingId}`, { quantity });
      setCart(res.data);
    } catch (err) {
      console.error('Error updating quantity', err);
    }
  };

  const removeItem = async (paintingId) => {
    try {
      const res = await api.delete(`/cart/remove/${paintingId}`);
      setCart(res.data);
    } catch (err) {
      console.error('Error removing item', err);
    }
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  return (
    <CartContext.Provider value={{ cart, fetchCart, addToCart, updateQuantity, removeItem, isCartOpen, toggleCart, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
