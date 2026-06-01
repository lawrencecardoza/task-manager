import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Home, 
  Settings, 
  Plus, 
  Clock,
  Layout,
  ChevronDown,
  Trash2,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/api';
import toast from 'react-hot-toast';

const Sidebar = ({ 
  projects, 
  onNewProject,
  onRefreshProjects,
  onOpenSearch,
  isOpen = false,
  onClose
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDeleteProject = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await projectService.delete(id);
      toast.success('Project deleted');
      onRefreshProjects();
      navigate('/');
    } catch (err) {
      toast.error('Failed to delete project');
      console.error('Delete project failed:', err);
    }
  };
  
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="sidebar-close-btn" onClick={onClose} aria-label="Close navigation">
        <X size={18} />
      </button>
      <NavLink 
        to="/settings" 
        className="sidebar-header" 
        onClick={onClose}
        style={{ textDecoration: 'none' }}
      >
        <div className="logo-square">{user?.username?.[0]?.toUpperCase() || 'A'}</div>
        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user?.username}'s Workspace
        </span>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)', marginLeft: 'auto', flexShrink: 0 }} />
      </NavLink>

      <nav>
        <button 
          className="nav-item"
          onClick={() => {
            if (typeof onOpenSearch === 'function') onOpenSearch();
            if (typeof onClose === 'function') onClose();
          }}
          style={{ width: '100%', textAlign: 'left' }}
        >
          <Search size={18} />
          <span>Search</span>
          <span className="command-key" style={{ marginLeft: 'auto' }}>⌘K</span>
        </button>
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Home size={18} />
          <span>Home</span>
        </NavLink>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '12px' }}>
        <span className="nav-label">Projects</span>
        <button 
          onClick={onNewProject}
          className="icon-btn-small" 
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Plus size={14} />
        </button>
      </div>
      
      <nav className="sidebar-scroll-area" style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
        {projects.length > 0 ? (
          projects.map(project => (
            <NavLink 
              key={project.id}
              to={`/project/${project.id}`}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Layout size={18} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</span>
              <div className="sidebar-item-actions" style={{ marginLeft: 'auto', opacity: 0 }}>
                <Trash2 
                  size={14} 
                  className="delete-icon" 
                  onClick={(e) => handleDeleteProject(e, project.id)}
                />
              </div>
            </NavLink>
          ))
        ) : (
          <div style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No projects yet
          </div>
        )}
      </nav>

      <span className="nav-label">General</span>
      <nav>
        <NavLink 
          to="/history" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Clock size={18} />
          <span>History</span>
        </NavLink>
        <NavLink 
          to="/settings" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div style={{ marginTop: 'auto', padding: '12px' }}>
        <button 
          className="nav-item" 
          style={{ width: '100%', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '10px' }}
          onClick={onNewProject}
        >
          <Plus size={18} />
          <span>New project</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
