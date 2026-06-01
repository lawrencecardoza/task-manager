import React, { useState, useEffect, useRef } from 'react';
import { Search, ListTodo, Layout, ArrowRight, Clock } from 'lucide-react';
import { taskService } from '../services/api';

const SearchModal = ({ isOpen, onClose, projects, onNavigateToTask }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await taskService.getAll();
        const searchResults = data.filter(task => 
          task.title.toLowerCase().includes(query.toLowerCase()) ||
          task.description?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8); // Limit to top 8 results
        setResults(searchResults);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(performSearch, 200);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: '15vh' }}>
      <div 
        className="search-palette animate-fade-in" 
        onClick={e => e.stopPropagation()}
        style={{
          width: '640px',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 32px 64px -12px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          border: '1px solid var(--border)'
        }}
      >
        <div className="search-palette-input-container" style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <Search size={20} style={{ color: 'var(--text-muted)', marginRight: '16px' }} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search tasks, descriptions, or status..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ 
              flex: 1, 
              border: 'none', 
              outline: 'none', 
              fontSize: '1.1rem', 
              fontWeight: 500,
              color: 'var(--text-primary)'
            }}
          />
          <div className="command-key" style={{ marginLeft: '12px' }}>ESC</div>
        </div>

        <div className="search-palette-results" style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Clock className="spin" size={20} />
            </div>
          ) : query && results.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>No results found for "{query}"</p>
            </div>
          ) : results.length > 0 ? (
            results.map(task => {
              const project = projects.find(p => p.id === task.project_id);
              return (
                <div 
                  key={task.id} 
                  className="search-result-item"
                  onClick={() => onNavigateToTask(task, project)}
                >
                  <div className="search-result-icon">
                    <ListTodo size={16} />
                  </div>
                  <div className="search-result-content">
                    <div className="search-result-title">{task.title}</div>
                    {project && (
                      <div className="search-result-meta">
                        <Layout size={10} />
                        {project.name}
                      </div>
                    )}
                  </div>
                  <ArrowRight size={14} className="search-result-arrow" />
                </div>
              );
            })
          ) : (
            <div style={{ padding: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <div style={{ marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>Search for anything</div>
              <p>Type to find tasks across all your editorial projects.</p>
            </div>
          )}
        </div>
        
        <div className="search-palette-footer" style={{ padding: '12px 24px', background: 'var(--bg-sidebar)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span><kbd>↑↓</kbd> to navigate</span>
            <span><kbd>↵</kbd> to select</span>
          </div>
          <div>Editorial Search 2.0</div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
