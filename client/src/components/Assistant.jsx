import React, { useState } from 'react';
import { X, Sparkles, Command, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { taskService } from '../services/api';

const Assistant = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: userMessage }]);
    setInput('');
    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      await taskService.create({
        title: userMessage,
        description: `Drafted by AI Assistant`,
        status: 'To Do'
      });

      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: 'ai', 
        text: "Draft page created in your workspace." 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: 'ai', 
        text: "Could not create page." 
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" onClick={onClose} style={{ background: 'rgba(0,0,0,0.05)', backdropFilter: 'none' }}>
          <motion.div 
            className="assistant-panel"
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
            style={{ 
              top: '15%', 
              bottom: 'auto', 
              left: '50%', 
              marginLeft: '-300px', 
              width: '600px',
              border: '1px solid #E9E9E7',
              boxShadow: '0 24px 64px rgba(0,0,0,0.1)'
            }}
          >
            <div className="ai-header" style={{ padding: '12px 20px', border: 'none' }}>
              <Sparkles size={16} />
              <span>Notion AI</span>
            </div>

            <div className="ai-input-area" style={{ padding: '8px 20px 20px' }}>
              <textarea 
                autoFocus
                placeholder="Ask AI to help with your work..." 
                rows="1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                style={{ fontSize: '1.2rem', fontWeight: 400 }}
              />
            </div>

            {messages.length > 0 && (
              <div style={{ padding: '0 20px 20px', maxHeight: '200px', overflowY: 'auto' }}>
                {messages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px', fontSize: '1rem' }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '4px', 
                      background: msg.type === 'ai' ? 'var(--ai-gradient)' : '#F1F1EF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.6rem'
                    }}>
                      {msg.type === 'ai' ? <Sparkles size={12} /> : 'U'}
                    </div>
                    <span style={{ color: 'var(--text-primary)' }}>{msg.text}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ padding: '12px 20px', borderTop: '1px solid #F1F1EF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <CornerDownLeft size={12} /> <span>to send</span>
                </div>
              </div>
              <button className="icon-btn" onClick={onClose} style={{ color: '#E1E1E0' }}><X size={18} /></button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Assistant;
