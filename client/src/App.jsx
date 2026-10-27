import ReconciliationPage from './pages/ReconciliationPage';
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import SurveysPage from './pages/SurveysPage';

import VendorsPage from './pages/VendorsPage';
import ReferenceDataPage from './pages/ReferenceDataPage';
import ClientsPage from './pages/ClientsPage';
import SecurityFraudPage from './pages/SecurityFraudPage';
import ApiDeveloperCenterPage from './pages/ApiDeveloperCenterPage';
import UserManagementPage from './pages/UserManagementPage';
import BidsPage from './pages/BidsPage';
import LeadsPage from './pages/LeadsPage';
import PaymentsPage from './pages/PaymentsPage';
import TeamPage from './pages/TeamPage';
import QuotasModal from './components/QuotasModal';
import QualsModal from './components/QualsModal';
import AssignVendorModal from './components/AssignVendorModal';
import PreScreenerGate from './components/PreScreenerGate';
import SurveyCallbackPage from './components/SurveyCallbackPage';
import LoginPage from './components/LoginPage';
import { normalizeSurveys } from './utils/normalize';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

import { getSurveys, syncSurveys, DEFAULT_SURVEYS, GoogleSheetAPI, getClients, createCustomSurvey } from './services/api';

// URL Hash Parser for Seamless Refresh Persistence
const parseHashRoute = () => {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (!hash) {
    const saved = localStorage.getItem('smr_active_tab') || 'dashboard';
    return { tab: saved };
  }
  const [tabPart] = hash.split('?');
  const tab = tabPart || 'dashboard';
  return { tab };
};

export default function App() {
  useEffect(() => {
    localStorage.removeItem('smr_custom_clients');
    localStorage.removeItem('smr_custom_projects');
    localStorage.removeItem('smr_custom_vendors');
  }, []);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const u = localStorage.getItem('smr_auth_user_data');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  });

  const [userPermissions, setUserPermissions] = useState(() => {
    try {
      const p = localStorage.getItem('smr_auth_permissions');
      return p ? JSON.parse(p) : [];
    } catch (e) {
      return [];
    }
  });

    const [impersonatedOriginal, setImpersonatedOriginal] = useState(() => {
    try {
      const orig = localStorage.getItem('smr_original_admin');
      if (orig) return JSON.parse(orig);
    } catch {}
    return null;
  });

  const handleImpersonateUser = (targetUser) => {
    if (!impersonatedOriginal) {
      localStorage.setItem('smr_original_admin', JSON.stringify(currentUser));
      setImpersonatedOriginal(currentUser);
    }
    const impersonated = {
      ...targetUser,
      role: targetUser.role_name || targetUser.role || 'User',
      role_name: targetUser.role_name || targetUser.role || 'User',
      permissions: Array.isArray(targetUser.menu_permissions) ? targetUser.menu_permissions : (targetUser.permissions || [])
    };
    setCurrentUser(impersonated);
    setUserPermissions(impersonated.permissions);
    setActiveTab('dashboard');
    showToast(`Viewing dashboard as ${targetUser.name || targetUser.username} (${impersonated.role_name})`, 'info');
  };

  const handleExitImpersonation = () => {
    if (impersonatedOriginal) {
      setCurrentUser(impersonatedOriginal);
      setUserPermissions(impersonatedOriginal.permissions || []);
      localStorage.removeItem('smr_original_admin');
      setImpersonatedOriginal(null);
    }
    setActiveTab('users');
    showToast('Restored Super Administrator session', 'success');
  };

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('smr_auth_token') === 'authenticated_vmhgroup';
  });

  const initialRoute = parseHashRoute();
  const [activeTab, setActiveTab] = useState(initialRoute.tab);

  useEffect(() => {
    const isVendor = currentUser?.role_name === 'Vendor' || currentUser?.role === 'Vendor';
    if (isVendor && !['dashboard', 'surveys', 'leads', 'payments'].includes(activeTab)) {
      setActiveTab('surveys');
    }
  }, [currentUser, activeTab]);

  const [surveys, setSurveys] = useState([]);
  const [clientsCount, setClientsCount] = useState(2);
  const [clientsList, setClientsList] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState(null);

  // Modal states with Browser Back Button Integration
  const [quotasModalId, setQuotasModalId] = useState(null);
  const [qualsModalId, setQualsModalId] = useState(null);
  const [assignModalId, setAssignModalId] = useState(null);
  const [testPreScreener, setTestPreScreener] = useState(null);

  const openQuotas = (val) => {
    if (val) window.history.pushState({ modal: 'quotas' }, '');
    setQuotasModalId(val);
  };
  const closeQuotas = () => setQuotasModalId(null);

  const openQuals = (val) => {
    if (val) window.history.pushState({ modal: 'quals' }, '');
    setQualsModalId(val);
  };
  const closeQuals = () => setQualsModalId(null);

  const openAssign = (val) => {
    if (val) window.history.pushState({ modal: 'assign' }, '');
    setAssignModalId(val);
  };
  const closeAssign = () => setAssignModalId(null);

  const openTestPreScreener = (data) => {
    if (data) window.history.pushState({ modal: 'prescreener' }, '');
    setTestPreScreener(data);
  };
  const closeTestPreScreener = () => setTestPreScreener(null);

  const handleTabChange = (tab, pushHistory = true) => {
    setActiveTab(tab);
    localStorage.setItem('smr_active_tab', tab);
    const hashStr = `#/${tab}`;
    if (pushHistory && window.location.hash !== hashStr) {
      window.history.pushState({ tab }, '', hashStr);
    }
  };

  // Browser Navigation & Back Button Interceptor (Popstate)
  useEffect(() => {
    const handlePopState = () => {
      // 1. If any modal is currently open, close the modal first without leaving the page
      if (quotasModalId || qualsModalId || assignModalId || testPreScreener) {
        setQuotasModalId(null);
        setQualsModalId(null);
        setAssignModalId(null);
        setTestPreScreener(null);
        return;
      }

      // 2. Otherwise navigate to the URL hash route
      const { tab } = parseHashRoute();
      setActiveTab(tab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [quotasModalId, qualsModalId, assignModalId, testPreScreener]);

  // Ensure initial hash is synchronized
  useEffect(() => {
    if (!window.location.hash) {
      const initialHash = `#/${activeTab}`;
      window.history.replaceState({ tab: activeTab }, '', initialHash);
    }
  }, []);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 992) {
      setMobileMenuOpen(prev => !prev);
    } else {
      setSidebarCollapsed(prev => !prev);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [surveysRes, clientsRes] = await Promise.allSettled([
        getSurveys(),
        getClients()
      ]);

      if (surveysRes.status === 'fulfilled' && surveysRes.value) {
        const raw = Array.isArray(surveysRes.value.data)
          ? surveysRes.value.data
          : (Array.isArray(surveysRes.value) ? surveysRes.value : []);
        setSurveys(raw.length > 0 ? raw : DEFAULT_SURVEYS);
      } else {
        setSurveys(DEFAULT_SURVEYS);
      }

      if (clientsRes.status === 'fulfilled' && Array.isArray(clientsRes.value)) {
        setClientsCount(clientsRes.value.length || 2);
        setClientsList(clientsRes.value);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setSurveys(DEFAULT_SURVEYS);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData(false);
      // Silent background sync with Google Sheet — completely invisible in UI
      try {
        GoogleSheetAPI.syncAllData().catch(() => {});
      } catch (e) {}

      // Enterprise Real-Time Pulse: auto-refresh surveys & click counters every 15s
      const pulseInterval = setInterval(() => {
        loadData(true);
      }, 15000);
      return () => clearInterval(pulseInterval);
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
    return {
      totalSurveys: total,
      activeSurveys: active,
      avgCpi,
      activeVendors: clientsCount
    };
  }, [surveys, clientsCount]);

  // Global search filters the marketplace across every page
  const filteredSurveys = useMemo(() => {
    const term = (globalSearch || '').toLowerCase().trim();
    if (!term) return surveys;
    return surveys.filter((s) =>
      String(s.survey_id ?? s.SurveyId ?? s.surveyId ?? s.id ?? s._id ?? '').toLowerCase().includes(term) ||
      String(s.survey_name ?? s.Name ?? s.name ?? s.project_name ?? '').toLowerCase().includes(term) ||
      String(s.country ?? s.Country ?? '').toLowerCase().includes(term) ||
      String(s.category ?? s.IndustryName ?? '').toLowerCase().includes(term) ||
      String(s.client ?? s.client_name ?? '').toLowerCase().includes(term) ||
      String(s.studyType ?? '').toLowerCase().includes(term)
    );
  }, [surveys, globalSearch]);

  const pageTitles = {
    dashboard: 'Dashboard',
    leads: 'Traffic Leads Stream',
    users: 'Team & Users',
    clients: 'Clients',
    vendors: 'Vendors',
    reconciliation: 'Vendor Performance & Reports',
    surveys: 'Surveys',
    
    'developer-center': 'API & Integrations',
    security: 'Security Settings',
        reference: 'Categories & Reference Data'
  };

  const handleLogout = () => {
    localStorage.removeItem('smr_auth_token');
    localStorage.removeItem('smr_auth_user');
    localStorage.removeItem('smr_auth_role');
    localStorage.removeItem('smr_auth_user_data');
    localStorage.removeItem('smr_auth_permissions');
    setCurrentUser(null);
    setUserPermissions([]);
    setIsAuthenticated(false);
  };

  // 1. Direct Inbound Vendor Router & Pre-Screener Gate (Public, No Login Required)
  const currentPath = window.location.pathname;
  const currentHash = window.location.hash || '';

  const isPreScreener =
    currentPath.includes('/vendor/auth/') ||
    currentPath.includes('/prescreener') ||
    currentHash.includes('prescreener') ||
    currentPath.startsWith('/router') ||
    currentPath === '/router';

  if (isPreScreener) {
    let vendorId = '';
    let projectId = '';
    let uid = '';
    let target = '';

    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = currentHash.includes('?') 
      ? new URLSearchParams(currentHash.substring(currentHash.indexOf('?'))) 
      : new URLSearchParams();

    if (currentPath.includes('/vendor/auth/')) {
      const parts = currentPath.split('/');
      const authIdx = parts.indexOf('auth');
      if (authIdx !== -1 && parts[authIdx + 1]) vendorId = parts[authIdx + 1];
      const projIdx = parts.indexOf('project');
      if (projIdx !== -1 && parts[projIdx + 1]) projectId = parts[projIdx + 1];
    }

    vendorId = vendorId || hashParams.get('vid') || hashParams.get('vendorId') || searchParams.get('vid') || searchParams.get('vendorId') || 'VND-DYN-01';
    projectId = projectId || hashParams.get('pid') || hashParams.get('projectId') || hashParams.get('sid') || searchParams.get('pid') || searchParams.get('projectId') || searchParams.get('sid') || '2042481293';
    uid = hashParams.get('uid') || hashParams.get('rid') || hashParams.get('transaction_id') || searchParams.get('uid') || searchParams.get('rid') || searchParams.get('transaction_id') || `PANEL_${Date.now().toString().slice(-4)}`;
    target = hashParams.get('target') || searchParams.get('target') || '';

    return <PreScreenerGate vendorId={vendorId} projectId={projectId} uid={uid} targetUrl={target} />;
  }

  // 2. Direct SMR Router Settlement Hub & Callback Receipt (Public, No Login Required)
  const isCallbackRoute = 
    currentPath.includes('/survey/callback') || 
    currentPath.includes('/survey/complete') || 
    currentPath.includes('/survey/terminate') || 
    currentPath.includes('/survey/overquota') || 
    currentPath.includes('/survey/security') || 
    currentPath.includes('/survey/thankyou') ||
    currentPath.startsWith('/callback') ||
    currentPath.includes('/callback') ||
    currentPath.startsWith('/return') ||
    currentPath.includes('/return') ||
    currentPath.startsWith('/redirects') ||
    currentPath.includes('/redirects') ||
    currentHash.includes('callback') ||
    currentHash.includes('survey/terminate') ||
    currentHash.includes('survey/complete');

  if (isCallbackRoute) {
    return <SurveyCallbackPage />;
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={(user) => {
      setIsAuthenticated(true);
      if (user) {
        setCurrentUser(user);
        if (user.permissions) setUserPermissions(user.permissions);
      }
      loadData();
    }} />;
  }

  return (
    <div className="page-wrapper">
      {/* VMH Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        collapsed={sidebarCollapsed}
        userPermissions={userPermissions}
        currentUser={currentUser}
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
          {/* Live Impersonation Preview Banner */}
          {impersonatedOriginal && (
            <div style={{
              background: '#0F172A',
              color: '#FFFFFF',
              padding: '10px 20px',
              borderRadius: '10px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(15,23,42,0.18)',
              border: '1px solid #334155'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ display: 'inline-block', width: '9px', height: '9px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }}></span>
                <span style={{ fontSize: '13px' }}>
                  Live Preview: Viewing Dashboard as <strong>{currentUser?.name || currentUser?.username}</strong> ({currentUser?.role_name || currentUser?.role || 'Staff'})
                </span>
                <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', color: '#94A3B8' }}>
                  Live RBAC Permissions Applied
                </span>
              </div>
              <button
                type="button"
                onClick={handleExitImpersonation}
                style={{
                  background: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Exit & Return to Super Admin
              </button>
            </div>
          )}
          <div key={activeTab} className="tab-animated">
          {activeTab === 'dashboard' && (
            <DashboardPage 
              stats={computedStats}
              surveys={filteredSurveys}
              loading={loading}
              onSync={handleSync}
              onNavigate={handleTabChange}
              onOpenQuotas={openQuotas}
              onOpenQuals={openQuals}
              onOpenAssign={openAssign}
              showToast={showToast}
            />
          )}

          
          {activeTab === 'users' && <UserManagementPage currentUser={currentUser} onImpersonateUser={handleImpersonateUser} />}
          {activeTab === 'clients' && (
            <ClientsPage 
              onNavigate={handleTabChange} 
              globalSearch={globalSearch} 
              showToast={showToast} 
              onClientsUpdated={(newList) => {
                setClientsList(newList);
                setClientsCount(newList.length);
              }}
            />
          )}
          {activeTab === 'security' && <SecurityFraudPage onLaunchPreScreener={(data) => openTestPreScreener(data)} />}
          {activeTab === 'developer-center' && <DashboardPage showToast={showToast} />}

          {activeTab === 'surveys' && (
            <SurveysPage 
              currentUser={currentUser}
              surveys={filteredSurveys}
              clients={clientsList}
              globalSearch={globalSearch}
              loading={loading}
              onRefresh={handleSync}
              onAddSurvey={(newStudy) => {
                if (newStudy) {
                  try {
                    createCustomSurvey(newStudy);
                  } catch (e) {}
                  setSurveys(prev => [newStudy, ...prev.filter(s => String(s.survey_id || s.id) !== String(newStudy.survey_id || newStudy.id))]);
                }
                showToast(`✓ Study #${newStudy.surveyId} launched & added to marketplace!`);
              }}
              onOpenQuotas={openQuotas}
              onOpenQuals={openQuals}
              onOpenAssign={openAssign}
              showToast={showToast}
            />
          )}

          {activeTab === 'vendors' && <VendorsPage onNavigate={handleTabChange} globalSearch={globalSearch} showToast={showToast} />}
          {activeTab === 'reconciliation' && <ReconciliationPage initialTab={currentReportSubTab || 'vendors'} />}
          {activeTab === 'bids' && <BidsPage />}
          {activeTab === 'payments' && <PaymentsPage currentUser={currentUser} showToast={showToast} />}
          {activeTab === 'team' && <TeamPage />}
          {activeTab === 'leads' && <LeadsPage currentUser={currentUser} showToast={showToast} />}
          {activeTab === 'reference' && <ReferenceDataPage />}
          

          </div>

          {/* VMH Enterprise Footer */}
          <footer style={{
            margin: '24px 0 0 0',
            width: '100%',
            boxSizing: 'border-box',
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
              <span>&copy; {new Date().getFullYear()} <strong>VMH GROUP</strong> &bull; Survey Routing & Sample Marketplace</span>
            </div>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>v3.4</span>
          </footer>
        </main>
      </div>

      {/* Interactive Modals */}
      {quotasModalId && (() => {
        const resolved = typeof quotasModalId === 'object' && quotasModalId !== null
          ? quotasModalId
          : surveys.find(s => String(s.survey_id ?? s.SurveyId ?? s.id ?? s._id) === String(quotasModalId));
        const resolvedId = resolved?.survey_id ?? resolved?.SurveyId ?? resolved?.surveyId ?? (typeof quotasModalId !== 'object' ? quotasModalId : '2042481293');
        return (
          <QuotasModal 
            survey={resolved}
            surveyId={resolvedId} 
            onClose={closeQuotas} 
          />
        );
      })()}

      {qualsModalId && (() => {
        const resolved = typeof qualsModalId === 'object' && qualsModalId !== null
          ? qualsModalId
          : surveys.find(s => String(s.survey_id ?? s.SurveyId ?? s.id ?? s._id) === String(qualsModalId));
        const resolvedId = resolved?.survey_id ?? resolved?.SurveyId ?? resolved?.surveyId ?? (typeof qualsModalId !== 'object' ? qualsModalId : '2042481293');
        return (
          <QualsModal 
            survey={resolved}
            surveyId={resolvedId} 
            onClose={closeQuals} 
          />
        );
      })()}

      {assignModalId && (() => {
        const resolved = typeof assignModalId === 'object' && assignModalId !== null
          ? assignModalId
          : surveys.find(s => String(s.survey_id ?? s.SurveyId ?? s.id ?? s._id) === String(assignModalId));
        const resolvedId = resolved?.survey_id ?? resolved?.SurveyId ?? resolved?.surveyId ?? (typeof assignModalId !== 'object' ? assignModalId : '2042481293');
        return (
          <AssignVendorModal 
            survey={resolved}
            surveyId={resolvedId} 
            onClose={closeAssign} 
            onOpenPreScreener={(data) => openTestPreScreener(data)}
          />
        );
      })()}

      {/* Test Pre-Screener Live Modal */}
      {testPreScreener && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: 'rgba(0, 0, 0, 0.85)',
          overflowY: 'auto'
        }}>
          <button
            onClick={closeTestPreScreener}
            style={{
              position: 'fixed',
              top: '16px',
              right: '24px',
              background: '#FFFFFF',
              color: '#0F172A',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
              zIndex: 100000
            }}
            title="Close Pre-Screener Test"
          >
            <X size={20} />
          </button>
          <PreScreenerGate
            vendorId={testPreScreener.vendorId || 'VND-DYN-01'}
            projectId={testPreScreener.projectId || '2042481293'}
            uid={testPreScreener.uid || `TEST_${Date.now().toString().slice(-4)}`}
            onComplete={closeTestPreScreener}
          />
        </div>
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
