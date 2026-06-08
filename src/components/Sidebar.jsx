import React from 'react';
import { LayoutDashboard, Users, UploadCloud, Settings, HeartPulse } from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView }) {
  return (
    <aside className="sidebar">
      <div className="logo">
        <HeartPulse className="logo-icon" size={32} />
        <span>Asclépio</span>
      </div>

      <nav className="nav-menu">
        <div 
          className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </div>
        <div 
          className={`nav-item ${currentView === 'upload' ? 'active' : ''}`}
          onClick={() => setCurrentView('upload')}
        >
          <UploadCloud size={20} />
          <span>Importar Fitdays</span>
        </div>
        <div className="nav-item">
          <Settings size={20} />
          <span>Configurações</span>
        </div>
      </nav>

      <div className="user-profile">
        <div className="avatar">DR</div>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Dr. Admin</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nutricionista</div>
        </div>
      </div>
    </aside>
  );
}
