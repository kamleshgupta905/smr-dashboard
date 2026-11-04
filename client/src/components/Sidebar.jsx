import React, { useEffect, useState } from 'react';
import {
  BriefcaseBusiness,
  ChevronDown,
  Home,
  LayoutGrid,
  ShieldCheck,
  Terminal,
  X,
} from 'lucide-react';

const groupForTab = {
  dashboard: 'overview',
  surveys: 'overview',
  clients: 'partners',
  vendors: 'partners',
  reconciliation: 'operations',
  payments: 'operations',
  leads: 'operations',
  security: 'operations',
  users: 'management',
  team: 'management',
  reference: 'management',
  'developer-center': 'management',
};

export default function Sidebar({
  activeTab,
  onTabChange,
  setActiveTab,
  isOpen,
  onClose,
  collapsed,
  userPermissions,
  currentUser,
}) {
  const changeTab = onTabChange || setActiveTab || (() => {});
  const [openGroups, setOpenGroups] = useState({
    overview: true,
    partners: true,
    operations: true,
    management: true,
  });

  const isVendor = currentUser?.role_name === 'Vendor' || currentUser?.role === 'Vendor';
  const isAdmin = Boolean(currentUser) && (
    currentUser.role_id === 1 ||
    ['Developer', 'Admin', 'Super Admin'].includes(currentUser.role_name) ||
    ['Developer', 'Admin', 'Super Admin'].includes(currentUser.role) ||
    ['admin', 'vmhgroup'].includes(String(currentUser.username || '').toLowerCase())
  );

  const isPermitted = (menuId) => {
    if (isVendor) return [1, 7, 9, 10].includes(Number(menuId));
    if (isAdmin) return true;
    if ([2, 3, 4, 5].includes(Number(menuId))) return false;
    const permissions = userPermissions || currentUser?.permissions || [];
    if (!Array.isArray(permissions) || permissions.length === 0) return false;
    return permissions.map(Number).includes(Number(menuId));
  };

  useEffect(() => {
    const activeGroup = groupForTab[activeTab];
    if (activeGroup) setOpenGroups((groups) => ({ ...groups, [activeGroup]: true }));
  }, [activeTab]);

  const handleNav = (tabKey, subKey) => {
    changeTab(tabKey, subKey);
    if (onClose) onClose();
  };

  const toggleGroup = (group) => {
    setOpenGroups((groups) => ({ ...groups, [group]: !groups[group] }));
  };

  const renderGroup = ({ id, label, icon: Icon, tabs, adminOnly = false }) => {
    const visibleTabs = tabs.filter((tab) => !tab.hidden && (!tab.permission || isPermitted(tab.permission)));
    if (adminOnly && !isAdmin) return null;
    if (!visibleTabs.length) return null;

    const groupActive = visibleTabs.some((tab) => tab.key === activeTab);
    const expanded = Boolean(openGroups[id]);

    return (
      <section className="smr-nav-section" key={id}>
        <button
          type="button"
          className={`smr-nav-section-toggle ${groupActive ? 'is-active' : ''}`}
          onClick={() => toggleGroup(id)}
          aria-expanded={expanded}
        >
          <span className="smr-nav-section-label"><Icon size={16} strokeWidth={1.8} />{label}</span>
          <ChevronDown size={15} className={`smr-nav-chevron ${expanded ? 'is-open' : ''}`} />
        </button>
        <div className={`smr-nav-items ${expanded ? 'is-open' : ''}`}>
          {visibleTabs.map((tab) => (
            <button
              type="button"
              key={tab.key}
              className={`smr-nav-item ${activeTab === tab.key ? 'is-active' : ''}`}
              onClick={() => handleNav(tab.key, tab.subKey)}
              title={tab.label}
            >
              <span className="smr-nav-item-mark" aria-hidden="true" />
              <span>{tab.label}</span>
              {tab.badge && <span className="smr-nav-item-badge">{tab.badge}</span>}
            </button>
          ))}
        </div>
      </section>
    );
  };

  return (
    <>
      <div className={`smr-sidebar-overlay ${isOpen ? 'is-visible' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`smr-sidebar ${collapsed ? 'is-collapsed' : ''} ${isOpen ? 'is-mobile-open' : ''}`}>
        <div className="smr-sidebar-head">
          <button type="button" className="smr-brand" onClick={() => handleNav('dashboard')} aria-label="Open overview">
            <span className="smr-brand-symbol" aria-hidden="true">S</span>
            <span className="smr-brand-copy">
              <strong>VMH GROUP</strong>
              <small>SMR CONTROL PLANE</small>
            </span>
          </button>
          {onClose && (
            <button type="button" className="smr-sidebar-close" onClick={onClose} aria-label="Close navigation">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="smr-sidebar-status">
          <span className="smr-status-dot" aria-hidden="true" />
          <span>Operations live</span>
          <span className="smr-status-code">IN / 01</span>
        </div>

        <nav className="smr-sidebar-nav" aria-label="Primary navigation">
          <div className="smr-sidebar-kicker">Workspace</div>
          {renderGroup({
            id: 'overview',
            label: 'Overview',
            icon: Home,
            tabs: [
              { key: 'dashboard', label: 'Dashboard', permission: 1 },
              { key: 'surveys', label: isVendor ? 'My allocated surveys' : 'Survey inventory', permission: 7 },
            ],
          })}
          {renderGroup({
            id: 'partners',
            label: 'Partners',
            icon: LayoutGrid,
            tabs: [
              { key: 'clients', label: 'Clients & demand', permission: 6 },
              { key: 'vendors', label: 'Supply vendors', permission: 8 },
            ],
          })}

          <div className="smr-sidebar-kicker smr-sidebar-kicker--spaced">Operations</div>
          {renderGroup({
            id: 'operations',
            label: 'Operations',
            icon: BriefcaseBusiness,
            tabs: [
              { key: 'payments', label: isVendor ? 'My payout statements' : 'Vendor payments', permission: 10 },
              { key: 'leads', label: isVendor ? 'My traffic & clicks' : 'Traffic & respondent logs', permission: 9 },
              { key: 'security', label: 'Security & fraud gate', permission: 11 },
              { key: 'reconciliation', label: 'Reconciliation', permission: 8 },
            ],
          })}

          <div className="smr-sidebar-kicker smr-sidebar-kicker--spaced">Administration</div>
          {renderGroup({
            id: 'management',
            label: 'System & team',
            icon: Terminal,
            tabs: [
              { key: 'users', label: 'User management', permission: 2 },
              { key: 'team', label: 'Team directory', permission: 12 },
              { key: 'reference', label: 'Reference data', permission: 13 },
              { key: 'developer-center', label: 'API developer center', permission: 14 },
            ],
          })}
        </nav>

        <div className="smr-sidebar-foot">
          <div className="smr-sidebar-foot-icon"><ShieldCheck size={16} /></div>
          <div>
            <strong>Protected workspace</strong>
            <span>Admin policies are active</span>
          </div>
        </div>
      </aside>
    </>
  );
}
