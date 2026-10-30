import os
import re

print("Starting RBAC Action Guards update...")

# 1. Update App.jsx
app_path = os.path.join('client', 'src', 'App.jsx')
with open(app_path, 'r', encoding='utf-8') as f:
    app_content = f.read()

# Add canPerformAction helper right after hasMenuAccess
old_has_menu = """  const userPermNumbers = (userPermissions || currentUser?.permissions || []).map(Number);
  const hasMenuAccess = (menuId) => isAdmin || userPermNumbers.includes(Number(menuId));"""

new_has_menu = """  const userPermNumbers = (userPermissions || currentUser?.permissions || []).map(Number);
  const hasMenuAccess = (menuId) => isAdmin || userPermNumbers.includes(Number(menuId));

  // Granular RBAC Action Evaluator: checks view, add, edit, delete, print
  const canPerformAction = (menuId, action = 'view') => {
    if (isAdmin) return true;
    const mId = Number(menuId);
    if (!userPermNumbers.includes(mId)) return false;
    if (action === 'view') return true;

    const gran = currentUser?.granular_permissions;
    if (!gran) return true;
    const modPerm = gran[mId] || gran[String(mId)];
    if (!modPerm) return true;
    const val = modPerm[action];
    if (val === undefined || val === null) return true;
    return Boolean(val === 1 || val === true || val === '1');
  };"""

if old_has_menu in app_content:
    app_content = app_content.replace(old_has_menu, new_has_menu, 1)
    print("[OK] App.jsx: canPerformAction helper added")
else:
    print("! App.jsx: hasMenuAccess pattern not found")

# Update impersonate logic to preserve granular_permissions
old_imp = """    const impersonated = {
      ...targetUser,
      role: targetUser.role_name || targetUser.role || 'User',
      role_name: targetUser.role_name || targetUser.role || 'User',
      permissions: permList
    };"""

new_imp = """    let granularMap = targetUser.granular_permissions || {};
    try {
      const livePermRes = await getUserPermissions(targetUser.id);
      if (livePermRes?.granular && typeof livePermRes.granular === 'object') {
        granularMap = livePermRes.granular;
      }
    } catch {}

    const impersonated = {
      ...targetUser,
      role: targetUser.role_name || targetUser.role || 'User',
      role_name: targetUser.role_name || targetUser.role || 'User',
      permissions: permList,
      granular_permissions: granularMap
    };"""

if old_imp in app_content:
    app_content = app_content.replace(old_imp, new_imp, 1)
    print("[OK] App.jsx: impersonation updated with granular_permissions")
else:
    print("! App.jsx: impersonation pattern not found")

# Allow non-admin users with Menu 2 to access User Management page
old_users_tab_check = """      if (activeTab === 'users' || activeTab === 'developer-center') {
        handleTabChange(fallbackTab, false);
        return;
      }"""

new_users_tab_check = """      if (activeTab === 'users' && !userPermNumbers.includes(2)) {
        handleTabChange(fallbackTab, false);
        return;
      }
      if (activeTab === 'developer-center') {
        handleTabChange(fallbackTab, false);
        return;
      }"""

if old_users_tab_check in app_content:
    app_content = app_content.replace(old_users_tab_check, new_users_tab_check, 1)
    print("[OK] App.jsx: activeTab check updated for Menu 2 users")

# Pass canAdd, canEdit, canDelete props to pages in App.jsx
old_render_users = """          {activeTab === 'users' && (isAdmin || hasMenuAccess(2)) && (
            <UserManagementPage 
              currentUser={currentUser} 
              onImpersonateUser={handleImpersonateUser} 
              onExitImpersonation={handleExitImpersonation}
            />
          )}"""

new_render_users = """          {activeTab === 'users' && (isAdmin || hasMenuAccess(2)) && (
            <UserManagementPage 
              currentUser={currentUser} 
              onImpersonateUser={handleImpersonateUser} 
              onExitImpersonation={handleExitImpersonation}
              canAdd={canPerformAction(2, 'add')}
              canEdit={canPerformAction(2, 'edit')}
              canDelete={canPerformAction(2, 'delete')}
            />
          )}"""

if old_render_users in app_content:
    app_content = app_content.replace(old_render_users, new_render_users, 1)
    print("[OK] App.jsx: UserManagementPage props updated")

old_render_clients = """          {activeTab === 'clients' && hasMenuAccess(6) && (
            <ClientsPage 
              onNavigate={handleTabChange} 
              globalSearch={globalSearch} 
              showToast={showToast} 
              onClientsUpdated={(newList) => {
                setClientsList(newList);
                setClientsCount(newList.length);
              }}
            />
          )}"""

new_render_clients = """          {activeTab === 'clients' && hasMenuAccess(6) && (
            <ClientsPage 
              onNavigate={handleTabChange} 
              globalSearch={globalSearch} 
              showToast={showToast} 
              onClientsUpdated={(newList) => {
                setClientsList(newList);
                setClientsCount(newList.length);
              }}
              canAdd={canPerformAction(6, 'add')}
              canEdit={canPerformAction(6, 'edit')}
              canDelete={canPerformAction(6, 'delete')}
            />
          )}"""

if old_render_clients in app_content:
    app_content = app_content.replace(old_render_clients, new_render_clients, 1)
    print("[OK] App.jsx: ClientsPage props updated")

old_render_surveys = """              onOpenQuals={openQuals}
              onOpenAssign={openAssign}
              showToast={showToast}
            />"""

new_render_surveys = """              onOpenQuals={openQuals}
              onOpenAssign={openAssign}
              showToast={showToast}
              canAdd={canPerformAction(7, 'add')}
              canEdit={canPerformAction(7, 'edit')}
              canDelete={canPerformAction(7, 'delete')}
            />"""

if old_render_surveys in app_content:
    app_content = app_content.replace(old_render_surveys, new_render_surveys, 1)
    print("[OK] App.jsx: SurveysPage props updated")

old_render_vendors = """          {activeTab === 'vendors' && hasMenuAccess(8) && <VendorsPage onNavigate={handleTabChange} globalSearch={globalSearch} showToast={showToast} />}"""

new_render_vendors = """          {activeTab === 'vendors' && hasMenuAccess(8) && (
            <VendorsPage 
              onNavigate={handleTabChange} 
              globalSearch={globalSearch} 
              showToast={showToast} 
              canAdd={canPerformAction(8, 'add')}
              canEdit={canPerformAction(8, 'edit')}
              canDelete={canPerformAction(8, 'delete')}
            />
          )}"""

if old_render_vendors in app_content:
    app_content = app_content.replace(old_render_vendors, new_render_vendors, 1)
    print("[OK] App.jsx: VendorsPage props updated")

old_render_payments = """          {activeTab === 'payments' && hasMenuAccess(10) && <PaymentsPage currentUser={currentUser} showToast={showToast} />}"""

new_render_payments = """          {activeTab === 'payments' && hasMenuAccess(10) && (
            <PaymentsPage 
              currentUser={currentUser} 
              showToast={showToast} 
              canAdd={canPerformAction(10, 'add')}
              canEdit={canPerformAction(10, 'edit')}
              canDelete={canPerformAction(10, 'delete')}
            />
          )}"""

if old_render_payments in app_content:
    app_content = app_content.replace(old_render_payments, new_render_payments, 1)
    print("[OK] App.jsx: PaymentsPage props updated")

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app_content)


# 2. Update SurveysPage.jsx
surveys_path = os.path.join('client', 'src', 'pages', 'SurveysPage.jsx')
with open(surveys_path, 'r', encoding='utf-8') as f:
    surveys_content = f.read()

# Update function props
old_surv_fn = """export default function SurveysPage({ 
  currentUser,
  surveys = [], 
  clients = [],
  globalSearch = '', 
  loading = false, 
  onRefresh, 
  onAddSurvey,
  onOpenQuotas,
  onOpenQuals,
  onOpenAssign,
  showToast
}) {"""

new_surv_fn = """export default function SurveysPage({ 
  currentUser,
  surveys = [], 
  clients = [],
  globalSearch = '', 
  loading = false, 
  onRefresh, 
  onAddSurvey,
  onOpenQuotas,
  onOpenQuals,
  onOpenAssign,
  showToast,
  canAdd = true,
  canEdit = true,
  canDelete = true
}) {"""

if old_surv_fn in surveys_content:
    surveys_content = surveys_content.replace(old_surv_fn, new_surv_fn, 1)
    print("[OK] SurveysPage.jsx: function props updated")

# Wrap + Add Survey button
old_surv_add_btn = """          <button
            onClick={openDemandModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
              border: '1px solid #0F172A',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={14} />
            <span>+ Add Survey</span>
          </button>"""

new_surv_add_btn = """          {canAdd && (
            <button
              onClick={openDemandModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
                border: '1px solid #0F172A',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.35)',
                transition: 'all 0.15s ease'
              }}
            >
              <Layers size={14} />
              <span>+ Add Survey</span>
            </button>
          )}"""

if old_surv_add_btn in surveys_content:
    surveys_content = surveys_content.replace(old_surv_add_btn, new_surv_add_btn, 1)
    print("[OK] SurveysPage.jsx: + Add Survey button guarded with canAdd")

# Wrap Clone button
old_surv_clone_btn = """                            <button
                              type="button"
                              className="action-suite-btn"
                              onClick={() => handleOpenCloneModal(s)}
                              title="Clone Study & Modify Parameters"
                            >
                              <Copy size={12} color="#0284c7" />
                              <span>Clone</span>
                            </button>"""

new_surv_clone_btn = """                            {canAdd && (
                              <button
                                type="button"
                                className="action-suite-btn"
                                onClick={() => handleOpenCloneModal(s)}
                                title="Clone Study & Modify Parameters"
                              >
                                <Copy size={12} color="#0284c7" />
                                <span>Clone</span>
                              </button>
                            )}"""

if old_surv_clone_btn in surveys_content:
    surveys_content = surveys_content.replace(old_surv_clone_btn, new_surv_clone_btn, 1)
    print("[OK] SurveysPage.jsx: Clone button guarded with canAdd")

with open(surveys_path, 'w', encoding='utf-8') as f:
    f.write(surveys_content)


# 3. Update ClientsPage.jsx
clients_path = os.path.join('client', 'src', 'pages', 'ClientsPage.jsx')
with open(clients_path, 'r', encoding='utf-8') as f:
    clients_content = f.read()

old_client_fn = """export default function ClientsPage({ onNavigate, globalSearch = '', showToast, onClientsUpdated }) {"""
new_client_fn = """export default function ClientsPage({ onNavigate, globalSearch = '', showToast, onClientsUpdated, canAdd = true, canEdit = true, canDelete = true }) {"""

if old_client_fn in clients_content:
    clients_content = clients_content.replace(old_client_fn, new_client_fn, 1)
    print("[OK] ClientsPage.jsx: function props updated")

old_client_add = """          <button 
            className="btn btn-primary"
            onClick={handleOpenModal}
            id="btn-add-client"
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(42, 45, 140, 0.25)'
            }}
          >
            <Plus size={15} /> Add New Client
          </button>"""

new_client_add = """          {canAdd && (
            <button 
              className="btn btn-primary"
              onClick={handleOpenModal}
              id="btn-add-client"
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(42, 45, 140, 0.25)'
              }}
            >
              <Plus size={15} /> Add New Client
            </button>
          )}"""

if old_client_add in clients_content:
    clients_content = clients_content.replace(old_client_add, new_client_add, 1)
    print("[OK] ClientsPage.jsx: Add New Client guarded with canAdd")

old_client_edit = """                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(client)}
                    style={{
                      background: '#0F172A',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '5px 14px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)'
                    }}
                    title="Edit Client details, endpoints and security settings"
                  >
                    <Edit2 size={12} color="#ffffff" />
                    <span>Edit Client</span>
                  </button>"""

new_client_edit = """                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(client)}
                      style={{
                        background: '#0F172A',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '5px 14px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)'
                      }}
                      title="Edit Client details, endpoints and security settings"
                    >
                      <Edit2 size={12} color="#ffffff" />
                      <span>Edit Client</span>
                    </button>
                  )}"""

if old_client_edit in clients_content:
    clients_content = clients_content.replace(old_client_edit, new_client_edit, 1)
    print("[OK] ClientsPage.jsx: Edit Client guarded with canEdit")

old_client_del = """                  <button
                    onClick={() => handleDelete(client._id || client.id)}
                    style={{
                      background: '#ffffff',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      borderRadius: '20px',
                      padding: '5px 8px',
                      cursor: 'pointer'
                    }}
                    title="Delete Client"
                  >
                    <Trash2 size={12} />
                  </button>"""

new_client_del = """                  {canDelete && (
                    <button
                      onClick={() => handleDelete(client._id || client.id)}
                      style={{
                        background: '#ffffff',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '20px',
                        padding: '5px 8px',
                        cursor: 'pointer'
                      }}
                      title="Delete Client"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}"""

if old_client_del in clients_content:
    clients_content = clients_content.replace(old_client_del, new_client_del, 1)
    print("[OK] ClientsPage.jsx: Delete Client guarded with canDelete")

with open(clients_path, 'w', encoding='utf-8') as f:
    f.write(clients_content)


# 4. Update VendorsPage.jsx
vendors_path = os.path.join('client', 'src', 'pages', 'VendorsPage.jsx')
with open(vendors_path, 'r', encoding='utf-8') as f:
    vendors_content = f.read()

old_vend_fn = """export default function VendorsPage({ onNavigate, globalSearch = '', showToast }) {"""
new_vend_fn = """export default function VendorsPage({ onNavigate, globalSearch = '', showToast, canAdd = true, canEdit = true, canDelete = true }) {"""

if old_vend_fn in vendors_content:
    vendors_content = vendors_content.replace(old_vend_fn, new_vend_fn, 1)
    print("[OK] VendorsPage.jsx: function props updated")

old_vend_add1 = """          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            id="btn-add-vendor"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px', borderRadius: '4px' }}
          >
            <Plus size={14} /> Add New Vendor
          </button>"""

new_vend_add1 = """          {canAdd && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
              id="btn-add-vendor"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px', borderRadius: '4px' }}
            >
              <Plus size={14} /> Add New Vendor
            </button>
          )}"""

if old_vend_add1 in vendors_content:
    vendors_content = vendors_content.replace(old_vend_add1, new_vend_add1, 1)
    print("[OK] VendorsPage.jsx: Add New Vendor button 1 guarded with canAdd")

old_vend_add2 = """            <button
              type="button"
              onClick={() => setShowModal(true)}
              id="btn-add-vendor-banner"
              style={{
                background: '#ffffff',
                color: '#2a2d8c',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 18px',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 4px rgba(42, 45, 140, 0.15)'
              }}
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>ADD</span>
            </button>"""

new_vend_add2 = """            {canAdd && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                id="btn-add-vendor-banner"
                style={{
                  background: '#ffffff',
                  color: '#2a2d8c',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '6px 18px',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 4px rgba(42, 45, 140, 0.15)'
                }}
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>ADD</span>
              </button>
            )}"""

if old_vend_add2 in vendors_content:
    vendors_content = vendors_content.replace(old_vend_add2, new_vend_add2, 1)
    print("[OK] VendorsPage.jsx: Add New Vendor button 2 guarded with canAdd")

old_vend_edit = """                            {/* 1. Edit Button (#2a2d8c square) */}
                            <button
                              type="button"
                              onClick={() => handleOpenRedirects(v)}
                              title="Edit Vendor & Redirects"
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '6px',
                                background: '#2a2d8c',
                                border: 'none',
                                color: '#ffffff',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'opacity 0.15s ease'
                              }}
                            >
                              <Edit2 size={13} color="#ffffff" />
                            </button>"""

new_vend_edit = """                            {/* 1. Edit Button (#2a2d8c square) */}
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => handleOpenRedirects(v)}
                                title="Edit Vendor & Redirects"
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '6px',
                                  background: '#2a2d8c',
                                  border: 'none',
                                  color: '#ffffff',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'opacity 0.15s ease'
                                }}
                              >
                                <Edit2 size={13} color="#ffffff" />
                              </button>
                            )}"""

if old_vend_edit in vendors_content:
    vendors_content = vendors_content.replace(old_vend_edit, new_vend_edit, 1)
    print("[OK] VendorsPage.jsx: Edit Vendor button guarded with canEdit")

old_vend_remove = """                                  <button
                                    type="button"
                                    onClick={() => handleDelete(vendorId)}
                                    title="Remove this supplier"
                                    style={{
                                      padding: '5px 10px',
                                      borderRadius: '6px',
                                      background: '#fef2f2',
                                      color: '#b91c1c',
                                      border: '1px solid #fecaca',
                                      cursor: 'pointer',
                                      fontSize: '11.5px',
                                      fontWeight: 600,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <Trash2 size={13} /> Remove
                                  </button>"""

new_vend_remove = """                                  {canDelete && (
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(vendorId)}
                                      title="Remove this supplier"
                                      style={{
                                        padding: '5px 10px',
                                        borderRadius: '6px',
                                        background: '#fef2f2',
                                        color: '#b91c1c',
                                        border: '1px solid #fecaca',
                                        cursor: 'pointer',
                                        fontSize: '11.5px',
                                        fontWeight: 600,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <Trash2 size={13} /> Remove
                                    </button>
                                  )}"""

if old_vend_remove in vendors_content:
    vendors_content = vendors_content.replace(old_vend_remove, new_vend_remove, 1)
    print("[OK] VendorsPage.jsx: Remove Vendor button guarded with canDelete")

with open(vendors_path, 'w', encoding='utf-8') as f:
    f.write(vendors_content)


# 5. Update UserManagementPage.jsx
users_path = os.path.join('client', 'src', 'pages', 'UserManagementPage.jsx')
with open(users_path, 'r', encoding='utf-8') as f:
    users_content = f.read()

old_users_fn = """export default function UserManagementPage({ currentUser, onImpersonateUser, onExitImpersonation }) {"""
new_users_fn = """export default function UserManagementPage({ currentUser, onImpersonateUser, onExitImpersonation, canAdd = true, canEdit = true, canDelete = true }) {"""

if old_users_fn in users_content:
    users_content = users_content.replace(old_users_fn, new_users_fn, 1)
    print("[OK] UserManagementPage.jsx: function props updated")

old_users_add = """          <button 
            className="btn btn-primary"
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px', borderRadius: '4px' }}
          >
            <Plus size={14} /> Add User
          </button>"""

new_users_add = """          {canAdd && (
            <button 
              className="btn btn-primary"
              onClick={handleOpenAdd}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '7px 14px', borderRadius: '4px' }}
            >
              <Plus size={14} /> Add User
            </button>
          )}"""

if old_users_add in users_content:
    users_content = users_content.replace(old_users_add, new_users_add, 1)
    print("[OK] UserManagementPage.jsx: Add User button guarded with canAdd")

old_users_actions = """                            <button
                              className="btn btn-soft-primary btn-sm"
                              onClick={() => handleOpenEdit(user)}
                              style={{ padding: '4px 7px', borderRadius: '4px' }}
                              title="Edit User & Permissions"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              className="btn btn-soft-danger btn-sm"
                              onClick={() => handleDelete(user.id)}
                              style={{ padding: '4px 7px', borderRadius: '4px' }}
                              title="Delete User"
                              disabled={user.id === 1 || user.id === 18}
                            >
                              <Trash2 size={13} />
                            </button>"""

new_users_actions = """                            {canEdit && (
                              <button
                                className="btn btn-soft-primary btn-sm"
                                onClick={() => handleOpenEdit(user)}
                                style={{ padding: '4px 7px', borderRadius: '4px' }}
                                title="Edit User & Permissions"
                              >
                                <Edit3 size={13} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                className="btn btn-soft-danger btn-sm"
                                onClick={() => handleDelete(user.id)}
                                style={{ padding: '4px 7px', borderRadius: '4px' }}
                                title="Delete User"
                                disabled={user.id === 1 || user.id === 18}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}"""

if old_users_actions in users_content:
    users_content = users_content.replace(old_users_actions, new_users_actions, 1)
    print("[OK] UserManagementPage.jsx: Edit and Delete buttons guarded")

with open(users_path, 'w', encoding='utf-8') as f:
    f.write(users_content)


# 6. Update PaymentsPage.jsx
payments_path = os.path.join('client', 'src', 'pages', 'PaymentsPage.jsx')
with open(payments_path, 'r', encoding='utf-8') as f:
    payments_content = f.read()

old_pay_fn = """export default function PaymentsPage({ currentUser, showToast }) {"""
new_pay_fn = """export default function PaymentsPage({ currentUser, showToast, canAdd = true, canEdit = true, canDelete = true }) {"""

if old_pay_fn in payments_content:
    payments_content = payments_content.replace(old_pay_fn, new_pay_fn, 1)
    print("[OK] PaymentsPage.jsx: function props updated")

old_pay_add = """          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            id="btn-record-payout"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, borderRadius: '6px' }}
          >
            <Plus size={15} />
            + Record Payout
          </button>"""

new_pay_add = """          {canAdd && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
              id="btn-record-payout"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, borderRadius: '6px' }}
            >
              <Plus size={15} />
              + Record Payout
            </button>
          )}"""

if old_pay_add in payments_content:
    payments_content = payments_content.replace(old_pay_add, new_pay_add, 1)
    print("[OK] PaymentsPage.jsx: Record Payout button guarded with canAdd")

old_pay_actions = """                          <button
                            onClick={() => openEditModal(p)}
                            style={{
                              background: '#F1F5F9',
                              border: '1px solid #E2E8F0',
                              color: '#0F172A',
                              borderRadius: '6px',
                              width: '28px',
                              height: '28px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                            title="Edit / Add Remarks"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.payment_id)}
                            style={{
                              background: '#FEF2F2',
                              border: '1px solid #FECACA',
                              color: '#DC2626',
                              borderRadius: '6px',
                              width: '28px',
                              height: '28px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                            title="Delete Record"
                          >
                            <Trash2 size={13} />
                          </button>"""

new_pay_actions = """                          {canEdit && (
                            <button
                              onClick={() => openEditModal(p)}
                              style={{
                                background: '#F1F5F9',
                                border: '1px solid #E2E8F0',
                                color: '#0F172A',
                                borderRadius: '6px',
                                width: '28px',
                                height: '28px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                              title="Edit / Add Remarks"
                            >
                              <Edit2 size={13} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(p.id, p.payment_id)}
                              style={{
                                background: '#FEF2F2',
                                border: '1px solid #FECACA',
                                color: '#DC2626',
                                borderRadius: '6px',
                                width: '28px',
                                height: '28px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                              title="Delete Record"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}"""

if old_pay_actions in payments_content:
    payments_content = payments_content.replace(old_pay_actions, new_pay_actions, 1)
    print("[OK] PaymentsPage.jsx: Edit and Delete buttons guarded")

with open(payments_path, 'w', encoding='utf-8') as f:
    f.write(payments_content)

print("\nRBAC Action Guards application finished successfully!")
