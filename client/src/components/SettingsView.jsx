import React, { useState, useEffect } from 'react';
import { User, Shield, Monitor, LogOut, Trash2, CheckCircle, AlertCircle, Loader2, Sun, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const SettingsView = ({ theme, onToggleTheme }) => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({ username: '', email: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [status, setStatus] = useState({ loading: false, success: '', error: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setProfileData({ username: data.username, email: data.email || '' });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: '', error: '' });
    try {
      await authService.updateProfile(profileData);
      setStatus({ loading: false, success: 'Profile updated successfully!', error: '' });
      setTimeout(() => setStatus(prev => ({ ...prev, success: '' })), 3000);
    } catch (err) {
      setStatus({ loading: false, success: '', error: err.response?.data?.error || 'Update failed' });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: '', error: '' });
    try {
      await authService.updatePassword(passwords);
      setStatus({ loading: false, success: 'Password updated successfully!', error: '' });
      setPasswords({ currentPassword: '', newPassword: '' });
      setTimeout(() => setStatus(prev => ({ ...prev, success: '' })), 3000);
    } catch (err) {
      setStatus({ loading: false, success: '', error: err.response?.data?.error || 'Update failed' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('CRITICAL: This will permanently delete your account and ALL workspace data. This action cannot be undone. Are you absolutely sure?')) return;
    
    setStatus({ loading: true, success: '', error: '' });
    try {
      await authService.deleteAccount();
      logout();
    } catch (err) {
      setStatus({ loading: false, success: '', error: err.response?.data?.error || 'Deletion failed' });
    }
  };

  const tabs = [
    { id: 'profile', label: 'My Account', icon: User },
    { id: 'workspace', label: 'Workspace', icon: Monitor },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="settings-panel animate-fade-in">
            <form className="settings-section" onSubmit={handleUpdateProfile}>
              <h2 className="section-title">Public Profile</h2>
              <div style={{ marginBottom: '24px' }}>
                <h3>{profileData.username}</h3>
                <p className="text-muted">Personal Account</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Username</label>
                  <input 
                    value={profileData.username} 
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email"
                    placeholder="name@example.com"
                    value={profileData.email} 
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={status.loading} style={{ marginTop: '24px' }}>
                {status.loading ? <Loader2 className="spin" size={16} /> : 'Save Changes'}
              </button>
            </form>
          </div>
        );
      case 'workspace':
        return (
          <div className="settings-panel animate-fade-in">
            <div className="settings-section">
              <h2 className="section-title">Workspace Settings</h2>
              <div className="form-group">
                <label>Workspace Name</label>
                <input defaultValue={`${profileData.username}'s Workspace`} />
              </div>
              <div className="form-group">
                <label>Workspace Icon</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="logo-square" style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                    {profileData.username?.[0]?.toUpperCase()}
                  </div>
                  <button className="btn-secondary">Change Icon</button>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h2 className="section-title" style={{ color: 'var(--accent-red)' }}>Danger Zone</h2>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>Permanently delete this workspace and all of its content.</p>
              <button 
                className="btn-danger-outline"
                onClick={handleDeleteAccount}
                disabled={status.loading}
              >
                {status.loading ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />}
                Delete Workspace
              </button>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="settings-panel animate-fade-in">
            <div className="settings-section">
              <h2 className="section-title">Appearance</h2>
              <p className="text-muted" style={{ marginBottom: '24px' }}>Customize how Anantkaal looks on your device.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <button 
                  className={`theme-preset-card ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => theme !== 'light' && onToggleTheme()}
                >
                  <div className="theme-preview light">
                    <div className="preview-sidebar" />
                    <div className="preview-content" />
                  </div>
                  <span>Light Mode</span>
                </button>
                <button 
                  className={`theme-preset-card ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => theme !== 'dark' && onToggleTheme()}
                >
                  <div className="theme-preview dark">
                    <div className="preview-sidebar" />
                    <div className="preview-content" />
                  </div>
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="settings-panel animate-fade-in">
            <form className="settings-section" onSubmit={handleUpdatePassword}>
              <h2 className="section-title">Security</h2>
              <div className="form-group">
                <label>Current Password</label>
                <div className="input-with-icon" style={{ position: 'relative' }}>
                  <input 
                    type={showCurrentPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    style={{ width: '100%' }}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>New Password</label>
                <div className="input-with-icon" style={{ position: 'relative' }}>
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    style={{ width: '100%' }}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={status.loading}>
                {status.loading ? <Loader2 className="spin" size={16} /> : 'Update Password'}
              </button>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-content" style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '40px' }}>
      <div className="project-header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1>Settings</h1>
          <p>Manage your personal account and workspace preferences.</p>
        </div>
        <div style={{ paddingBottom: '8px' }}>
          {status.success && (
            <div className="status-toast success animate-fade-in">
              <CheckCircle size={16} /> <span>{status.success}</span>
            </div>
          )}
          {status.error && (
            <div className="status-toast error animate-fade-in">
              <AlertCircle size={16} /> <span>{status.error}</span>
            </div>
          )}
        </div>
      </div>

      <div className="settings-container">
        <aside className="settings-sidebar">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <button className="settings-nav-item" onClick={logout} style={{ color: 'var(--accent-red)' }}>
              <LogOut size={18} />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        <main className="settings-content">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default SettingsView;
