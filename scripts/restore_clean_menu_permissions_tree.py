with open('client/src/pages/UserManagementPage.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Replace definition of MENU_SECTIONS/MENU_TREE at the top
old_top = """export const MENU_SECTIONS = [
  {
    key: 'main',
    title: 'MAIN',
    badge: 'Core Telemetry',
    items: [
      { id: 1, name: 'Overview', desc: 'Real-time telemetry, KPI cards, yield trajectory & CPI analytics', route: 'dashboard' },
      { id: 7, name: 'Surveys', desc: 'Marketplace survey inventory, quotas, qualifications & allocations', route: 'surveys' }
    ]
  },
  {
    key: 'partners',
    title: 'PARTNERS',
    badge: 'Integrations',
    items: [
      { id: 6, name: 'Clients', desc: 'Demand sources, client API endpoints, keys & security toggles', route: 'clients' },
      { id: 8, name: 'Vendors', desc: 'Supply partners, hash formulas, traffic sub-IDs & revshare', route: 'vendors' }
    ]
  },
  {
    key: 'operations',
    title: 'OPERATIONS',
    badge: 'Payouts & Traffic',
    items: [
      { id: 10, name: 'Vendor Payments', desc: 'Vendor payment statements, monthly invoicing & net settlements', route: 'payments' },
      { id: 9, name: 'Traffic Leads Stream', desc: 'Live respondents stream, IP fraud scoring, conversion telemetry', route: 'leads' },
      { id: 11, name: 'Security & Fraud Gate', desc: 'Bot & VPN firewall, demographic pre-screener rules & blacklists', route: 'security' }
    ]
  },
  {
    key: 'management',
    title: 'MANAGEMENT',
    badge: 'System & Admin',
    items: [
      { 
        id: 2, 
        name: 'User Management', 
        desc: 'Staff user accounts, employee permissions & platform security access',
        route: 'users',
        children: [
          { id: 3, name: 'User Accounts', desc: 'Provision, edit & deactivate employee login accounts' },
          { id: 4, name: 'Role & Menu Privileges', desc: 'Customizable section permissions & RBAC matrix' },
          { id: 5, name: 'Change Password', desc: 'Staff password management & security resets' }
        ]
      },
      { id: 12, name: 'Team Directory', desc: 'Staff organization directory, contact roster & departments', route: 'team' },
      { id: 13, name: 'Reference Data', desc: 'Standard platform lookups, question IDs, countries & languages', route: 'reference' }
    ]
  }
];

export const ALL_MENU_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export const MENU_NAMES = {
  1: 'Overview',
  2: 'User Management',
  3: 'User Accounts',
  4: 'Role & Menu Privileges',
  5: 'Change Password',
  6: 'Clients',
  7: 'Surveys',
  8: 'Vendors',
  9: 'Traffic Leads Stream',
  10: 'Vendor Payments',
  11: 'Security & Fraud Gate',
  12: 'Team Directory',
  13: 'Reference Data'
};"""

new_top = """// Official Complete Menu Tree matching all Sidebar sections and exact clean style
export const MENU_TREE = [
  // MAIN
  { id: 1, name: 'Overview', section: 'Main' },
  { id: 7, name: 'Surveys', section: 'Main' },
  // PARTNERS
  { id: 6, name: 'Clients', section: 'Partners' },
  { id: 8, name: 'Vendors', section: 'Partners' },
  // OPERATIONS
  { id: 10, name: 'Vendor Payments', section: 'Operations & Payouts' },
  { id: 9, name: 'Traffic Leads Stream', section: 'Operations & Payouts' },
  { id: 11, name: 'Security & Fraud Gate', section: 'Operations & Payouts' },
  // MANAGEMENT
  { 
    id: 2, 
    name: 'User Management',
    section: 'System & Team',
    children: [
      { id: 3, name: 'User' },
      { id: 4, name: 'Menu Permission' },
      { id: 5, name: 'Change Password' }
    ]
  },
  { id: 12, name: 'Team Directory', section: 'System & Team' },
  { id: 13, name: 'Reference Data', section: 'System & Team' }
];

export const ALL_MENU_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export const MENU_NAMES = {
  1: 'Overview',
  2: 'User Management',
  3: 'User',
  4: 'Menu Permission',
  5: 'Change Password',
  6: 'Clients',
  7: 'Surveys',
  8: 'Vendors',
  9: 'Traffic Leads Stream',
  10: 'Vendor Payments',
  11: 'Security & Fraud Gate',
  12: 'Team Directory',
  13: 'Reference Data'
};"""

code_norm = code.replace('\r\n', '\n')
old_top_norm = old_top.replace('\r\n', '\n')

if old_top_norm in code_norm:
    code_norm = code_norm.replace(old_top_norm, new_top)
    print('Top menu tree updated successfully!')
else:
    print('old_top_norm not found!')

# 2. Update the card JSX back to the clean, elegant dotted tree
old_card_jsx = """          {/* Card: Assign Menu Permissions (100% Matching Sidebar Sections & All Modules) */}
          <div className="card report-card" style={{ padding: '24px', marginBottom: '22px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '20px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="#0F172A" />
                  Assign Menu Permissions
                </h4>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  Configure granular section and module permissions matching the platform sidebar hierarchy.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleSelectAllMenus}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11.5px', padding: '5px 12px', fontWeight: 700 }}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllMenus}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11.5px', padding: '5px 12px', fontWeight: 700 }}
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Grouped by SMR Platform Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {MENU_SECTIONS.map(section => {
                const secIds = [];
                section.items.forEach(it => {
                  secIds.push(it.id);
                  if (it.children) it.children.forEach(c => secIds.push(c.id));
                });
                const selectedCount = secIds.filter(id => (formData.menu_permissions || []).includes(id)).length;
                const isAllSecChecked = selectedCount === secIds.length && secIds.length > 0;

                return (
                  <div 
                    key={section.key} 
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Section Header */}
                    <div style={{
                      padding: '10px 16px',
                      background: '#f1f5f9',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: '#0F172A',
                          color: '#ffffff',
                          letterSpacing: '0.5px'
                        }}>
                          {section.title}
                        </span>
                        <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
                          ({selectedCount}/{secIds.length} modules granted)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleSection(section.key)}
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: isAllSecChecked ? '#dc2626' : '#0F172A',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        {isAllSecChecked ? 'Deselect Section' : 'Select Section'}
                      </button>
                    </div>

                    {/* Section Items List */}
                    <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {section.items.map(node => {
                        const isChecked = (formData.menu_permissions || []).includes(node.id);
                        const hasChildren = node.children && node.children.length > 0;

                        return (
                          <div key={node.id}>
                            <label style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                              cursor: 'pointer',
                              userSelect: 'none',
                              padding: '4px 0'
                            }}>
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleMenu(node.id)}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  cursor: 'pointer',
                                  accentColor: '#0F172A',
                                  marginTop: '2px'
                                }}
                              />
                              <div>
                                <div style={{ fontSize: '13.5px', fontWeight: 700, color: isChecked ? '#0F172A' : '#334155' }}>
                                  {node.name}
                                </div>
                                {node.desc && (
                                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '1px' }}>
                                    {node.desc}
                                  </div>
                                )}
                              </div>
                            </label>

                            {/* Dotted Nested Children for User Management */}
                            {hasChildren && (
                              <div style={{
                                marginLeft: '26px',
                                paddingLeft: '18px',
                                borderLeft: '1.5px dashed #cbd5e1',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                                marginTop: '4px',
                                marginBottom: '6px'
                              }}>
                                {node.children.map(child => {
                                  const childChecked = (formData.menu_permissions || []).includes(child.id);
                                  return (
                                    <div key={child.id} style={{ position: 'relative' }}>
                                      <span style={{
                                        position: 'absolute',
                                        left: '-18px',
                                        top: '50%',
                                        width: '12px',
                                        borderTop: '1.5px dashed #cbd5e1'
                                      }} />
                                      <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        padding: '3px 0'
                                      }}>
                                        <input 
                                          type="checkbox"
                                          checked={childChecked}
                                          onChange={() => handleToggleMenu(child.id)}
                                          style={{
                                            width: '15px',
                                            height: '15px',
                                            cursor: 'pointer',
                                            accentColor: '#0F172A'
                                          }}
                                        />
                                        <div>
                                          <span style={{ fontSize: '12.5px', fontWeight: 600, color: childChecked ? '#0F172A' : '#475569' }}>
                                            {child.name}
                                          </span>
                                          {child.desc && (
                                            <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px' }}>
                                              — {child.desc}
                                            </span>
                                          )}
                                        </div>
                                      </label>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>"""

new_card_jsx = """          {/* Card: Assign Menu Permissions (Clean unified tree matching original design + all sidebar items) */}
          <div className="card report-card" style={{ padding: '24px', marginBottom: '22px', borderRadius: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '18px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
                  Assign Menu Permissions
                </h4>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  Configure hierarchical menu permissions for this user account.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleSelectAllMenus}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11.5px', padding: '4px 10px', fontWeight: 600 }}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllMenus}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11.5px', padding: '4px 10px', fontWeight: 600 }}
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Dotted Tree Hierarchy */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '18px 24px'
            }}>
              {MENU_TREE.map((node, idx) => {
                const isChecked = (formData.menu_permissions || []).includes(node.id);
                const hasChildren = node.children && node.children.length > 0;
                const prevNode = idx > 0 ? MENU_TREE[idx - 1] : null;
                const isNewSection = !prevNode || prevNode.section !== node.section;

                return (
                  <React.Fragment key={node.id}>
                    {isNewSection && (
                      <div style={{
                        fontSize: '10.5px',
                        fontWeight: 800,
                        color: '#64748b',
                        letterSpacing: '0.8px',
                        textTransform: 'uppercase',
                        margin: idx === 0 ? '0 0 8px 0' : '16px 0 8px 0',
                        paddingTop: idx === 0 ? 0 : '12px',
                        borderTop: idx === 0 ? 'none' : '1px dashed #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', background: '#94a3b8' }} />
                        <span>{node.section}</span>
                      </div>
                    )}

                    <div style={{ marginBottom: hasChildren ? '10px' : '8px' }}>
                      {/* Node Row */}
                      <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        userSelect: 'none',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: isChecked ? '#0F172A' : '#1e293b',
                        padding: '4px 0'
                      }}>
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleMenu(node.id)}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            accentColor: '#0F172A'
                          }}
                        />
                        <span>{node.name}</span>
                      </label>

                      {/* Dotted Nested Children (Tree branch lines) */}
                      {hasChildren && (
                        <div style={{
                          marginLeft: '26px',
                          paddingLeft: '18px',
                          borderLeft: '1.5px dashed #cbd5e1',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          marginTop: '4px',
                          marginBottom: '8px'
                        }}>
                          {node.children.map(child => {
                            const childChecked = (formData.menu_permissions || []).includes(child.id);
                            return (
                              <div key={child.id} style={{ position: 'relative' }}>
                                {/* Horizontal dotted connector branch */}
                                <span style={{
                                  position: 'absolute',
                                  left: '-18px',
                                  top: '50%',
                                  width: '12px',
                                  borderTop: '1.5px dashed #cbd5e1'
                                }} />
                                
                                <label style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  cursor: 'pointer',
                                  userSelect: 'none',
                                  fontSize: '13px',
                                  color: childChecked ? '#0F172A' : '#334155',
                                  padding: '3px 0'
                                }}>
                                  <input 
                                    type="checkbox"
                                    checked={childChecked}
                                    onChange={() => handleToggleMenu(child.id)}
                                    style={{
                                      width: '15px',
                                      height: '15px',
                                      cursor: 'pointer',
                                      accentColor: '#0F172A'
                                    }}
                                  />
                                  <span>{child.name}</span>
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>"""

old_card_jsx_norm = old_card_jsx.replace('\r\n', '\n')
if old_card_jsx_norm in code_norm:
    code_norm = code_norm.replace(old_card_jsx_norm, new_card_jsx)
    print('Card JSX restored to clean tree layout!')
else:
    print('old_card_jsx_norm not found!')

with open('client/src/pages/UserManagementPage.jsx', 'w', encoding='utf-8') as f:
    f.write(code_norm)
print('UserManagementPage.jsx updated successfully!')
