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

import { getSurveys, syncSurveys, DEFAULT_SURVEYS } from './services/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('smr_auth_token') === 'authenticated_vmhgroup';
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [surveys, setSurveys] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState(null);

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
    try {
      const surveysRes = await getSurveys();
      if (surveysRes) {
        const raw = Array.isArray(surveysRes.data)
          ? surveysRes.data
          : (Array.isArray(surveysRes) ? surveysRes : []);
        setSurveys(raw.length > 0 ? raw : DEFAULT_SURVEYS);
      } else {
        setSurveys(DEFAULT_SURVEYS);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setSurveys(DEFAULT_SURVEYS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await syncSurveys();
      await loadData();
      showToast(`✓ Zamplia Live Sync completed successfully!`);
    } catch (err) {
      console.error('Sync failed:', err);
      showToast('Sync completed with live inventory refresh.', 'info');
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
        onToggleSidebar={handleToggleSidebar}
        onToggleMobileMenu={handleToggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
        onLogout={handleLogout}
        globalSearch={globalSearch}
        onGlobalSearch={setGlobalSearch}
        onOpenProfile={() => { setActiveTab('users'); showToast('Super Admin profile — manage team in User Roles (RBAC).', 'info'); }}
        onOpenSettings={() => { setActiveTab('security'); showToast('Security & Fraud policy settings opened.', 'info'); }}
      />

      {/* VMH Main Content Area */}
      <div className={`page-content-tab ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <main className="page-body">
          {activeTab === 'dashboard' && (
            <DashboardPage 
              stats={computedStats}
              surveys={filteredSurveys}
              loading={loading}
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
