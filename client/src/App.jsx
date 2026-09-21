import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import SurveysPage from './pages/SurveysPage';
import TopPicksPage from './pages/TopPicksPage';
import ProjectsPage from './pages/ProjectsPage';
import VendorsPage from './pages/VendorsPage';
import ReconciliationPage from './pages/ReconciliationPage';
import ReferenceDataPage from './pages/ReferenceDataPage';
import ClientsPage from './pages/ClientsPage';
import SecurityFraudPage from './pages/SecurityFraudPage';
import ApiDeveloperCenterPage from './pages/ApiDeveloperCenterPage';
import UserManagementPage from './pages/UserManagementPage';
import QuotasModal from './components/QuotasModal';
import QualsModal from './components/QualsModal';
import AssignVendorModal from './components/AssignVendorModal';
import LoginPage from './components/LoginPage';
import { normalizeSurveys } from './utils/normalize';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

import { getSurveys, syncSurveys, getSystemStatus, DEFAULT_SURVEYS } from './services/api';

export default function App() {
  // Accept any non-empty token: the backend issues a real JWT on successful
  // login, while the offline fallback stores 'authenticated_vmhgroup'.
  // (Previously only the fallback string matched, so users were logged out on
  // every page reload whenever the backend was reachable — a real bug.)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('smr_auth_token');
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [surveys, setSurveys] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState(null);
  // System status: live reachability of Zamplia / Market Xcel / MongoDB.
  // `dataMode` is 'live' only when the real Zamplia API answered successfully.
  const [systemStatus, setSystemStatus] = useState(null);
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [dataMode, setDataMode] = useState('unknown');

  const handleToggleSidebar = () => {
    if (window.innerWidth < 992) {
      setMobileMenuOpen(prev => !prev);
    } else {
      setSidebarCollapsed(prev => !prev);
    }
  };

  // Modal states
  const [quotasModalId, setQuotasModalId] = useState(null);
  const [qualsModalId, setQualsModalId] = useState(null);
  const [assignModalId, setAssignModalId] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const surveysRes = await getSurveys();
      if (surveysRes) {
        const raw = Array.isArray(surveysRes.data)
          ? surveysRes.data
          : (Array.isArray(surveysRes) ? surveysRes : []);
        setSurveys(raw.length > 0 ? raw : DEFAULT_SURVEYS);
        // The server reports honestly whether this batch is live or simulated.
        if (typeof surveysRes.simulated === 'boolean') {
          setDataMode(surveysRes.simulated ? 'demo' : 'live');
        }
      } else {
        setSurveys(DEFAULT_SURVEYS);
        setDataMode('demo');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setSurveys(DEFAULT_SURVEYS);
      setDataMode('demo');
    } finally {
      setLoading(false);
    }
  };

  const loadStatus = async (force = false) => {
    const st = await getSystemStatus(force);
    if (st && st.success) {
      setSystemStatus(st);
      if (st.upstreams?.zamplia?.live) setDataMode('live');
    }
    return st;
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      loadStatus();
    }
  }, [isAuthenticated]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await syncSurveys();
      await Promise.all([loadData(), loadStatus(true)]);
      if (res && res.success === false) {
        showToast(res.message || 'Sync failed — check the backend connection.', 'error');
      } else if (res && res.message) {
        showToast(`✓ ${res.message}`, 'success');
      } else {
        showToast('✓ Zamplia Live Sync completed successfully!', 'success');
      }
    } catch (err) {
      console.error('Sync failed:', err);
      showToast('Sync failed — backend unreachable. Showing cached inventory.', 'error');
      await loadData();
    } finally {
      setSyncing(false);
    }
  };

  // Real stats computed from the live inventory — no hardcoded placeholder numbers.
  const computedStats = useMemo(() => {
    const list = normalizeSurveys(surveys);
    const total = list.length;
    const active = list.filter(s => s.status === 'Live' || !s.status).length;
    const avgCpi = total > 0
      ? Number((list.reduce((acc, s) => acc + (s.cpi || 0), 0) / total).toFixed(2))
      : 0;
    const demandSources = new Set(list.map(s => s.client).filter(Boolean)).size;
    return {
      totalSurveys: total,
      activeSurveys: active,
      avgCpi,
      activeVendors: demandSources
    };
  }, [surveys]);

  // Global search filters the marketplace across every page
  const filteredSurveys = useMemo(() => {
    const term = (globalSearch || '').toLowerCase().trim();
    if (!term) return surveys;
    return surveys.filter((s) =>
      String(s.survey_id ?? s.SurveyId ?? s.id ?? '').toLowerCase().includes(term) ||
      String(s.survey_name ?? s.Name ?? '').toLowerCase().includes(term) ||
      String(s.country ?? s.Country ?? '').toLowerCase().includes(term) ||
      String(s.category ?? s.IndustryName ?? '').toLowerCase().includes(term) ||
      String(s.client ?? '').toLowerCase().includes(term)
    );
  }, [surveys, globalSearch]);

  const pageTitles = {
    dashboard: 'Marketplace Dashboard',
    users: 'User Management (RBAC)',
    clients: 'Demand Clients & S2S Integration',
    vendors: 'Vendors & Sample Panels',
    surveys: 'Allocated Survey Marketplace',
    'developer-center': 'API Developer Center & Interactive Sandbox',
    'top-picks': 'High-Yield Top Picks',
    security: 'Security & Fraud Screening Engine',
    projects: 'Custom Client Projects',
    reconciliation: 'Zamplia Reconciliation & Audit',
    reference: 'Reference Catalogs & Taxonomies'
  };

  const handleLogout = () => {
    localStorage.removeItem('smr_auth_token');
    localStorage.removeItem('smr_auth_user');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => {
      setIsAuthenticated(true);
      loadData();
    }} />;
  }

  return (
    <div className="page-wrapper">
      {/* VMH Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        collapsed={sidebarCollapsed}
      />

      {/* VMH Fixed Topbar with Working Sidebar Toggle & Sleek Bell */}
      <Navbar 
        pageTitle={pageTitles[activeTab] || 'Dashboard'}
        onSync={handleSync} 
        syncing={syncing} 
        surveyCount={surveys.length}
        systemStatus={systemStatus}
        dataMode={dataMode}
        onRecheckStatus={() => loadStatus(true)}
        onToggleSidebar={handleToggleSidebar}
        onToggleMobileMenu={handleToggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
        onLogout={handleLogout}
        globalSearch={globalSearch}
        onGlobalSearch={setGlobalSearch}
        onOpenProfile={() => { setActiveTab('users'); showToast('Super Admin profile — manage team in User Roles (RBAC).', 'info'); }}
        onOpenSettings={() => { setActiveTab('security'); showToast('Security & Fraud policy settings opened.', 'info'); }}
      />

      {/* Demo-data mode banner — shown whenever the live Zamplia API is not
          reachable, so operators are never silently shown simulated data. */}
      {dataMode === 'demo' && !dismissedBanner && (
        <div className="smr-status-banner" role="alert">
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          <span>
            <strong>Demo data mode:</strong> the live Zamplia / Market Xcel APIs are not reachable
            from this server right now, so the platform is showing its built-in demo inventory.
            All features still work. Check the <em>System Status</em> panel in the top bar for details.
          </span>
          <button className="smr-status-banner-close" onClick={() => setDismissedBanner(true)} aria-label="Dismiss">
            <X size={13} />
          </button>
        </div>
      )}

      {/* VMH Main Content Area */}
      <div className={`page-content-tab ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <main className="page-body">
          {activeTab === 'dashboard' && (
            <DashboardPage 
              stats={computedStats}
              surveys={filteredSurveys}
              loading={loading}
              systemStatus={systemStatus}
              dataMode={dataMode}
              onRecheckStatus={() => loadStatus(true)}
              onSync={handleSync}
              onNavigate={setActiveTab}
              onOpenQuotas={setQuotasModalId}
              onOpenQuals={setQualsModalId}
              onOpenAssign={setAssignModalId}
            />
          )}

          {activeTab === 'users' && <UserManagementPage />}
          {activeTab === 'clients' && <ClientsPage />}
          {activeTab === 'security' && <SecurityFraudPage />}
          {activeTab === 'developer-center' && <ApiDeveloperCenterPage />}

          {activeTab === 'surveys' && (
            <SurveysPage 
              surveys={filteredSurveys}
              loading={loading}
              onRefresh={handleSync}
              onAddSurvey={(newStudy) => {
                setSurveys(prev => [newStudy, ...prev]);
                showToast(`✓ Study #${newStudy.surveyId} launched & added to marketplace!`);
              }}
              onOpenQuotas={setQuotasModalId}
              onOpenQuals={setQualsModalId}
              onOpenAssign={setAssignModalId}
            />
          )}

          {activeTab === 'top-picks' && (
            <TopPicksPage 
              surveys={filteredSurveys}
              onOpenQuotas={setQuotasModalId}
              onOpenQuals={setQualsModalId}
              onOpenAssign={setAssignModalId}
            />
          )}

          {activeTab === 'projects' && <ProjectsPage />}
          {activeTab === 'vendors' && <VendorsPage />}
          {activeTab === 'reconciliation' && <ReconciliationPage />}
          {activeTab === 'reference' && <ReferenceDataPage />}

          {/* VMH Enterprise Footer */}
          <footer style={{
            margin: '24px -16px -16px -16px',
            padding: '14px 20px',
            borderTop: '1px solid #e3ebf6',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11.5px',
            color: '#8997bd'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/vmh-logo.png" alt="VMH" style={{ height: '18px', width: 'auto' }} />
              <span>&copy; {new Date().getFullYear()} <strong>VMH GROUP'S</strong> &bull; Survey Marketplace & Routing Platform</span>
            </div>
            <span style={{ fontSize: '11px', color: '#1761fd', fontWeight: 600 }}>v3.4 Production Engine</span>
          </footer>
        </main>
      </div>

      {/* Interactive Modals */}
      {quotasModalId && (
        <QuotasModal 
          surveyId={quotasModalId} 
          onClose={() => setQuotasModalId(null)} 
        />
      )}

      {qualsModalId && (
        <QualsModal 
          surveyId={qualsModalId} 
          onClose={() => setQualsModalId(null)} 
        />
      )}

      {assignModalId && (
        <AssignVendorModal 
          survey={surveys.find(s =>
            String(s.survey_id ?? s.SurveyId ?? s.id ?? s._id) === String(assignModalId)
          )}
          surveyId={assignModalId} 
          onClose={() => setAssignModalId(null)} 
        />
      )}

      {/* Toast Alert Notification */}
      {toast && (
        <div className="toast-container">
          <div className="toast">
            {toast.type === 'error' ? (
              <AlertTriangle size={18} color="#f87171" />
            ) : (
              <CheckCircle2 size={18} color="#10b981" />
            )}
            <span>{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '8px' }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
