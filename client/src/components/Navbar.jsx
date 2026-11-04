import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldAlert,
  User,
  X,
  Zap,
  RefreshCw,
} from 'lucide-react';

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
  currentUser,
  isImpersonating,
  onExitImpersonation,
  pageTitle,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchRef = useRef(null);

  const displayName = currentUser?.name || currentUser?.username || localStorage.getItem('smr_auth_user') || 'Admin';
  const activeRole = currentUser?.role_name || currentUser?.role || localStorage.getItem('smr_auth_role') || 'Admin';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'A';

  const notifications = [
    { id: 1, icon: Zap, color: '#0f766e', title: 'Inventory synced', text: `${surveyCount || 0} live surveys are available.`, time: 'Just now' },
    { id: 2, icon: CheckCircle2, color: '#15803d', title: 'Reconciliation verified', text: 'The latest billing audit passed.', time: '25 min ago' },
    { id: 3, icon: ShieldAlert, color: '#b45309', title: 'Fraud signal blocked', text: 'A suspicious traffic pattern was rejected.', time: '1 hr ago' },
  ];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) setNotificationsOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target) && !globalSearch) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [globalSearch]);

  useEffect(() => {
    const handleKeyboardShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        if (globalSearch) onGlobalSearch?.('');
      }
    };
    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => document.removeEventListener('keydown', handleKeyboardShortcut);
  }, [globalSearch, onGlobalSearch]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.querySelector('input')?.focus();
  }, [searchOpen]);

  const handleMenuToggle = () => {
    if (onToggleSidebar) onToggleSidebar();
    else if (onToggleMobileMenu) onToggleMobileMenu();
  };

  return (
    <header className={`smr-topbar ${sidebarCollapsed ? 'is-expanded' : ''}`}>
      <div className="smr-topbar-left">
        <button
          type="button"
          className="smr-icon-button smr-menu-button"
          onClick={handleMenuToggle}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Open navigation'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Open navigation'}
        >
          <Menu size={19} />
        </button>
        <div className="smr-breadcrumbs">
          <span>Workspace</span>
          <span className="smr-breadcrumb-divider">/</span>
          <strong>{pageTitle || 'Dashboard'}</strong>
        </div>
      </div>

      <div className="smr-topbar-right">
        <div className={`smr-global-search ${searchOpen || globalSearch ? 'is-open' : ''}`} ref={searchRef}>
          {!searchOpen && !globalSearch ? (
            <button
              type="button"
              className="smr-icon-button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search workspace"
              title="Search surveys, vendors, clients, and IDs"
            >
              <Search size={17} />
              <kbd className="smr-search-hint">⌘K</kbd>
            </button>
          ) : (
            <>
              <Search size={16} className="smr-search-icon" aria-hidden="true" />
              <input
                value={globalSearch || ''}
                onChange={(event) => onGlobalSearch?.(event.target.value)}
                placeholder="Search workspace"
                aria-label="Search workspace"
              />
              {(globalSearch || searchOpen) && (
                <button
                  type="button"
                  className="smr-search-clear"
                  onClick={() => {
                    onGlobalSearch?.('');
                    setSearchOpen(false);
                  }}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </>
          )}
        </div>

        {onSync && (
          <button type="button" className="smr-sync-button" onClick={onSync} disabled={syncing}>
            <RefreshCw size={15} className={syncing ? 'is-spinning' : ''} />
            <span>{syncing ? 'Syncing' : 'Sync inventory'}</span>
          </button>
        )}

        <div className="smr-topbar-divider" aria-hidden="true" />

        <div className="smr-popover-anchor" ref={notificationsRef}>
          <button
            type="button"
            className="smr-icon-button smr-notification-button"
            onClick={() => setNotificationsOpen((open) => !open)}
            aria-expanded={notificationsOpen}
            aria-label="Open notifications"
          >
            <Bell size={17} />
            <span className="smr-notification-dot" aria-label="Unread notifications" />
          </button>
          {notificationsOpen && (
            <div className="smr-popover smr-notifications-popover">
              <div className="smr-popover-heading">
                <div><strong>Notifications</strong><span>Live workspace activity</span></div>
                <span className="smr-count-badge">{notifications.length} new</span>
              </div>
              <div className="smr-notification-list">
                {notifications.map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <div className="smr-notification-item" key={notification.id}>
                      <span className="smr-notification-icon" style={{ color: notification.color }}><Icon size={15} /></span>
                      <div>
                        <strong>{notification.title}</strong>
                        <p>{notification.text}</p>
                        <time>{notification.time}</time>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button type="button" className="smr-popover-footer" onClick={() => setNotificationsOpen(false)}>Mark all as read</button>
            </div>
          )}
        </div>

        <div className="smr-popover-anchor" ref={profileRef}>
          <button
            type="button"
            className="smr-profile-trigger"
            onClick={() => setProfileOpen((open) => !open)}
            aria-expanded={profileOpen}
          >
            <span className="smr-avatar" aria-hidden="true">{initials}</span>
            <span className="smr-profile-copy"><strong>{displayName}</strong><small>{activeRole}{isImpersonating ? ' · Preview' : ''}</small></span>
            <ChevronDown size={15} className={`smr-profile-chevron ${profileOpen ? 'is-open' : ''}`} />
          </button>

          {profileOpen && (
            <div className="smr-popover smr-profile-popover">
              <div className="smr-profile-summary">
                <span className="smr-avatar smr-avatar--large">{initials}</span>
                <div><strong>{displayName}</strong><span>{currentUser?.email || `${String(currentUser?.username || 'admin').toLowerCase()}@vmhgroupsmr.com`}</span></div>
              </div>
              <div className="smr-popover-role">{activeRole}{isImpersonating ? ' · Preview mode' : ''}</div>
              {isImpersonating && (
                <button type="button" className="smr-popover-action smr-popover-action--warning" onClick={() => { setProfileOpen(false); onExitImpersonation?.(); }}>
                  <LogOut size={15} /> Exit preview mode
                </button>
              )}
              <button type="button" className="smr-popover-action" onClick={() => { setProfileOpen(false); onOpenProfile?.(); }}>
                <User size={15} /> Profile &amp; team
              </button>
              <button type="button" className="smr-popover-action" onClick={() => { setProfileOpen(false); onOpenSettings?.(); }}>
                <Settings size={15} /> Security settings
              </button>
              <div className="smr-popover-line" />
              <button type="button" className="smr-popover-action smr-popover-action--danger" onClick={() => { setProfileOpen(false); onLogout?.(); }}>
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
