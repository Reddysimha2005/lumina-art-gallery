import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const QUICK_REPLIES = ['Show Abstracts', 'Under ₹10,000', 'Featured Art', 'Recommend Something'];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your Lumina Art Assistant. How can I help you discover the perfect masterpiece today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMsg = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.slice(-10); // Send last 10 messages for context
      const res = await api.post('/chat', { message: text, conversationHistory: history });
      
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.response }]);
    } catch (err) {
      console.error('Chat error', err);
      setMessages(prev => [...prev, { sender: 'bot', text: 'I am sorry, I am having trouble connecting right now. Please try again later.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (reply) => {
    handleSend(reply);
    
    // Auto-navigation for common rules if using fallback
    if (reply === 'Show Abstracts') navigate('/gallery?category=Abstract');
    if (reply === 'Under ₹10,000') navigate('/gallery?maxPrice=10000');
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 md:bottom-6 right-6 p-4 rounded-full bg-[#d4af37] text-black shadow-xl hover:scale-105 transition-transform z-40 ${isOpen ? 'hidden' : 'block'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-0 md:right-6 w-full md:w-96 h-[60vh] md:h-[500px] bg-[#111] border border-[#333] rounded-t-2xl md:rounded-2xl shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-10">
          
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-[#333] bg-[#1a1a1a] rounded-t-2xl">
            <div className="flex items-center gap-2 text-[#d4af37]">
              <Sparkles size={20} />
              <h3 className="font-serif text-lg">Lumina Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-[#d4af37] text-black rounded-tr-sm' : 'bg-[#222] text-gray-200 rounded-tl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#222] p-4 rounded-2xl rounded-tl-sm flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="p-2 flex gap-2 overflow-x-auto hide-scrollbar border-t border-[#333]">
            {QUICK_REPLIES.map(reply => (
              <button 
                key={reply}
                onClick={() => handleQuickReply(reply)}
                className="whitespace-nowrap px-3 py-1 bg-[#1a1a1a] text-xs text-gray-300 border border-[#333] rounded-full hover:border-[#d4af37] hover:text-[#d4af37] transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 bg-[#1a1a1a] rounded-b-2xl flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask me about art..." 
              className="flex-1 bg-[#222] border border-[#333] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="p-2 rounded-full bg-[#d4af37] text-black disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
