import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Layout,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Plus,
  Zap,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { taskService } from "../services/api";
import DashboardCharts from "./DashboardCharts";

const DashboardHome = ({ projects = [], onCreateProject }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const data = await taskService.getAll();
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

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

  const activeTasks = tasks.filter((t) => t.status !== "Completed");
  const completedToday = tasks.filter((t) => t.status === "Completed").length;
  const highPriority = tasks.filter(
    (t) => t.priority === "High" && t.status !== "Completed",
  ).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div
        className="empty-state"
        style={{ padding: "120px 0", textAlign: "center" }}
      >
        <Clock
          className="spin"
          size={24}
          style={{ color: "var(--text-muted)" }}
        />
      </div>
    );
  }

  return (
    <div
      className="dashboard-content"
      style={{ paddingTop: "40px", maxWidth: "1100px", margin: "0 auto" }}
    >
      <div className="home-header" style={{ marginBottom: "80px" }}>
        <h1
          style={{
            fontSize: "3.2rem",
            letterSpacing: "-0.05em",
            fontWeight: 700,
          }}
        >
          {getGreeting()}, {user?.username}
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            marginTop: "16px",
            fontSize: "1.2rem",
            opacity: 0.8,
          }}
        >
          Here's what's happening in your workspace today.
        </p>
      </div>

      <div className="stats-grid" style={{ marginBottom: "80px" }}>
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{
              background: "rgba(11, 107, 255, 0.1)",
              color: "var(--accent-blue)",
            }}
          >
            <Zap size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Active Tasks</span>
            <span className="stat-value">{activeTasks.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{
              background: "rgba(20, 174, 92, 0.1)",
              color: "var(--accent-green)",
            }}
          >
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Completed Today</span>
            <span className="stat-value">{completedToday}</span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{
              background: "rgba(229, 72, 77, 0.1)",
              color: "var(--accent-red)",
            }}
          >
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">High Priority</span>
            <span className="stat-value">{highPriority}</span>
          </div>
        </div>
      </div>

      <DashboardCharts />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: "80px",
        }}
      >
        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "32px",
            }}
          >
            <h2 style={{ fontSize: "1.4rem", fontWeight: 600 }}>
              Recent Tasks
            </h2>
            <Link to="/history" className="text-link" style={{ fontSize: "0.9rem", textDecoration: 'none' }}>
              View all
            </Link>
          </div>

          <div className="home-tasks-list">
            {activeTasks.length > 0 ? (
              activeTasks.slice(0, 5).map((task) => {
                const project = projects.find(p => p.id === task.project_id);
                return (
                  <div key={task.id} className="home-task-item">
                    <div 
                      style={{ display: "flex", alignItems: "center", gap: "16px", cursor: 'pointer', flex: 1 }}
                      onClick={() => !togglingTaskId && handleToggleStatus(task)}
                    >
                      {togglingTaskId === task.id ? (
                        <div style={{ width: 8, height: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <Loader2 size={12} className="spin" style={{ color: 'var(--text-muted)' }} />
                        </div>
                      ) : (
                        <div className={`priority-dot ${task.priority?.toLowerCase() || "medium"}`} />
                      )}
                      <div>
                        <div style={{ fontWeight: 500, textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}>
                          {task.title}
                        </div>
                        {project && (
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            {project.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      <span>
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })
                          : "No date"}
                      </span>
                      <ArrowRight size={14} opacity={0.5} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-home-state">No recent tasks found.</div>
            )}
          </div>
        </section>

        <section>
          <h2
            style={{
              fontSize: "1.4rem",
              fontWeight: 600,
              marginBottom: "32px",
            }}
          >
            Jump Back In
          </h2>
          <div className="projects-quick-list">
            {projects.slice(0, 3).map(project => (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className="project-card-home"
                style={{ marginBottom: '16px', width: '100%', textDecoration: 'none' }}
              >
                <div
                  className="project-icon-home"
                  style={{
                    background: "var(--bg-secondary)",
                    padding: "10px",
                    borderRadius: "10px",
                  }}
                >
                  <Layout size={20} />
                </div>
                <div className="project-info-home">
                  <span className="project-name-home">{project.name}</span>
                  <span className="project-meta-home">{project.description || 'General workspace'}</span>
                </div>
                <ArrowRight
                  size={16}
                  style={{ marginLeft: "auto", opacity: 0.5 }}
                />
              </Link>
            ))}

            <button
              className="project-card-home secondary"
              onClick={onCreateProject}
              style={{ width: "100%", borderStyle: "dashed", opacity: 0.6 }}
            >
              <Plus size={18} />
              <span>Create new project</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardHome;
