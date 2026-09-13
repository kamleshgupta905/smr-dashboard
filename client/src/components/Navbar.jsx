import React from 'react';
import { Menu, Activity, ShieldCheck, RefreshCw, Zap, LogOut, User } from 'lucide-react';

export default function Navbar({ 
  pageTitle = 'Marketplace Dashboard', 
  onSync, 
  syncing, 
  isSyncing, 
  surveyCount = 0,
  onToggleMobileMenu,
  onLogout 
}) {
  const isCurrentlySyncing = syncing || isSyncing;

  return (
    <header className="navbar admin-top-bar">
      <div className="navbar-left">
        {onToggleMobileMenu && (
          <button 
            className="mobile-menu-btn" 
            onClick={onToggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>
        )}
        <h2 className="page-title" style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
          {pageTitle}
        </h2>
      </div>

      <div className="navbar-right">
        {surveyCount > 0 && (
          <div className="badge badge-purple" style={{ padding: '6px 12px', fontSize: '12px' }}>
            <Zap size={13} style={{ marginRight: '3px' }} /> {surveyCount} Surveys
          </div>
        )}

        <div className="badge badge-success" style={{ padding: '6px 12px', fontSize: '12px' }}>
          <Activity size={13} style={{ marginRight: '3px' }} /> API Connected
        </div>

        <div className="badge badge-info" style={{ padding: '6px 12px', fontSize: '12px' }}>
          <ShieldCheck size={13} style={{ marginRight: '3px' }} /> HMAC Active
        </div>

        {onSync && (
          <button
            className="btn btn-primary btn-sm"
            onClick={onSync}
            disabled={isCurrentlySyncing}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <RefreshCw size={14} className={isCurrentlySyncing ? 'spin' : ''} />
            <span>{isCurrentlySyncing ? 'Syncing...' : 'Sync Zamplia'}</span>
          </button>
        )}

        <div className="badge badge-neutral" style={{ padding: '6px 12px', fontSize: '12px', background: '#F1F5F9', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <User size={13} style={{ color: '#0F172A' }} /> Vmhgroup
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            title="Log out from SMR Dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              color: '#EF4444',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        )}
      </div>
    </header>
  );
}
