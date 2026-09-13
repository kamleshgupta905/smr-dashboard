import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Flame,
  FileCheck2,
  Database,
  Users,
  Briefcase,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, onTabChange, setActiveTab, isOpen, onClose }) {
  const changeTab = onTabChange || setActiveTab || (() => {});

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'surveys', label: 'Live Inventory', icon: Layers },
    { id: 'top-picks', label: 'Top Picks', icon: Flame },
    { id: 'projects', label: 'Custom Projects', icon: Briefcase },
    { id: 'vendors', label: 'Vendors / Panels', icon: Users },
    { id: 'reconciliation', label: 'Reconciliation', icon: FileCheck2 },
    { id: 'reference', label: 'Reference Catalogs', icon: Database },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'mobile-open' : ''}`} 
        onClick={onClose}
      />

      {/* Main Admin Sidebar */}
      <aside className={`sidebar admin-sidebar ${isOpen ? 'mobile-open' : ''}`}>
        {/* Brand Logo Card with Generated Real Image */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-card" onClick={() => changeTab('dashboard')} title="SMR Market Research">
            <img 
              src="/smr-logo.png" 
              alt="SMR Market Research" 
              className="sidebar-logo-img" 
            />
          </div>
          {onClose && (
            <button 
              className="mobile-menu-btn"
              onClick={onClose}
              style={{ display: isOpen ? 'flex' : 'none', background: 'transparent', color: '#9CA3AF', border: 'none', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="nav-group sidebar-nav-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  changeTab(item.id);
                  if (onClose) onClose();
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{
          marginTop: 'auto',
          padding: '12px 14px',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '8px',
          border: '1px solid #1F2937',
          fontSize: '12px'
        }}>
          <div style={{ color: '#9CA3AF', marginBottom: '4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Zamplia Engine
          </div>
          <div style={{ color: '#00C851', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00C851', display: 'inline-block' }}></span>
            16 / 16 APIs Live
          </div>
        </div>
      </aside>
    </>
  );
}
