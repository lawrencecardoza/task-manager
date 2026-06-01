import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Loader2, 
  Trash2, 
  X, 
  CheckCircle,
  Clock,
  ListTodo,
  Calendar,
  GripVertical,
  ChevronDown,
  AlertCircle,
  Flag
} from 'lucide-react';
import { taskService } from '../services/api';
import toast from 'react-hot-toast';

const PriorityBadge = ({ priority }) => {
  const colors = {
    'High': { bg: '#FEE2E2', text: '#B91C1C', icon: <AlertCircle size={12} /> },
    'Medium': { bg: '#FEF3C7', text: '#B45309', icon: <Flag size={12} /> },
    'Low': { bg: '#E0F2FE', text: '#0369A1', icon: <ChevronDown size={12} /> }
  };
  const style = colors[priority] || colors['Medium'];

  return (
    <span className="priority-badge" style={{ 
      background: style.bg, 
      color: style.text,
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.02em'
    }}>
      {style.icon}
      {priority}
    </span>
  );
};

const TaskRow = ({ task, onDelete, onEdit, onToggleStatus, isToggling }) => {
  return (
    <div className="task-list-item animate-fade-in" onClick={() => onEdit(task)}>
      <div className="task-status-icon" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <GripVertical size={16} style={{ color: '#E9E9E7', cursor: 'grab' }} />
        <div 
          onClick={(e) => { e.stopPropagation(); if (!isToggling) onToggleStatus(task); }}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', width: 24, justifyContent: 'center' }}
        >
          {isToggling ? (
            <Loader2 className="spin" size={16} style={{ color: 'var(--text-muted)' }} />
          ) : task.status === 'Completed' ? (
            <CheckCircle size={18} style={{ color: 'var(--accent-green)' }} />
          ) : task.status === 'In Progress' ? (
            <Clock size={18} style={{ color: 'var(--accent-yellow)' }} />
          ) : (
            <div className="empty-checkbox" style={{ width: 18, height: 18, border: '1.5px solid #E9E9E7', borderRadius: '4px' }} />
          )}
        </div>
      </div>
      
      <div className="task-main" style={{ paddingLeft: '4px' }}>
        <span className="task-title" style={{ 
          textDecoration: task.status === 'Completed' ? 'line-through' : 'none', 
          color: task.status === 'Completed' ? 'var(--text-muted)' : 'var(--text-primary)',
          fontSize: '0.95rem',
          fontWeight: 500
        }}>
          {task.title}
        </span>
        {task.description && <span className="task-desc">· {task.description}</span>}
      </div>

      <div className="task-meta" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {task.priority && task.status !== 'Completed' && <PriorityBadge priority={task.priority} />}
        {task.due_date && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} />
            {new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
        )}
        <span className={`status-badge ${task.status?.replace(' ', '-').toLowerCase()}`}>
          {task.status || 'To Do'}
        </span>
        <button 
          className="icon-btn" 
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          style={{ color: 'var(--text-muted)', padding: '6px' }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
const TaskModal = ({ task, isNew, projectId, onClose, onUpdate }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'To Do');
  const [priority, setPriority] = useState(task?.priority || 'Medium');
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.split('T')[0] : '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const payload = { 
        title, 
        description, 
        status, 
        priority, 
        due_date: dueDate || null,
        project_id: projectId 
      };
      if (isNew) {
        await taskService.create(payload);
      } else {
        await taskService.update(task.id, payload);
      }
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Operation failed:', err);
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
      <div className="modal-card animate-fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className="modal-header" style={{ padding: '24px 40px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="logo-square small" style={{ background: 'var(--accent-black)', color: 'white' }}>
              <ListTodo size={14} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {isNew ? 'Create New Task' : 'Edit Task'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
             <button className="btn-primary" onClick={handleSave} disabled={loading || !title.trim()} style={{ padding: '8px 20px' }}>
              {loading ? <Loader2 className="spin" size={16} /> : (isNew ? 'Create' : 'Save')}
            </button>
            <button onClick={onClose} className="icon-btn" style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
          </div>
        </div>
        
        <div className="modal-body" style={{ padding: '40px 60px 60px' }}>
          <input 
            autoFocus
            className="notion-editor-title"
            placeholder="What needs to be done?" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            style={{ fontSize: '2.4rem', marginBottom: '32px', width: '100%', fontWeight: 700 }}
          />
          
          <div className="modal-properties-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
            <div className="property-item">
              <label className="property-label-modern"><Clock size={14} /> Status</label>
              <div className="property-control">
                <div className="custom-selector-pill">
                  {['To Do', 'In Progress', 'Completed'].map(s => (
                    <button 
                      key={s}
                      className={`pill-btn ${status === s ? 'active' : ''}`}
                      onClick={() => setStatus(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="property-item">
              <label className="property-label-modern"><Flag size={14} /> Priority</label>
              <div className="property-control">
                <div className="custom-selector-pill">
                  {['Low', 'Medium', 'High'].map(p => (
                    <button 
                      key={p}
                      className={`pill-btn ${priority === p ? 'active' : ''}`}
                      onClick={() => setPriority(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="property-item" style={{ gridColumn: 'span 2' }}>
              <label className="property-label-modern"><Calendar size={14} /> Target Date</label>
              <div className="date-picker-container-modern">
                <input 
                  type="date" 
                  className="modern-date-input" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="description-box-container">
            <label className="property-label-modern" style={{ marginBottom: '12px' }}>Details & Notes</label>
            <textarea 
              className="modern-description-textarea"
              placeholder="Add extra context, sub-tasks, or instructions..."
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};


const ProjectDashboard = ({ project, isCreateModalOpen, setIsCreateModalOpen }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [view, setView] = useState('active'); // 'active' or 'previous'

  const fetchTasks = useCallback(async () => {
    if (!project?.id) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await taskService.getAll(project.id);
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [project?.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDelete = async (id) => {
    try {
      await taskService.delete(id);
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const [togglingTaskId, setTogglingTaskId] = useState(null);

  const handleToggleStatus = async (task) => {
    setTogglingTaskId(task.id);
    let newStatus;
    if (task.status === 'To Do') newStatus = 'In Progress';
    else if (task.status === 'In Progress') newStatus = 'Completed';
    else newStatus = 'To Do';

    try {
      await taskService.update(task.id, { ...task, status: newStatus });
      toast.success(`Marked as ${newStatus}`);
      fetchTasks();
    } catch (err) {
      toast.error('Failed to update status');
      console.error('Failed to toggle status:', err);
    } finally {
      setTogglingTaskId(null);
    }
  };

  const activeTasks = tasks.filter(t => t.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');

  if (!project?.id) {
    return (
      <div className="dashboard-content">
        <div className="empty-state" style={{ padding: '120px 0', textAlign: 'center' }}>
          <p>Select a project to view its tasks.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="empty-state" style={{ padding: '120px 0', textAlign: 'center' }}>
        <Loader2 className="spin" size={20} style={{ color: 'var(--text-muted)' }} />
      </div>
    );
  }

  return (
    <div className="dashboard-content" style={{ paddingTop: '40px' }}>
      <div className="project-header" style={{ marginBottom: '60px' }}>
        <h1 style={{ fontSize: '2.8rem', letterSpacing: '-0.04em' }}>{project ? project.name : 'Workspace'}</h1>
        <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
          <button 
            className={`view-toggle ${view === 'active' ? 'active' : ''}`}
            onClick={() => setView('active')}
          >
            Active Tasks <span className="count-pill">{activeTasks.length}</span>
          </button>
          <button 
            className={`view-toggle ${view === 'previous' ? 'active' : ''}`}
            onClick={() => setView('previous')}
          >
            Previous Tasks <span className="count-pill">{completedTasks.length}</span>
          </button>
        </div>
      </div>

      <div className="task-list-container">
        {view === 'active' ? (
          <>
            {activeTasks.length > 0 ? (
              activeTasks.map(task => (
                <TaskRow 
                  key={task.id} 
                  task={task} 
                  onDelete={handleDelete}
                  onEdit={setSelectedTask}
                  onToggleStatus={handleToggleStatus}
                  isToggling={togglingTaskId === task.id}
                />
              ))
            ) : (
              <div className="empty-tasks">
                <p>No active tasks. Create a new one to get started.</p>
              </div>
            )}
            <button 
              className="add-task-btn" 
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus size={18} />
              <span>Add task!</span>
            </button>
          </>
        ) : (
          <>
            {completedTasks.length > 0 ? (
              completedTasks.map(task => (
                <TaskRow 
                  key={task.id} 
                  task={task} 
                  onDelete={handleDelete}
                  onEdit={setSelectedTask}
                  onToggleStatus={handleToggleStatus}
                  isToggling={togglingTaskId === task.id}
                />
              ))
            ) : (
              <div className="empty-tasks">
                <p>No completed tasks found.</p>
              </div>
            )}
          </>
        )}
      </div>

      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          projectId={project?.id}
          onClose={() => setSelectedTask(null)}
          onUpdate={fetchTasks}
        />
      )}

      {isCreateModalOpen && (
        <TaskModal 
          isNew={true}
          projectId={project?.id}
          onClose={() => setIsCreateModalOpen(false)}
          onUpdate={fetchTasks}
        />
      )}
    </div>
  );
};

export default ProjectDashboard;
