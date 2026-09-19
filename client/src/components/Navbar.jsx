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
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);
  const searchInputRef = useRef(null);

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

        {/* Global Marketplace Search (expanding input) */}
        <div className="topbar-search-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            ref={searchInputRef}
            type="text"
            value={globalSearch || ''}
            onChange={(e) => onGlobalSearch && onGlobalSearch(e.target.value)}
            placeholder="Search surveys, IDs, countries..."
            aria-label="Search marketplace"
            style={{
              width: searchOpen ? '260px' : '44px',
              height: '36px',
              paddingLeft: searchOpen ? '38px' : '14px',
              paddingRight: '12px',
              border: '1px solid #e3ebf6',
              borderRadius: '8px',
              background: '#ffffff',
              fontSize: '12.5px',
              color: '#303e67',
              outline: 'none',
              cursor: searchOpen ? 'text' : 'pointer',
              transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), padding 0.25s',
              boxSizing: 'border-box',
            }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => { if (!globalSearch) setSearchOpen(false); }}
          />
          <Search
            size={16}
            color="#68728c"
            style={{
              position: 'absolute',
              left: searchOpen ? '13px' : '14px',
              pointerEvents: 'none',
              transition: 'left 0.25s',
            }}
          />
        </div>

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

          {/* Admin Dropdown Menu with Working Actions */}
          {dropdownOpen && (
            <div className="dastone-user-dropdown">
              <div className="dropdown-header">
                <div className="name">{localStorage.getItem('smr_auth_user') || 'Admin'} (Super Admin)</div>
                <div className="email">admin@vmhgroupsmr.com</div>
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
