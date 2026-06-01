import React, { useState, useEffect } from 'react';
import { 
  History, 
  CheckCircle, 
  Clock, 
  Search,
  ArrowRight,
  Calendar,
  Layout
} from 'lucide-react';
import { taskService } from '../services/api';

const HistoryView = ({ projects }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [groupingMode, setGroupingMode] = useState('None'); // None, Status, Project

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await taskService.getAll();
        setTasks(data.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)));
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const groupedTasks = () => {
    if (groupingMode === 'Status') {
      const groups = { 'Completed': [], 'In Progress': [], 'To Do': [] };
      filteredTasks.forEach(t => groups[t.status]?.push(t));
      return groups;
    }
    if (groupingMode === 'Project') {
      const groups = {};
      projects.forEach(p => groups[p.name] = []);
      filteredTasks.forEach(t => {
        const p = projects.find(proj => proj.id === t.project_id);
        if (p) {
          if (!groups[p.name]) groups[p.name] = [];
          groups[p.name].push(t);
        }
      });
      return groups;
    }
    return { 'All Activity': filteredTasks };
  };

  if (loading) {
    return (
      <div className="empty-state" style={{ padding: '120px 0', textAlign: 'center' }}>
        <Clock className="spin" size={24} style={{ color: 'var(--text-muted)' }} />
      </div>
    );
  }

  return (
    <div className="dashboard-content animate-fade-in" style={{ paddingTop: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="history-header" style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div className="logo-square" style={{ background: 'var(--accent-black)', color: 'white' }}>
            <History size={16} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Workspace Log
          </span>
        </div>
        <h1 style={{ fontSize: '2.8rem', letterSpacing: '-0.04em', fontWeight: 700 }}>Task History</h1>
      </div>

      <div className="history-filters-container" style={{ marginBottom: '40px', background: 'var(--bg-sidebar)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div className="search-bar-modern" style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '12px', border: '1px solid var(--border)', background: 'white', fontSize: '0.95rem', outline: 'none' }}
            />
          </div>
          <select 
            value={groupingMode} 
            onChange={(e) => setGroupingMode(e.target.value)}
            style={{ padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'white', fontWeight: 500 }}
          >
            <option value="None">No Grouping</option>
            <option value="Status">Group by Status</option>
            <option value="Project">Group by Project</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div className="filter-group">
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '8px', textTransform: 'uppercase' }}>Status:</span>
            <div className="custom-selector-pill small">
              {['All', 'To Do', 'In Progress', 'Completed'].map(s => (
                <button key={s} className={`pill-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)} style={{ fontSize: '0.75rem', padding: '6px 12px' }}>{s}</button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '8px', textTransform: 'uppercase' }}>Priority:</span>
            <div className="custom-selector-pill small">
              {['All', 'High', 'Medium', 'Low'].map(p => (
                <button key={p} className={`pill-btn ${priorityFilter === p ? 'active' : ''}`} onClick={() => setPriorityFilter(p)} style={{ fontSize: '0.75rem', padding: '6px 12px' }}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="history-list">
        {Object.entries(groupedTasks()).map(([groupName, tasks]) => (
          tasks.length > 0 && (
            <div key={groupName} className="history-group" style={{ marginBottom: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{groupName}</h3>
                <span className="count-pill">{tasks.length}</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>
              
              {tasks.map(task => {
                const project = projects.find(p => p.id === task.project_id);
                const isCompleted = task.status === 'Completed';
                return (
                  <div key={task.id} className="history-item-row">
                    <div className="history-item-status">
                      {isCompleted ? <CheckCircle size={18} style={{ color: 'var(--accent-green)' }} /> : 
                       task.status === 'In Progress' ? <Clock size={18} style={{ color: 'var(--accent-yellow)' }} /> :
                       <div style={{ width: 18, height: 18, borderRadius: '4px', border: '1.5px solid var(--border)' }} />}
                    </div>
                    <div className="history-item-main">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 600, fontSize: '1rem', color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isCompleted ? 'line-through' : 'none' }}>{task.title}</span>
                        {project && <span className="project-tag-history"><Layout size={10} /> {project.name}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {new Date(task.updated_at || task.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>•</span>
                        <span className={`status-text-${task.status?.toLowerCase().replace(' ', '-')}`}>{task.status}</span>
                        {task.priority && (
                          <>
                            <span>•</span>
                            <span style={{ fontWeight: 600 }}>{task.priority} Priority</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="history-item-action"><ArrowRight size={18} style={{ opacity: 0.3 }} /></div>
                  </div>
                );
              })}
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
