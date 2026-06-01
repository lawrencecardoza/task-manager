import React, { useState, useEffect } from 'react';
import { X, Loader2, Layout } from 'lucide-react';
import { projectService } from '../services/api';

const ProjectModal = ({ project, isNew, onClose, onUpdate }) => {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      if (isNew) {
        await projectService.create({ name, description });
      } else {
        await projectService.update(project.id, { name, description });
      }
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Project operation failed:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card animate-fade-in" onClick={e => e.stopPropagation()} style={{ width: '600px' }}>
        <div className="modal-header" style={{ padding: '24px 32px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {isNew ? 'New Project' : 'Project Settings'}
          </span>
          <button onClick={onClose} className="icon-btn"><X size={20} /></button>
        </div>
        
        <div className="modal-body" style={{ padding: '48px 60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
            <div className="logo-square large" style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>
              {name?.[0]?.toUpperCase() || <Layout size={24} />}
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{isNew ? 'Create workspace' : 'Edit workspace'}</h2>
              <p className="text-muted">Set up your project environment.</p>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Project Name</label>
              <input 
                autoFocus
                placeholder="e.g. Q3 Roadmap" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input 
                placeholder="What is this project about?" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '12px' }} disabled={loading || !name.trim()}>
              {loading ? <Loader2 className="spin" size={20} /> : (isNew ? 'Create Project' : 'Save Changes')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
