import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const CATEGORIES = ['Abstract', 'Realism', 'Impressionism', 'Portrait', 'Landscape', 'Modern'];
const MEDIUMS = ['Oil on Canvas', 'Watercolor', 'Acrylic', 'Digital', 'Charcoal', 'Mixed Media'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'paintings', 'orders', 'users', 'carts', 'chatbot', 'settings'
  const [stats, setStats] = useState(null);
  const [paintings, setPaintings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [cartsData, setCartsData] = useState({ carts: [], totalValue: 0, abandonedCount: 0 });
  const [chatbots, setChatbots] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);
  
  const [loading, setLoading] = useState(true);
  
  // Search and Filter states
  const [userSearch, setUserSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');
  
  // Add painting form state
  const [formData, setFormData] = useState({
    title: '', artist: '', year: '', medium: '', dimensions: '', description: '', price: '', category: '', image: null, isFeatured: false, isSold: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await api.get('/admin/dashboard-stats');
        setStats(res.data);
      } else if (activeTab === 'paintings') {
        const res = await api.get('/paintings');
        setPaintings(res.data.paintings || []);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } else if (activeTab === 'carts') {
        const res = await api.get('/admin/carts');
        setCartsData(res.data);
      } else if (activeTab === 'chatbot') {
        const [faqsRes, logsRes, settingsRes] = await Promise.all([
          api.get('/admin/faqs'),
          api.get('/admin/chatlogs'),
          api.get('/admin/settings')
        ]);
        setFaqs(faqsRes.data);
        setChatbots(logsRes.data);
        setSiteSettings(settingsRes.data);
      } else if (activeTab === 'settings') {
        const [catRes, tagRes, setRes] = await Promise.all([
          api.get('/admin/categories'),
          api.get('/admin/tags'),
          api.get('/admin/settings')
        ]);
        setCategories(catRes.data);
        setTags(tagRes.data);
        setSiteSettings(setRes.data);
      } else {
        const res = await api.get('/admin/orders');
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      const res = await api.put(`/admin/orders/${id}/status`, { status });
      setOrders(orders.map(o => o._id === id ? res.data : o));
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const handleToggleBanUser = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/ban`);
      setUsers(users.map(u => u._id === id ? res.data.user : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle user ban');
    }
  };

  const handlePromoteUser = async (id) => {
    if (window.confirm('Promote this user to Admin?')) {
      try {
        const res = await api.put(`/admin/users/${id}/promote`);
        setUsers(users.map(u => u._id === id ? res.data.user : u));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to promote user');
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Permanently delete this user account?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleSendCartReminder = async (email) => {
    try {
      await api.post('/admin/carts/remind', { email });
      alert(`Reminder email sent to ${email}`);
    } catch (err) {
      alert('Failed to send reminder email');
    }
  };

  const toggleChatbotEnabled = async () => {
    try {
      const isEnabled = !(siteSettings?.chatbotEnabled);
      await api.put('/admin/settings', { chatbotEnabled: isEnabled });
      setSiteSettings({ ...siteSettings, chatbotEnabled: isEnabled });
    } catch (err) {
      console.error(err);
      alert('Failed to toggle chatbot');
    }
  };

  const addFaq = async (e) => {
    e.preventDefault();
    const question = e.target.question.value;
    const answer = e.target.answer.value;
    try {
      const res = await api.post('/admin/faqs', { question, answer });
      setFaqs([res.data, ...faqs]);
      e.target.reset();
    } catch (err) {
      console.error(err);
      alert('Failed to add FAQ');
    }
  };
  
  const deleteFaq = async (id) => {
    if (!window.confirm('Delete FAQ?')) return;
    try {
      await api.delete(`/admin/faqs/${id}`);
      setFaqs(faqs.filter(f => f._id !== id));
    } catch (err) {
      alert('Failed to delete FAQ');
    }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    try {
      const res = await api.post('/admin/categories', { name });
      setCategories([...categories, res.data]);
      e.target.reset();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add category');
    }
  };

  const addTag = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    try {
      const res = await api.post('/admin/tags', { name });
      setTags([...tags, res.data]);
      e.target.reset();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add tag');
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete Category?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories(categories.filter(c => c._id !== id));
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  const deleteTag = async (id) => {
    if (!window.confirm('Delete Tag?')) return;
    try {
      await api.delete(`/admin/tags/${id}`);
      setTags(tags.filter(t => t._id !== id));
    } catch (err) {
      alert('Failed to delete tag');
    }
  };

  const filteredOrders = orderFilter === 'All' ? orders : orders.filter(o => o.status?.toLowerCase() === orderFilter.toLowerCase());
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleDeletePainting = async (id) => {
    if (window.confirm('Are you sure you want to delete this painting?')) {
      try {
        await api.delete(`/admin/paintings/${id}`);
        setPaintings(paintings.filter(p => p._id !== id));
      } catch (err) {
        alert('Failed to delete painting');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} painting(s)?`)) {
      try {
        await api.delete('/admin/paintings/bulk', { data: { ids: selectedIds } });
        setPaintings(paintings.filter(p => !selectedIds.includes(p._id)));
        setSelectedIds([]);
        setMessage('Paintings deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        console.error(err);
        alert('Failed to delete paintings');
      }
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const toggleSelectAll = () => {
    if (selectedIds.length === paintings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paintings.map(p => p._id));
    }
  };

  const handleAddPainting = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData[key]) {
          data.append('image', formData.image);
        } else if (key !== 'image') {
          data.append(key, formData[key]);
        }
      });

      const res = await api.post('/admin/paintings', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Painting added successfully!');
      setPaintings([res.data.painting, ...paintings]);
      setFormData({
        title: '', artist: '', year: '', medium: '', dimensions: '', description: '', price: '', category: '', image: null, isFeatured: false, isSold: false
      });
      document.getElementById('imageUpload').value = '';
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to add painting. Ensure the image is valid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const initiateEdit = (painting) => {
    setEditingId(painting._id);
    setEditFormData({
      title: painting.title,
      artist: painting.artist,
      price: painting.price,
      isFeatured: painting.isFeatured,
      isSold: painting.isSold
    });
  };

  const handleUpdatePainting = async (id) => {
    try {
      const res = await api.put(`/admin/paintings/${id}`, editFormData);
      setPaintings(paintings.map(p => p._id === id ? res.data.painting : p));
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update painting');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif mb-8 text-[#d4af37]">Admin Dashboard</h1>
      
      <div className="flex space-x-4 mb-8 border-b border-[#333] overflow-x-auto pb-1">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-2 px-4 uppercase tracking-wider text-sm transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-[#d4af37] text-[#d4af37]' : 'text-gray-400 hover:text-white'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('paintings')}
          className={`pb-2 px-4 uppercase tracking-wider text-sm transition-colors whitespace-nowrap ${activeTab === 'paintings' ? 'border-b-2 border-[#d4af37] text-[#d4af37]' : 'text-gray-400 hover:text-white'}`}
        >
          Manage Paintings
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-2 px-4 uppercase tracking-wider text-sm transition-colors whitespace-nowrap ${activeTab === 'users' ? 'border-b-2 border-[#d4af37] text-[#d4af37]' : 'text-gray-400 hover:text-white'}`}
        >
          Users
        </button>
        <button 
          onClick={() => setActiveTab('carts')}
          className={`pb-2 px-4 uppercase tracking-wider text-sm transition-colors whitespace-nowrap ${activeTab === 'carts' ? 'border-b-2 border-[#d4af37] text-[#d4af37]' : 'text-gray-400 hover:text-white'}`}
        >
          Active Carts
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`pb-2 px-4 uppercase tracking-wider text-sm transition-colors whitespace-nowrap ${activeTab === 'orders' ? 'border-b-2 border-[#d4af37] text-[#d4af37]' : 'text-gray-400 hover:text-white'}`}
        >
          Orders
        </button>
        <button 
          onClick={() => setActiveTab('chatbot')}
          className={`pb-2 px-4 uppercase tracking-wider text-sm transition-colors whitespace-nowrap ${activeTab === 'chatbot' ? 'border-b-2 border-[#d4af37] text-[#d4af37]' : 'text-gray-400 hover:text-white'}`}
        >
          Chatbot FAQ
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`pb-2 px-4 uppercase tracking-wider text-sm transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'border-b-2 border-[#d4af37] text-[#d4af37]' : 'text-gray-400 hover:text-white'}`}
        >
          Categories & Tags
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading data...</div>
      ) : activeTab === 'overview' && stats ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#111] p-6 rounded-xl border border-[#333]">
              <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Total Revenue</h3>
              <p className="text-3xl font-serif text-[#d4af37]">₹{stats.revenue.total.toLocaleString()}</p>
              <div className="mt-4 flex gap-4 text-xs text-gray-500">
                <span>Today: ₹{stats.revenue.today.toLocaleString()}</span>
                <span>Month: ₹{stats.revenue.thisMonth.toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-[#111] p-6 rounded-xl border border-[#333]">
              <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Active Paintings</h3>
              <p className="text-3xl font-serif">{stats.paintings.active}</p>
              <div className="mt-4 flex gap-4 text-xs text-gray-500">
                <span>Sold: {stats.paintings.sold}</span>
                <span>Total: {stats.paintings.total}</span>
              </div>
            </div>
            <div className="bg-[#111] p-6 rounded-xl border border-[#333]">
              <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Total Orders</h3>
              <p className="text-3xl font-serif">{stats.revenue.totalOrders}</p>
              <div className="mt-4 flex gap-4 text-xs text-gray-500">
                <span>Today: {stats.revenue.todayOrders}</span>
                <span>Month: {stats.revenue.monthOrders}</span>
              </div>
            </div>
            <div className="bg-[#111] p-6 rounded-xl border border-[#333]">
              <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Registered Users</h3>
              <p className="text-3xl font-serif">{stats.users.total}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#111] p-6 rounded-xl border border-[#333]">
              <h2 className="text-xl font-serif mb-6 text-[#d4af37]">Recent Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="pb-3 border-b border-[#333]">Customer</th>
                      <th className="pb-3 border-b border-[#333]">Amount</th>
                      <th className="pb-3 border-b border-[#333]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map(order => (
                      <tr key={order._id} className="border-b border-[#222]">
                        <td className="py-3 text-sm">{order.userId?.name || 'Guest'}</td>
                        <td className="py-3 text-sm">₹{order.amount?.toLocaleString() || 0}</td>
                        <td className="py-3 text-sm text-green-400">{order.status}</td>
                      </tr>
                    ))}
                    {stats.recentOrders.length === 0 && (
                      <tr><td colSpan="3" className="py-4 text-center text-gray-500 text-sm">No recent orders</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#111] p-6 rounded-xl border border-[#333]">
              <h2 className="text-xl font-serif mb-6 text-red-400">Available Stock Alert</h2>
              <div className="space-y-4">
                {stats.lowStockPaintings.map(painting => (
                  <div key={painting._id} className="flex gap-4 items-center bg-[#1a1a1a] p-3 rounded border border-[#333]">
                    <img src={painting.imageUrl} alt={painting.title} className="w-12 h-12 object-cover rounded" />
                    <div>
                      <p className="text-sm font-medium">{painting.title}</p>
                      <p className="text-xs text-gray-400">{painting.artist} - ₹{painting.price}</p>
                    </div>
                  </div>
                ))}
                {stats.lowStockPaintings.length === 0 && (
                  <p className="text-gray-500 text-sm">No active paintings found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'paintings' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Form */}
          <div className="lg:col-span-1 bg-[#171717] p-6 rounded-xl border border-[#333] h-fit">
            <h2 className="text-xl font-serif mb-6">Add New Artwork</h2>
            {message && <div className="bg-green-900/50 text-green-300 p-3 mb-4 rounded">{message}</div>}
            <form onSubmit={handleAddPainting} className="space-y-4">
              <input type="text" placeholder="Title" required className="input-field" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <input type="text" placeholder="Artist" required className="input-field" value={formData.artist} onChange={e => setFormData({...formData, artist: e.target.value})} />
              <div className="flex gap-4">
                <input type="number" placeholder="Year" className="input-field w-1/2" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
                <input type="number" placeholder="Price (INR)" required className="input-field w-1/2" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <select required className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="" disabled>Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select required className="input-field" value={formData.medium} onChange={e => setFormData({...formData, medium: e.target.value})}>
                <option value="" disabled>Select Medium</option>
                {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input type="text" placeholder="Dimensions (e.g. 24x36 inches)" className="input-field" value={formData.dimensions} onChange={e => setFormData({...formData, dimensions: e.target.value})} />
              <textarea placeholder="Description" rows="3" className="input-field" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              <input id="imageUpload" type="file" accept="image/*" required className="input-field file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-[#d4af37] file:text-black hover:file:bg-[#b08d2e]" onChange={e => setFormData({...formData, image: e.target.files[0]})} />
              
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="accent-[#d4af37]" />
                  Featured
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.isSold} onChange={e => setFormData({...formData, isSold: e.target.checked})} className="accent-[#d4af37]" />
                  Sold
                </label>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full btn-primary disabled:opacity-50">
                {isSubmitting ? 'Adding...' : 'Add Artwork'}
              </button>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2 overflow-x-auto">
            {selectedIds.length > 0 && (
              <div className="mb-4 flex items-center justify-between bg-[#1a1a1a] p-3 rounded border border-[#333]">
                <span className="text-sm text-gray-300">{selectedIds.length} items selected</span>
                <button onClick={handleBulkDelete} className="text-sm text-red-500 hover:text-red-400 bg-red-950/30 px-3 py-1 rounded">Delete Selected</button>
              </div>
            )}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#333] text-gray-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <input type="checkbox" checked={selectedIds.length === paintings.length && paintings.length > 0} onChange={toggleSelectAll} className="accent-[#d4af37]" />
                  </th>
                  <th className="py-3 px-4">Artwork</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status & Featured</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paintings.map(painting => (
                  <tr key={painting._id} className="border-b border-[#333]/50 hover:bg-[#1a1a1a] transition-colors">
                    <td className="py-3 px-4">
                      <input type="checkbox" checked={selectedIds.includes(painting._id)} onChange={() => toggleSelect(painting._id)} className="accent-[#d4af37]" />
                    </td>
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img src={painting.imageUrl} alt={painting.title} className="w-10 h-10 object-cover rounded" />
                      {editingId === painting._id ? (
                        <div className="flex flex-col gap-2">
                          <input type="text" className="input-field py-1 text-sm bg-black" value={editFormData.title} onChange={e => setEditFormData({...editFormData, title: e.target.value})} placeholder="Title" />
                          <input type="text" className="input-field py-1 text-sm bg-black" value={editFormData.artist} onChange={e => setEditFormData({...editFormData, artist: e.target.value})} placeholder="Artist" />
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium">{painting.title}</p>
                          <p className="text-xs text-gray-500">{painting.artist}</p>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {editingId === painting._id ? (
                        <input type="number" className="input-field py-1 text-sm bg-black w-24" value={editFormData.price} onChange={e => setEditFormData({...editFormData, price: e.target.value})} />
                      ) : (
                        `₹${painting.price.toLocaleString()}`
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {editingId === painting._id ? (
                        <div className="flex flex-col gap-2 text-xs">
                          <label><input type="checkbox" checked={editFormData.isSold} onChange={e => setEditFormData({...editFormData, isSold: e.target.checked})} className="accent-[#d4af37] mr-1"/>Sold</label>
                          <label><input type="checkbox" checked={editFormData.isFeatured} onChange={e => setEditFormData({...editFormData, isFeatured: e.target.checked})} className="accent-[#d4af37] mr-1"/>Featured</label>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2 py-1 rounded-sm text-[10px] uppercase tracking-wider ${painting.isSold ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}>
                            {painting.isSold ? 'Sold' : 'Available'}
                          </span>
                          {painting.isFeatured && <span className="px-2 py-1 rounded-sm text-[10px] uppercase tracking-wider bg-blue-900/50 text-blue-400">Featured</span>}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex gap-3">
                        {editingId === painting._id ? (
                          <>
                            <button onClick={() => handleUpdatePainting(painting._id)} className="text-green-500 hover:text-green-400">Save</button>
                            <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-400">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => initiateEdit(painting)} className="text-blue-500 hover:text-blue-400">Edit</button>
                            <button onClick={() => handleDeletePainting(painting._id)} className="text-red-500 hover:text-red-400">Delete</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'users' ? (
        <div className="bg-[#111] p-6 rounded-xl border border-[#333]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif">Registered Users</h2>
            <input 
              type="text" 
              placeholder="Search users..." 
              className="input-field max-w-xs"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#333] text-gray-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Join Date</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id} className="border-b border-[#333]/50 hover:bg-[#1a1a1a] transition-colors">
                    <td className="py-3 px-4 text-sm">{u.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">{u.email}</td>
                    <td className="py-3 px-4 text-sm">
                      {!u.isVerified ? (
                        <span className="text-yellow-500 font-medium">Pending</span>
                      ) : u.isBanned ? (
                        <span className="text-red-500 font-medium">Banned</span>
                      ) : (
                        <span className="text-green-500 font-medium">Active</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm capitalize">{u.role}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex gap-2 items-center">
                        {u.role !== 'admin' && (
                          <>
                            <button onClick={() => handleToggleBanUser(u._id)} className={u.isBanned ? "text-green-500 hover:text-green-400" : "text-yellow-500 hover:text-yellow-400"}>
                              {u.isBanned ? 'Unban' : 'Ban'}
                            </button>
                            <button onClick={() => handlePromoteUser(u._id)} className="text-blue-500 hover:text-blue-400">Promote</button>
                            <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:text-red-400">Delete</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan="6" className="text-center py-8 text-gray-500">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'carts' ? (
        <div className="bg-[#111] p-6 rounded-xl border border-[#333]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#1a1a1a] p-4 rounded border border-[#333]">
              <p className="text-gray-400 text-xs uppercase">Total Active Carts</p>
              <h3 className="text-2xl font-serif text-[#d4af37]">{cartsData.carts.length}</h3>
              <p className="text-sm text-gray-500 mt-2">Value: ₹{cartsData.totalValue.toLocaleString()}</p>
            </div>
            <div className="bg-[#1a1a1a] p-4 rounded border border-[#333]">
              <p className="text-gray-400 text-xs uppercase">Abandoned Carts (&gt;24h)</p>
              <h3 className="text-2xl font-serif text-red-500">{cartsData.abandonedCount}</h3>
            </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#333] text-gray-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cartsData.carts.map(c => (
                <tr key={c._id} className="border-b border-[#333]/50 hover:bg-[#1a1a1a]">
                  <td className="py-3 px-4 text-sm">{c.userId?.name} <br/><span className="text-xs text-gray-500">{c.userId?.email}</span></td>
                  <td className="py-3 px-4 text-sm">{c.items.length} items</td>
                  <td className="py-3 px-4 text-sm">₹{c.cartValue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-gray-400">{new Date(c.updatedAt).toLocaleDateString()} {c.isAbandoned && <span className="ml-2 text-[10px] bg-red-900/50 text-red-400 px-1 rounded uppercase">Abandoned</span>}</td>
                  <td className="py-3 px-4 text-sm">
                    {c.isAbandoned && (
                      <button onClick={() => handleSendCartReminder(c.userId.email)} className="text-blue-500 hover:text-blue-400">Send Email</button>
                    )}
                  </td>
                </tr>
              ))}
              {cartsData.carts.length === 0 && <tr><td colSpan="5" className="text-center py-8 text-gray-500">No active carts found.</td></tr>}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'chatbot' ? (
        <div className="space-y-8">
          <div className="bg-[#111] p-6 rounded-xl border border-[#333] flex justify-between items-center">
            <div>
              <h2 className="text-xl font-serif text-[#d4af37]">Chatbot Settings</h2>
              <p className="text-sm text-gray-400">Enable or disable the AI chatbot sitewide.</p>
            </div>
            <button 
              onClick={toggleChatbotEnabled}
              className={`px-6 py-2 rounded font-bold uppercase tracking-wider text-sm transition-colors ${siteSettings?.chatbotEnabled ? 'bg-green-500 text-black hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
            >
              {siteSettings?.chatbotEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#111] p-6 rounded-xl border border-[#333]">
              <h2 className="text-xl font-serif mb-4">FAQ Management</h2>
              <form onSubmit={addFaq} className="space-y-4 mb-8 bg-[#1a1a1a] p-4 rounded border border-[#333]">
                <input type="text" name="question" required placeholder="Question (e.g. Do you ship internationally?)" className="input-field" />
                <textarea name="answer" required placeholder="Answer" rows="3" className="input-field"></textarea>
                <button type="submit" className="btn-primary w-full">Add FAQ</button>
              </form>
              <div className="space-y-4">
                {faqs.map(f => (
                  <div key={f._id} className="bg-[#1a1a1a] p-4 rounded border border-[#333] relative group">
                    <p className="font-medium text-[#d4af37] text-sm mb-1">Q: {f.question}</p>
                    <p className="text-gray-400 text-sm">A: {f.answer}</p>
                    <button onClick={() => deleteFaq(f._id)} className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-xs uppercase tracking-wider block">Delete</span></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111] p-6 rounded-xl border border-[#333]">
              <h2 className="text-xl font-serif mb-4">Recent Chat Logs</h2>
              <div className="h-[600px] overflow-y-auto space-y-4 pr-2">
                {chatbots.map(log => (
                  <div key={log._id} className="bg-[#1a1a1a] p-3 rounded border border-[#333]">
                    <p className="text-xs text-gray-500 mb-2">{log.userId ? log.userId.name : 'Guest'} - {new Date(log.createdAt).toLocaleString()}</p>
                    <p className="text-sm"><span className="text-gray-400">User:</span> {log.userMessage}</p>
                    <p className="text-sm mt-1"><span className="text-[#d4af37]">Bot:</span> {log.botResponse}</p>
                  </div>
                ))}
                {chatbots.length === 0 && <p className="text-gray-500 text-sm">No chat logs found.</p>}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'settings' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#111] p-6 rounded-xl border border-[#333]">
            <h2 className="text-xl font-serif mb-4 text-[#d4af37]">Categories</h2>
            <form onSubmit={addCategory} className="flex gap-4 mb-6">
              <input type="text" name="name" required placeholder="New Category" className="input-field flex-grow" />
              <button type="submit" className="btn-primary whitespace-nowrap">Add</button>
            </form>
            <ul className="space-y-2">
              {categories.map(c => (
                <li key={c._id} className="flex justify-between items-center bg-[#1a1a1a] px-4 py-3 rounded border border-[#333]">
                  <span className="text-sm">{c.name}</span>
                  <button onClick={() => deleteCategory(c._id)} className="text-red-500 hover:text-red-400 text-sm">Delete</button>
                </li>
              ))}
              {categories.length === 0 && <li className="text-gray-500 text-sm">No categories added.</li>}
            </ul>
          </div>
          <div className="bg-[#111] p-6 rounded-xl border border-[#333]">
            <h2 className="text-xl font-serif mb-4 text-[#d4af37]">Style Tags</h2>
            <form onSubmit={addTag} className="flex gap-4 mb-6">
              <input type="text" name="name" required placeholder="New Tag (e.g. Vintage)" className="input-field flex-grow" />
              <button type="submit" className="btn-primary whitespace-nowrap">Add</button>
            </form>
            <div className="flex flex-wrap gap-2">
              {tags.map(t => (
                <div key={t._id} className="bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#333] flex items-center gap-2 group">
                  <span className="text-xs text-gray-300">{t.name}</span>
                  <button onClick={() => deleteTag(t._id)} className="text-red-500 hover:text-red-400">
                    <span className="sr-only">Delete</span>&times;
                  </button>
                </div>
              ))}
              {tags.length === 0 && <span className="text-gray-500 text-sm">No tags added.</span>}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#111] p-6 rounded-xl border border-[#333]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif">Manage Orders</h2>
            <select 
              className="input-field max-w-xs uppercase tracking-widest text-xs" 
              value={orderFilter}
              onChange={e => setOrderFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Failed">Failed</option>
              <option value="Shipped">Shipped</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#333] text-gray-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Artwork</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id} className="border-b border-[#333]/50 hover:bg-[#1a1a1a] transition-colors">
                  <td className="py-3 px-4 text-xs font-mono text-gray-400">{order.razorpayOrderId || order._id}</td>
                  <td className="py-3 px-4 text-sm">
                    {order.userId?.name || 'Unknown'}<br/>
                    <span className="text-xs text-gray-500">{order.userId?.email || ''}</span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-[#d4af37]">{order.paintingId?.title || 'Unknown'}</td>
                  <td className="py-3 px-4 text-sm">₹{order.amount?.toLocaleString() || 0}</td>
                  <td className="py-3 px-4 text-sm">
                    <select 
                      className={`px-2 py-1 rounded bg-[#1a1a1a] border border-[#333] text-xs uppercase ${
                        order.status === 'paid' ? 'text-green-400' : 
                        order.status === 'failed' ? 'text-red-400' : 
                        order.status === 'pending' ? 'text-yellow-400' : 'text-blue-400'
                      }`}
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
