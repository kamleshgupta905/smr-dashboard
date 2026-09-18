import React, { useState, useRef, useEffect } from 'react';
import { Menu, RefreshCw, Search, Bell, User, Settings, LogOut } from 'lucide-react';

export default function Navbar({ 
  onToggleSidebar,
  onToggleMobileMenu,
  sidebarCollapsed,
  onLogout,
  onSync,
  syncing,
  surveyCount
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    } else if (onToggleMobileMenu) {
      onToggleMobileMenu();
    }
  };

  return (
    <header className={`dastone-topbar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Left Topbar Content */}
      <div className="topbar-left-side">
        <button 
          className={`topbar-menu-toggle ${sidebarCollapsed ? 'active' : ''}`}
          onClick={handleToggle}
          aria-label="Toggle navigation menu"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu size={20} color="#475569" />
        </button>

        {/* Sync Zamplia Button (Dastone soft pill style with animated refresh) */}
        {onSync && (
          <button 
            className="btn-new-task"
            onClick={onSync}
            disabled={syncing}
            title="Fetch live inventory from Zamplia Supply API"
          >
            <RefreshCw size={13} className={syncing ? 'sync-spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync Zamplia'}</span>
          </button>
        )}
      </div>

      {/* Right Topbar Content */}
      <div className="topbar-right-side">
        
        {/* Search Icon Button */}
        <button className="topbar-icon-action" title="Search Marketplace">
          <Search size={18} color="#68728c" />
        </button>

        {/* Notifications Bell (Clean Icon Only, No Number Badge) */}
        <button 
          className="topbar-bell-btn" 
          title="Notifications"
          onClick={onSync}
        >
          <Bell size={19} strokeWidth={2} color="#68728c" />
        </button>

        {/* User Profile (Avatar + Admin) with Dropdown */}
        <div className="user-profile-menu" ref={dropdownRef}>
          <div 
            className="user-profile-trigger"
            onClick={() => setDropdownOpen(prev => !prev)}
            title="VMH Admin Profile & Settings"
          >
            <span className="user-profile-name">
              {localStorage.getItem('smr_auth_user') || 'Admin'}
            </span>
            <img 
              src="/vmh-logo.png" 
              alt="VMH Admin" 
              className="user-profile-avatar"
              style={{ objectFit: 'contain', background: '#ffffff', padding: '1px' }}
            />
          </div>

          {/* Admin Dropdown Menu with Profile, Settings & Logout */}
          {dropdownOpen && (
            <div className="dastone-user-dropdown">
              <div className="dropdown-header">
                <div className="name">{localStorage.getItem('smr_auth_user') || 'Admin'} (Super Admin)</div>
                <div className="email">admin@vmhgroupsmr.com</div>
              </div>

              <button 
                className="dropdown-item" 
                onClick={() => setDropdownOpen(false)}
              >
                <User size={15} color="#1761fd" />
                <span>Profile</span>
              </button>

              <button 
                className="dropdown-item" 
                onClick={() => setDropdownOpen(false)}
              >
                <Settings size={15} color="#9ba7ca" />
                <span>Settings</span>
              </button>

              <div className="dropdown-divider" />

              <button 
                className="dropdown-item logout"
                onClick={() => {
                  setDropdownOpen(false);
                  if (onLogout) onLogout();
                }}
              >
                <LogOut size={15} color="#f5325c" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
