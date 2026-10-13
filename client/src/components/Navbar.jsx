import React, { useState, useRef, useEffect } from 'react';
import { Menu, RefreshCw, Search, Bell, User, Settings, LogOut, CheckCircle2, Zap, ShieldAlert } from 'lucide-react';

export default function Navbar({
  onToggleSidebar,
  onToggleMobileMenu,
  sidebarCollapsed,
  onLogout,
  onSync,
  syncing,
  surveyCount,
  onOpenProfile,
  onOpenSettings,
  globalSearch,
  onGlobalSearch,
  onRoleChange,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);
  const searchInputRef = useRef(null);

  const [activeRole, setActiveRole] = useState(() => {
    return (typeof localStorage !== 'undefined' && localStorage.getItem('smr_user_role')) || 'Admin';
  });

  const handleRoleSelect = (newRole) => {
    setActiveRole(newRole);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('smr_user_role', newRole);
    }
    if (onRoleChange) onRoleChange(newRole);
  };

  const notifications = [
    { id: 1, icon: Zap, color: '#1761fd', title: 'Zamplia Inventory Synced', text: `${surveyCount || 626} live surveys refreshed with fresh quotas.`, time: 'Just now' },
    { id: 2, icon: CheckCircle2, color: '#16a34a', title: 'Reconciliation Verified', text: 'Billing audit passed — no discrepancies found.', time: '25 min ago' },
    { id: 3, icon: ShieldAlert, color: '#f59e0b', title: 'Fraud Attempt Blocked', text: 'Suspicious VPN/proxy click auto-rejected (Risk: 98).', time: '1 hr ago' },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setBellOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

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

        {/* Global Marketplace Search (clean icon button when collapsed, input when expanded) */}
        <div className="topbar-search-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {!searchOpen && !globalSearch ? (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              title="Search surveys, vendors, clients, IDs..."
              style={{
                width: '36px',
                height: '36px',
                border: '1px solid #e3ebf6',
                borderRadius: '8px',
                background: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Search size={16} color="#68728c" />
            </button>
          ) : (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search
                size={15}
                color="#68728c"
                style={{
                  position: 'absolute',
                  left: '12px',
                  pointerEvents: 'none',
                }}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={globalSearch || ''}
                onChange={(e) => onGlobalSearch && onGlobalSearch(e.target.value)}
                placeholder="Search surveys, vendors, clients, IDs..."
                aria-label="Search marketplace"
                style={{
                  width: '260px',
                  height: '36px',
                  paddingLeft: '36px',
                  paddingRight: globalSearch ? '28px' : '12px',
                  border: '1px solid #1761fd',
                  borderRadius: '8px',
                  background: '#ffffff',
                  fontSize: '12.5px',
                  color: '#303e67',
                  outline: 'none',
                  boxShadow: '0 0 0 3px rgba(23, 97, 253, 0.1)',
                  boxSizing: 'border-box',
                }}
                onBlur={() => {
                  if (!globalSearch) setSearchOpen(false);
                }}
              />
              {globalSearch && (
                <button
                  type="button"
                  onClick={() => {
                    if (onGlobalSearch) onGlobalSearch('');
                    setSearchOpen(false);
                  }}
                  title="Clear search"
                  style={{
                    position: 'absolute',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#8997bd',
                    cursor: 'pointer',
                    fontSize: '13px',
                    lineHeight: 1,
                    padding: '2px',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sync Button (VMH crisp pill style with animated refresh) */}
        {onSync && (
          <button
            className="btn-new-task"
            onClick={onSync}
            disabled={syncing}
            title="Sync live inventory & demand stats"
          >
            <RefreshCw size={13} className={syncing ? 'sync-spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync'}</span>
          </button>
        )}
      </div>

      {/* Right Topbar Content */}
      <div className="topbar-right-side">

        {/* Notifications Bell with Working Dropdown */}
        <div className="topbar-bell-wrap" ref={bellRef} style={{ position: 'relative' }}>
          <button
            className="topbar-bell-btn"
            title="Notifications"
            aria-label="Notifications"
            onClick={() => setBellOpen(prev => !prev)}
          >
            <Bell size={19} strokeWidth={2} color="#68728c" />
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#f5325c',
              border: '2px solid #ffffff',
            }} />
          </button>

          {bellOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 10px)',
              width: '320px',
              background: '#ffffff',
              border: '1px solid #e3ebf6',
              borderRadius: '8px',
              boxShadow: '0 12px 32px rgba(29, 44, 72, 0.14)',
              zIndex: 60,
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f1f5fa',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1d2c48' }}>Notifications</span>
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#1761fd', background: 'rgba(23,97,253,0.08)', padding: '2px 8px', borderRadius: '999px' }}>
                  {notifications.length} New
                </span>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} style={{
                      display: 'flex',
                      gap: '10px',
                      padding: '12px 16px',
                      borderBottom: '1px solid #f8fafc',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '8px',
                        background: `${n.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon size={15} color={n.color} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#1d2c48' }}>{n.title}</div>
                        <div style={{ fontSize: '11px', color: '#8997bd', lineHeight: 1.4 }}>{n.text}</div>
                        <div style={{ fontSize: '10px', color: '#9ba7ca', marginTop: '2px' }}>{n.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile (Avatar + Admin) with Dropdown */}
        <div className="user-profile-menu" ref={dropdownRef}>
          <div
            className="user-profile-trigger"
            onClick={() => setDropdownOpen(prev => !prev)}
            title="VMH Admin Profile & Settings"
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
              <span className="user-profile-name">
                {localStorage.getItem('smr_auth_user') || 'Admin'}
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: '4px',
                background: activeRole === 'Admin' ? 'rgba(23, 97, 253, 0.12)' : activeRole === 'Developer' ? 'rgba(147, 51, 234, 0.12)' : activeRole === 'Customer' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                color: activeRole === 'Admin' ? '#1761fd' : activeRole === 'Developer' ? '#9333ea' : activeRole === 'Customer' ? '#d97706' : '#10b981'
              }}>
                {activeRole}
              </span>
            </div>
            <img
              src="/vmh-logo.png"
              alt="VMH Admin"
              className="user-profile-avatar"
              style={{ objectFit: 'contain', background: '#ffffff', padding: '1px' }}
            />
          </div>

          {/* Admin Dropdown Menu with Working Actions */}
          {dropdownOpen && (
            <div className="dastone-user-dropdown">
              <div className="dropdown-header">
                <div className="name">{localStorage.getItem('smr_auth_user') || 'Admin'} ({activeRole})</div>
                <div className="email">admin@vmhgroupsmr.com</div>
              </div>

              {/* RBAC Role Switcher */}
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderBottom: '1px solid #f1f5fa' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Switch RBAC Role
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginTop: '6px' }}>
                  {['Admin', 'Developer', 'User', 'Customer'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoleSelect(r)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: activeRole === r ? 800 : 500,
                        background: activeRole === r ? '#1761fd' : '#ffffff',
                        color: activeRole === r ? '#ffffff' : '#334155',
                        border: '1px solid',
                        borderColor: activeRole === r ? '#1761fd' : '#e2e8f0',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  if (onOpenProfile) onOpenProfile();
                }}
              >
                <User size={15} color="#1761fd" />
                <span>Profile</span>
              </button>

              <button
                className="dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  if (onOpenSettings) onOpenSettings();
                }}
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
