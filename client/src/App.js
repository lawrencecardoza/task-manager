import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ProjectDashboard from './components/ProjectDashboard';
import DashboardHome from './components/DashboardHome';
import SettingsView from './components/SettingsView';
import LoginModal from './components/LoginModal';
import ProjectModal from './components/ProjectModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { projectService } from './services/api';
import HistoryView from './components/HistoryView';
import { Toaster } from 'react-hot-toast';
import SearchModal from './components/SearchModal';
import { Loader2 } from 'lucide-react';
import './App.css';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('aanatkal-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  const [projects, setProjects] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('aanatkal-theme', theme);
  }, [theme]);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchProjects();
  }, [user, fetchProjects]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigateToTask = (task, project) => {
    const matchedProject = project || projects.find((item) => item.id === task.project_id);
    if (matchedProject) {
      navigate(`/project/${matchedProject.id}`);
    } else {
      navigate('/history');
    }
    setIsSearchOpen(false);
    setIsSidebarOpen(false);
  };

  if (authLoading) return <div className="loading-screen">Loading...</div>;

  if (!user) {
    return <LoginModal />;
  }

  // Determine active project for sidebar/topbar
  const projectMatch = location.pathname.match(/\/project\/(\d+)/);
  const activeProjectId = projectMatch ? parseInt(projectMatch[1]) : null;
  const activeProject = projects.find(p => p.id === activeProjectId);

  // Determine active section for sidebar
  let activeSection = 'home';
  if (location.pathname.startsWith('/project')) activeSection = 'project';
  else if (location.pathname === '/history') activeSection = 'history';
  else if (location.pathname === '/settings') activeSection = 'settings';

  return (
    <div className="app-container">
      <Sidebar 
        activeSection={activeSection}
        projects={projects}
        onSectionSelect={(section) => {
          if (section === 'search') setIsSearchOpen(true);
          else if (section === 'home') navigate('/');
          else navigate(`/${section}`);
          setIsSidebarOpen(false);
        }}
        activeProject={activeProject} 
        onProjectSelect={(project) => {
          navigate(`/project/${project.id}`);
          setIsSidebarOpen(false);
        }} 
        onNewProject={() => setIsProjectModalOpen(true)}
        onRefreshProjects={fetchProjects}
        onOpenSearch={() => setIsSearchOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      {isSidebarOpen && <div className="mobile-sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />}
      
      <main className="main-content">
        <TopBar 
          project={activeProject} 
          theme={theme}
          onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onNewScreen={() => {
            if (activeSection === 'project') {
              setIsTaskModalOpen(true);
            } else {
              setIsProjectModalOpen(true);
            }
          }}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
        
        <div className="scroll-area">
          <Routes>
            <Route path="/" element={
              <DashboardHome 
                projects={projects}
                onNavigateToProject={(project) => navigate(`/project/${project.id}`)}
                onCreateProject={() => setIsProjectModalOpen(true)}
              />
            } />
            <Route path="/project/:id" element={
              loading ? (
                <div className="empty-state" style={{ padding: '120px 0', textAlign: 'center' }}>
                  <Loader2 className="spin" size={24} style={{ color: 'var(--text-muted)' }} />
                </div>
              ) : activeProject ? (
                <ProjectDashboard 
                  project={activeProject} 
                  isCreateModalOpen={isTaskModalOpen}
                  setIsCreateModalOpen={setIsTaskModalOpen}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } />
            <Route path="/history" element={<HistoryView projects={projects} />} />
            <Route path="/settings" element={<SettingsView theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {isProjectModalOpen && (
        <ProjectModal 
          isNew={true}
          onClose={() => setIsProjectModalOpen(false)}
          onUpdate={fetchProjects}
        />
      )}

      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        projects={projects}
        onNavigateToTask={handleNavigateToTask}
      />

      <Toaster position="bottom-right" toastOptions={{ style: { background: 'var(--toast-bg)', color: 'var(--toast-text)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '0.9rem' } }} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
