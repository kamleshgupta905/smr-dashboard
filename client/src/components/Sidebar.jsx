import React, { useState, useEffect } from 'react';
import {
  Home,
  LayoutGrid,
  ShieldCheck,
  Terminal,
    Briefcase,
  Database,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  currentReportSubTab, 
  onTabChange, 
  setActiveTab, 
  isOpen, 
  onClose, 
  collapsed,
  userPermissions,
  currentUser
}) {
  const changeTab = onTabChange || setActiveTab || (() => {});

  // Dropdown states for each section
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [appsOpen, setAppsOpen] = useState(true);
  const [securityOpen, setSecurityOpen] = useState(true);
  const [developerOpen, setDeveloperOpen] = useState(true);
  const [opsOpen, setOpsOpen] = useState(true);

  // Check if current user has permission for a specific menu ID
  const isPermitted = (menuId) => {
    // Super Admin / Developer has full system access
    if (
      !currentUser ||
      currentUser.role_id === 1 ||
      currentUser.role_name === 'Developer' ||
      currentUser.role === 'Developer' ||
      currentUser.role_name === 'Admin' ||
      currentUser.username === 'admin' ||
      currentUser.username === 'vmhgroup'
    ) {
      return true;
    }

    const perms = userPermissions || (currentUser && currentUser.permissions) || null;
    if (!perms || !Array.isArray(perms) || perms.length === 0) {
      return true; // Default fallback to preserve full usability if unassigned
    }

    return perms.includes(Number(menuId));
  };

  // Auto-expand the dropdown containing the active tab
  useEffect(() => {
    if (['dashboard', 'surveys'].includes(activeTab)) {
      setDashboardOpen(true);
    } else if (['clients', 'vendors'].includes(activeTab)) {
      setAppsOpen(true);
    } else if (['security'].includes(activeTab)) {
      setSecurityOpen(true);
    } else if (['bids', 'payments', 'leads'].includes(activeTab)) {
      setOpsOpen(true);
    } else if (['developer-center', 'users', 'team', 'reference'].includes(activeTab)) {
      setDeveloperOpen(true);
    }
  }, [activeTab]);

  const handleNav = (tabKey, subKey) => {
    changeTab(tabKey, subKey);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'mobile-open' : ''}`} 
        onClick={onClose}
      />

      {/* VMH Sidebar with Accordion Dropdowns & Collapse Support */}
      <aside className={`dastone-sidebar ${collapsed ? 'collapsed' : ''} ${isOpen ? 'mobile-open' : ''}`}>
        
        {/* Brand Header */}
        <div className="sidebar-brand-header">
          <div 
            className="brand-logo-container" 
            onClick={() => handleNav('dashboard')}
            title="VMH Group SMR"
            style={{ display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer' }}
          >
            <img 
              src="/vmh-logo.png" 
              alt="VMH Group" 
              style={{ height: '36px', width: 'auto', objectFit: 'contain', display: 'block' }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <span className="brand-text" style={{ fontSize: '15px', fontWeight: 800, color: '#1d2c48', letterSpacing: '-0.2px' }}>
                VMH GROUP'S
              </span>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#1761fd', letterSpacing: '0.8px' }}>
                SMR PLATFORM
              </span>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="mobile-close-btn"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Sidebar Menu Body with Dropdowns */}
        <div className="sidebar-scrollable-content">
          
          {/* Section: MAIN */}
          {(isPermitted(1) || isPermitted(7)) && (
            <>
              <div className="sidebar-section-title">MAIN</div>

              {/* Dropdown 1: Dashboard */}
              <div className="sidebar-nav-group">
                <button 
                  className={`sidebar-nav-heading ${['dashboard', 'surveys'].includes(activeTab) ? 'active' : ''}`}
                  onClick={() => setDashboardOpen(prev => !prev)}
                >
                  <div className="nav-heading-left">
                    <Home size={16} className="nav-icon" />
                    <span>Dashboard</span>
                  </div>
                  <span className={`dropdown-chevron ${dashboardOpen ? 'rotated' : ''}`}>
                    <ChevronRight size={14} />
                  </span>
                </button>

                <div className={`sidebar-submenu-collapsible ${dashboardOpen ? 'open' : 'closed'}`}>
                  <div className="sidebar-submenu-inner">
                    {isPermitted(1) && (
                      <button
                        className={`submenu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => handleNav('dashboard')}
                      >
                        <span className="bullet-circle" />
                        <span>Overview</span>
                      </button>
                    )}
                    
                    {isPermitted(7) && (
                      <button
                        className={`submenu-item ${activeTab === 'surveys' ? 'active' : ''}`}
                        onClick={() => handleNav('surveys')}
                      >
                        <span className="bullet-circle" />
                        <span>Surveys</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Section: PARTNERS */}
          {(isPermitted(6) || isPermitted(8)) && (
            <div className="sidebar-nav-group">
              <button 
                className={`sidebar-nav-heading ${['clients', 'vendors'].includes(activeTab) ? 'active' : ''}`}
                onClick={() => setAppsOpen(prev => !prev)}
              >
                <div className="nav-heading-left">
                  <LayoutGrid size={16} className="nav-icon" />
                  <span>Partners</span>
                </div>
                <span className={`dropdown-chevron ${appsOpen ? 'rotated' : ''}`}>
                  <ChevronRight size={14} />
                </span>
              </button>

              <div className={`sidebar-submenu-collapsible ${appsOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-submenu-inner">
                  {isPermitted(6) && (
                    <button
                      className={`submenu-item ${activeTab === 'clients' ? 'active' : ''}`}
                      onClick={() => handleNav('clients')}
                    >
                      <span className="bullet-circle" />
                      <span>Clients</span>
                    </button>
                  )}
                  {isPermitted(8) && (
                    <button
                      className={`submenu-item ${activeTab === 'vendors' ? 'active' : ''}`}
                      onClick={() => handleNav('vendors')}
                    >
                      <span className="bullet-circle" />
                      <span>Vendors</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section: OPERATIONS */}
          {(isPermitted(7) || isPermitted(10) || (!currentUser || currentUser.role_id === 1)) && (
            <>
              <div className="sidebar-dotted-divider" />
              <div className="sidebar-section-title">OPERATIONS</div>

              <div className="sidebar-nav-group">
                <button 
                  className={`sidebar-nav-heading ${['bids', 'payments', 'leads'].includes(activeTab) ? 'active' : ''}`}
                  onClick={() => setOpsOpen(prev => !prev)}
                >
                  <div className="nav-heading-left">
                    <Briefcase size={16} className="nav-icon" />
                    <span>Operations & Payouts</span>
                  </div>
                  <span className={`dropdown-chevron ${opsOpen ? 'rotated' : ''}`}>
                    <ChevronRight size={14} />
                  </span>
                </button>

                <div className={`sidebar-submenu-collapsible ${opsOpen ? 'open' : 'closed'}`}>
                  <div className="sidebar-submenu-inner">
                    <button
                      className={`submenu-item ${activeTab === 'bids' ? 'active' : ''}`}
                      onClick={() => handleNav('bids')}
                    >
                      <span className="bullet-circle" />
                      <span>Bids & Feasibility</span>
                    </button>
                    <button
                      className={`submenu-item ${activeTab === 'payments' ? 'active' : ''}`}
                      onClick={() => handleNav('payments')}
                    >
                      <span className="bullet-circle" />
                      <span>Vendor Payments</span>
                    </button>
                    <button
                      className={`submenu-item ${activeTab === 'leads' ? 'active' : ''}`}
                      onClick={() => handleNav('leads')}
                    >
                      <span className="bullet-circle" />
                      <span>Traffic Leads Stream</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}



          {/* Section: MANAGEMENT */}
          {(isPermitted(2) || isPermitted(3) || isPermitted(4) || isPermitted(7) || (!currentUser || currentUser.role_id === 1)) && (
            <>
              <div className="sidebar-dotted-divider" />
              <div className="sidebar-section-title">MANAGEMENT</div>

              {/* Dropdown: Security & Quality Controls */}
              {(!currentUser || currentUser.role_id === 1 || isPermitted(4)) && (
                <div className="sidebar-nav-group">
                  <button 
                    className={`sidebar-nav-heading ${['security'].includes(activeTab) ? 'active' : ''}`}
                    onClick={() => setSecurityOpen(prev => !prev)}
                  >
                    <div className="nav-heading-left">
                      <ShieldCheck size={16} className="nav-icon" />
                      <span>Security & Fraud Controls</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`dropdown-chevron ${securityOpen ? 'rotated' : ''}`}>
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </button>

                  <div className={`sidebar-submenu-collapsible ${securityOpen ? 'open' : 'closed'}`}>
                    <div className="sidebar-submenu-inner">
                      <button
                        className={`submenu-item ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => handleNav('security')}
                      >
                        <span className="bullet-circle" />
                        <span>Security & Fraud Gate</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Dropdown: System & Team */}
              {(isPermitted(2) || isPermitted(3) || isPermitted(4) || (!currentUser || currentUser.role_id === 1)) && (
                <div className="sidebar-nav-group">
                  <button 
                    className={`sidebar-nav-heading ${['developer-center', 'users', 'team', 'reference'].includes(activeTab) ? 'active' : ''}`}
                    onClick={() => setDeveloperOpen(prev => !prev)}
                  >
                    <div className="nav-heading-left">
                      <Terminal size={16} className="nav-icon" />
                      <span>System & Team</span>
                    </div>
                    <span className={`dropdown-chevron ${developerOpen ? 'rotated' : ''}`}>
                      <ChevronRight size={14} />
                    </span>
                  </button>

                  <div className={`sidebar-submenu-collapsible ${developerOpen ? 'open' : 'closed'}`}>
                    <div className="sidebar-submenu-inner">
                      {(!currentUser || currentUser.role_id === 1 || isPermitted(4)) && (
                        <button
                          className={`submenu-item ${activeTab === 'developer-center' ? 'active' : ''}`}
                          onClick={() => handleNav('developer-center')}
                        >
                          <span className="bullet-circle" />
                          <span>API & Integrations</span>
                        </button>
                      )}
                      {(isPermitted(2) || isPermitted(3) || isPermitted(4) || (!currentUser || currentUser.role_id === 1)) && (
                        <>
                          <button
                            className={`submenu-item ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => handleNav('users')}
                          >
                            <span className="bullet-circle" />
                            <span>User Management</span>
                          </button>
                          <button
                            className={`submenu-item ${activeTab === 'team' ? 'active' : ''}`}
                            onClick={() => handleNav('team')}
                          >
                            <span className="bullet-circle" />
                            <span>Team Directory</span>
                          </button>
                          <button
                            className={`submenu-item ${activeTab === 'reference' ? 'active' : ''}`}
                            onClick={() => handleNav('reference')}
                          >
                            <span className="bullet-circle" />
                            <span>Reference Data</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

      </aside>
    </>
  );
}
