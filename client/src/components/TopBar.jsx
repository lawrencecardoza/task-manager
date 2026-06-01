import React from 'react';
import { Link } from 'react-router-dom';
import { Search, LogOut, Bell, ChevronRight, Menu, Plus, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TopBar = ({ project, theme, onToggleTheme, onOpenSearch, onToggleSidebar, onNewScreen }) => {
  const { logout } = useAuth();

  return (
    <header className="top-bar">
      <div className="breadcrumb">
        <button className="icon-btn mobile-menu-button" onClick={onToggleSidebar} style={{ marginRight: '8px' }} aria-label="Open navigation">
          <Menu size={16} />
        </button>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Workspace</Link>
        <ChevronRight size={12} style={{ color: 'var(--text-muted)', margin: '0 2px', opacity: 0.5 }} />
        <span className="active">{project ? project.name : 'Home'}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div className="command-bar" onClick={onOpenSearch}>
          <Search size={14} />
          <span>Search...</span>
          <span className="command-key" style={{ marginLeft: 'auto' }}>⌘K</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button className="icon-btn" onClick={onToggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="icon-btn"><Bell size={18} /></button>
            <button onClick={logout} className="icon-btn" title="Logout"><LogOut size={16} /></button>
          </div>
          
          <button className="btn-primary" onClick={onNewScreen} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
            <Plus size={16} style={{ marginRight: '6px' }} />
            New
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
