import React, { useState, useEffect } from 'react';
import {
  Home,
  LayoutGrid,
  ShieldCheck,
  Terminal,
  BarChart3,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, currentReportSubTab, onTabChange, setActiveTab, isOpen, onClose, collapsed }) {
  const changeTab = onTabChange || setActiveTab || (() => {});

  // Dropdown states for each section
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [appsOpen, setAppsOpen] = useState(true);
  const [reportsOpen, setReportsOpen] = useState(true);
  const [securityOpen, setSecurityOpen] = useState(true);
  const [developerOpen, setDeveloperOpen] = useState(true);

  // Auto-expand the dropdown containing the active tab
  useEffect(() => {
    if (['dashboard', 'surveys'].includes(activeTab)) {
      setDashboardOpen(true);
    } else if (['clients', 'vendors'].includes(activeTab)) {
      setAppsOpen(true);
    } else if (activeTab === 'reconciliation') {
      setReportsOpen(true);
    } else if (['security', 'reference'].includes(activeTab)) {
      setSecurityOpen(true);
    } else if (['developer-center', 'users'].includes(activeTab)) {
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
                <button
                  className={`submenu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => handleNav('dashboard')}
                >
                  <span className="bullet-circle" />
                  <span>Overview</span>
                </button>
                <button
                  className={`submenu-item ${activeTab === 'surveys' ? 'active' : ''}`}
                  onClick={() => handleNav('surveys')}
                >
                  <span className="bullet-circle" />
                  <span>Surveys</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dropdown 2: Partners (Clients, Vendors) */}
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
                <button
                  className={`submenu-item ${activeTab === 'clients' ? 'active' : ''}`}
                  onClick={() => handleNav('clients')}
                >
                  <span className="bullet-circle" />
                  <span>Clients</span>
                </button>
                <button
                  className={`submenu-item ${activeTab === 'vendors' ? 'active' : ''}`}
                  onClick={() => handleNav('vendors')}
                >
                  <span className="bullet-circle" />
                  <span>Vendors</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dotted Divider */}
          <div className="sidebar-dotted-divider" />

          {/* Section: REPORTS & ANALYTICS */}
          <div className="sidebar-section-title">REPORTS & ANALYTICS</div>

          {/* Dropdown 3: Reports & Performance Hub */}
          <div className="sidebar-nav-group">
            <button 
              className={`sidebar-nav-heading ${activeTab === 'reconciliation' ? 'active' : ''}`}
              onClick={() => setReportsOpen(prev => !prev)}
            >
              <div className="nav-heading-left">
                <BarChart3 size={16} className="nav-icon" />
                <span>Reports Hub</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="badge-dastone-new" style={{ background: '#10B981', color: '#FFFFFF' }}>Live</span>
                <span className={`dropdown-chevron ${reportsOpen ? 'rotated' : ''}`}>
                  <ChevronRight size={14} />
                </span>
              </div>
            </button>

            <div className={`sidebar-submenu-collapsible ${reportsOpen ? 'open' : 'closed'}`}>
              <div className="sidebar-submenu-inner">
                <button
                  className={`submenu-item ${activeTab === 'reconciliation' && (!currentReportSubTab || currentReportSubTab === 'clients') ? 'active' : ''}`}
                  onClick={() => handleNav('reconciliation', 'clients')}
                >
                  <span className="bullet-circle" />
                  <span>Client Performance Reports</span>
                </button>
                <button
                  className={`submenu-item ${activeTab === 'reconciliation' && currentReportSubTab === 'vendors' ? 'active' : ''}`}
                  onClick={() => handleNav('reconciliation', 'vendors')}
                >
                  <span className="bullet-circle" />
                  <span>Vendor Performance Reports</span>
                </button>
                <button
                  className={`submenu-item ${activeTab === 'reconciliation' && currentReportSubTab === 'projects' ? 'active' : ''}`}
                  onClick={() => handleNav('reconciliation', 'projects')}
                >
                  <span className="bullet-circle" />
                  <span>Project / PID Reports</span>
                </button>
                <button
                  className={`submenu-item ${activeTab === 'reconciliation' && currentReportSubTab === 'journal' ? 'active' : ''}`}
                  onClick={() => handleNav('reconciliation', 'journal')}
                >
                  <span className="bullet-circle" />
                  <span>Respondent Audit Journal</span>
                </button>
                <button
                  className={`submenu-item ${activeTab === 'reconciliation' && currentReportSubTab === 'archive' ? 'active' : ''}`}
                  onClick={() => handleNav('reconciliation', 'archive')}
                >
                  <span className="bullet-circle" />
                  <span>Legacy Database Archive</span>
                  <span style={{ marginLeft: 'auto', fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', background: 'rgba(23, 97, 253, 0.15)', color: '#1761fd' }}>
                    1,554
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Dotted Divider */}
          <div className="sidebar-dotted-divider" />

          {/* Section: MANAGEMENT */}
          <div className="sidebar-section-title">MANAGEMENT</div>

          {/* Dropdown 4: Security & Quality Controls */}
          <div className="sidebar-nav-group">
            <button 
              className={`sidebar-nav-heading ${['security', 'reference'].includes(activeTab) ? 'active' : ''}`}
              onClick={() => setSecurityOpen(prev => !prev)}
            >
              <div className="nav-heading-left">
                <ShieldCheck size={16} className="nav-icon" />
                <span>Security & Reference</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="badge-dastone-new">Active</span>
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
                <button
                  className={`submenu-item ${activeTab === 'reference' ? 'active' : ''}`}
                  onClick={() => handleNav('reference')}
                >
                  <span className="bullet-circle" />
                  <span>Categories & Reference Data</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dropdown 4: System & Team */}
          <div className="sidebar-nav-group">
            <button 
              className={`sidebar-nav-heading ${['developer-center', 'users'].includes(activeTab) ? 'active' : ''}`}
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
                <button
                  className={`submenu-item ${activeTab === 'developer-center' ? 'active' : ''}`}
                  onClick={() => handleNav('developer-center')}
                >
                  <span className="bullet-circle" />
                  <span>API & Integrations</span>
                </button>
                <button
                  className={`submenu-item ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => handleNav('users')}
                >
                  <span className="bullet-circle" />
                  <span>Team Members</span>
                </button>
              </div>
            </div>
          </div>

          {/* VMH Network Status */}
          <div className="sidebar-bottom-promo" style={{ margin: '24px 14px 16px 14px', padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="pulse-dot" />
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b' }}>VMH Network</span>
              </div>
              <span className="badge-soft-success" style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>99.9% Up</span>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
              Zamplia Supply & Market Xcel Demand Connected
            </p>
          </div>

        </div>

      </aside>
    </>
  );
}
