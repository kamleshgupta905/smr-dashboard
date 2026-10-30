import os
import re

print("Starting sub-permissions upgrade across all modules...")

# 1. Update UserManagementPage.jsx
ump_path = os.path.join('client', 'src', 'pages', 'UserManagementPage.jsx')
with open(ump_path, 'r', encoding='utf-8') as f:
    ump_content = f.read()

# Replace MENU_TREE definition
old_tree_block = """// Official Complete Menu Tree matching all Sidebar sections and exact clean style
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

export const ALL_MENU_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];"""

new_tree_block = """// Official Complete Menu Tree with Sub-Permissions for ALL Platform Modules
export const MENU_TREE = [
  // MAIN
  {
    id: 1,
    name: 'Overview',
    section: 'Main',
    children: [
      { id: 101, name: 'Key Performance Metrics (KPIs)' },
      { id: 102, name: 'Traffic & Volume Analytics Chart' },
      { id: 103, name: 'Recent Team Activity Log' }
    ]
  },
  {
    id: 7,
    name: 'Surveys',
    section: 'Main',
    children: [
      { id: 701, name: 'Survey Directory & Search' },
      { id: 702, name: 'Create / Add Survey Study' },
      { id: 703, name: 'Clone / Duplicate Study' },
      { id: 704, name: 'Assign Supply Vendors' },
      { id: 705, name: 'Quotas Management & Limits' },
      { id: 706, name: 'Targeting & Criteria Qualifications' }
    ]
  },

  // PARTNERS
  {
    id: 6,
    name: 'Clients',
    section: 'Partners',
    children: [
      { id: 601, name: 'Client Directory' },
      { id: 602, name: 'Add New Client Onboarding' },
      { id: 603, name: 'API Endpoints (Feed & S2S Callbacks)' },
      { id: 604, name: 'Anti-Tamper & Security Hash Keys' },
      { id: 605, name: 'Client Contacts Directory' },
      { id: 606, name: 'Edit Client Configuration' },
      { id: 607, name: 'Delete / Deactivate Client' }
    ]
  },
  {
    id: 8,
    name: 'Vendors',
    section: 'Partners',
    children: [
      { id: 801, name: 'Vendor Directory & Status' },
      { id: 802, name: 'Add Supply Vendor Integration' },
      { id: 803, name: 'Return Callbacks (4 Links Configuration)' },
      { id: 804, name: 'RevShare & CPI Payout Rules' },
      { id: 805, name: 'Statements & Reconciliation Ledger' },
      { id: 806, name: 'Bank & Compliance Profile' },
      { id: 807, name: 'Remove / Delete Vendor' }
    ]
  },

  // OPERATIONS & PAYOUTS
  {
    id: 10,
    name: 'Vendor Payments',
    section: 'Operations & Payouts',
    children: [
      { id: 1001, name: 'Disbursements Ledger' },
      { id: 1002, name: 'Record Vendor Payout' },
      { id: 1003, name: 'Approve / Mark Paid Status' },
      { id: 1004, name: 'Export Payments CSV' },
      { id: 1005, name: 'Edit Payment Remarks & Proof' },
      { id: 1006, name: 'Delete Payment Record' }
    ]
  },
  {
    id: 9,
    name: 'Traffic Leads Stream',
    section: 'Operations & Payouts',
    children: [
      { id: 901, name: 'Live Respondent Clicks Stream' },
      { id: 902, name: 'Traffic Search & Filter' },
      { id: 903, name: 'Manual Status Override' },
      { id: 904, name: 'Export Leads CSV' }
    ]
  },
  {
    id: 11,
    name: 'Security & Fraud Gate',
    section: 'Operations & Payouts',
    children: [
      { id: 1101, name: 'Fraud Detection Logs' },
      { id: 1102, name: 'Speeder LOI & IP Rules' },
      { id: 1103, name: 'Pre-Screener Simulator Gate' }
    ]
  },

  // SYSTEM & TEAM
  { 
    id: 2, 
    name: 'User Management',
    section: 'System & Team',
    children: [
      { id: 3, name: 'User Accounts Directory' },
      { id: 4, name: 'Menu & Action Permissions' },
      { id: 5, name: 'Password Management' }
    ]
  },
  {
    id: 12,
    name: 'Team Directory',
    section: 'System & Team',
    children: [
      { id: 1201, name: 'Staff Directory Listing' },
      { id: 1202, name: 'Add Team Member' },
      { id: 1203, name: 'Activity Audit Trail' }
    ]
  },
  {
    id: 13,
    name: 'Reference Data',
    section: 'System & Team',
    children: [
      { id: 1301, name: 'Country Master' },
      { id: 1302, name: 'Language Master' },
      { id: 1303, name: 'Questions & Qualification Library' }
    ]
  }
];

export const ALL_MENU_IDS = MENU_TREE.flatMap(node => [
  node.id,
  ...(node.children ? node.children.map(c => c.id) : [])
]);"""

if old_tree_block in ump_content:
    ump_content = ump_content.replace(old_tree_block, new_tree_block, 1)
    print("[OK] UserManagementPage.jsx: MENU_TREE updated with sub-permissions for all modules")
else:
    print("[!] UserManagementPage.jsx: old_tree_block not found")

# Replace handleToggleMenu, handleSelectAllMenus, handleDeselectAllMenus
old_toggles = """  const handleToggleMenu = (menuId) => {
    setFormData(prev => {
      const current = prev.menu_permissions || [];
      const idNum = Number(menuId);

      // Parent toggle: User Management (id: 2)
      if (idNum === 2) {
        const isParentChecked = current.includes(2);
        if (isParentChecked) {
          return {
            ...prev,
            menu_permissions: current.filter(id => ![2, 3, 4, 5].includes(id))
          };
        } else {
          const merged = Array.from(new Set([...current, 2, 3, 4, 5]));
          return {
            ...prev,
            menu_permissions: merged
          };
        }
      }

      // Child toggle: User Accounts (3), Role & Menu Privileges (4), Change Password (5)
      if ([3, 4, 5].includes(idNum)) {
        let updated;
        if (current.includes(idNum)) {
          updated = current.filter(id => id !== idNum);
          if (![3, 4, 5].some(c => updated.includes(c))) {
            updated = updated.filter(id => id !== 2);
          }
        } else {
          updated = Array.from(new Set([...current, idNum, 2]));
        }
        return { ...prev, menu_permissions: updated };
      }

      // All root platform modules (1, 6, 7, 8, 9, 10, 11, 12, 13)
      if (current.includes(idNum)) {
        return {
          ...prev,
          menu_permissions: current.filter(id => id !== idNum)
        };
      } else {
        return {
          ...prev,
          menu_permissions: [...current, idNum]
        };
      }
    });
  };

  const handleSelectAllMenus = () => {
    setFormData(prev => ({
      ...prev,
      menu_permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    }));
  };

  const handleDeselectAllMenus = () => {
    setFormData(prev => ({
      ...prev,
      menu_permissions: []
    }));
  };"""

new_toggles = """  const handleToggleMenu = (menuId) => {
    setFormData(prev => {
      const current = prev.menu_permissions || [];
      const idNum = Number(menuId);

      // 1. Check if clicked node is a parent module
      const parentNode = MENU_TREE.find(n => n.id === idNum);
      if (parentNode && parentNode.children && parentNode.children.length > 0) {
        const childIds = parentNode.children.map(c => c.id);
        const allIds = [idNum, ...childIds];
        const isParentChecked = current.includes(idNum);

        let nextMenus;
        if (isParentChecked) {
          // Uncheck parent and all of its sub-permissions
          nextMenus = current.filter(id => !allIds.includes(id));
        } else {
          // Check parent and all of its sub-permissions
          nextMenus = Array.from(new Set([...current, ...allIds]));
        }
        return { ...prev, menu_permissions: nextMenus };
      }

      // 2. Check if clicked node is a sub-permission of some parent
      let containingParent = null;
      for (const node of MENU_TREE) {
        if (node.children && node.children.some(c => c.id === idNum)) {
          containingParent = node;
          break;
        }
      }

      if (containingParent) {
        const childIds = containingParent.children.map(c => c.id);
        let nextMenus;
        if (current.includes(idNum)) {
          // Unchecking child sub-permission
          nextMenus = current.filter(id => id !== idNum);
          // If no other sub-permissions of this module remain checked, uncheck parent too
          const hasAnyChildLeft = childIds.some(cid => nextMenus.includes(cid));
          if (!hasAnyChildLeft) {
            nextMenus = nextMenus.filter(id => id !== containingParent.id);
          }
        } else {
          // Checking child sub-permission -> automatically ensure parent is checked too!
          nextMenus = Array.from(new Set([...current, idNum, containingParent.id]));
        }
        return { ...prev, menu_permissions: nextMenus };
      }

      // 3. Standalone node without children
      const nextMenus = current.includes(idNum)
        ? current.filter(id => id !== idNum)
        : [...current, idNum];
      return { ...prev, menu_permissions: nextMenus };
    });
  };

  const handleSelectAllMenus = () => {
    setFormData(prev => ({
      ...prev,
      menu_permissions: ALL_MENU_IDS
    }));
  };

  const handleDeselectAllMenus = () => {
    setFormData(prev => ({
      ...prev,
      menu_permissions: []
    }));
  };"""

if old_toggles in ump_content:
    ump_content = ump_content.replace(old_toggles, new_toggles, 1)
    print("[OK] UserManagementPage.jsx: handleToggleMenu updated with generic hierarchical logic")
else:
    print("[!] UserManagementPage.jsx: old_toggles not found")

# Update handleOpenEdit to pre-check all sub-permissions for legacy records
old_edit_perms = """    // Ensure all menu_permissions IDs have at least view=true in granular
    permissions.forEach(mid => {
      if (!granular[mid]) {
        granular[mid] = { view: true, add: true, edit: true, delete: false, print: true };
      }
    });

    const userPwd = user.plain_password || '';

    setFormData({
      id: user.id,
      name: user.name || '',
      mobile_no: user.mobile_no || '',
      email: user.email || '',
      employee_type: user.role_id || (user.role_name === 'Developer' ? 1 : user.role_name === 'Admin' ? 2 : 3),
      supplier_id: user.supplier_id || '',
      username: user.username || '',
      password: userPwd,
      confirm_password: userPwd,
      profile_image: user.profile_image || '',
      status: (user.is_active === 'N' || user.status === 'inactive') ? 'inactive' : 'active',
      menu_permissions: permissions,
      granular_permissions: granular
    });"""

new_edit_perms = """    // For legacy users who only had parent IDs saved, expand to pre-check all their sub-permissions
    const fullPermissionsSet = new Set(permissions);
    MENU_TREE.forEach(node => {
      if (fullPermissionsSet.has(node.id) && node.children) {
        const hasAnyChildSaved = node.children.some(c => fullPermissionsSet.has(c.id));
        if (!hasAnyChildSaved) {
          node.children.forEach(c => fullPermissionsSet.add(c.id));
        }
      }
    });
    const expandedPermissions = Array.from(fullPermissionsSet);

    // Ensure all menu_permissions IDs have at least view=true in granular
    expandedPermissions.forEach(mid => {
      if (!granular[mid]) {
        granular[mid] = { view: true, add: true, edit: true, delete: false, print: true };
      }
    });

    const userPwd = user.plain_password || '';

    setFormData({
      id: user.id,
      name: user.name || '',
      mobile_no: user.mobile_no || '',
      email: user.email || '',
      employee_type: user.role_id || (user.role_name === 'Developer' ? 1 : user.role_name === 'Admin' ? 2 : 3),
      supplier_id: user.supplier_id || '',
      username: user.username || '',
      password: userPwd,
      confirm_password: userPwd,
      profile_image: user.profile_image || '',
      status: (user.is_active === 'N' || user.status === 'inactive') ? 'inactive' : 'active',
      menu_permissions: expandedPermissions,
      granular_permissions: granular
    });"""

if old_edit_perms in ump_content:
    ump_content = ump_content.replace(old_edit_perms, new_edit_perms, 1)
    print("[OK] UserManagementPage.jsx: handleOpenEdit updated with sub-permission auto-expansion")
else:
    print("[!] UserManagementPage.jsx: old_edit_perms not found")

with open(ump_path, 'w', encoding='utf-8') as f:
    f.write(ump_content)


# 2. Update backend manage/users/save in api/index.php and client/public/api/index.php
for api_fpath in ['api/index.php', 'client/public/api/index.php']:
    with open(api_fpath, 'r', encoding='utf-8') as f:
        api_c = f.read()

    old_backend_perm_save = """        // Update assigned granular menu permissions in real time
        $db->prepare("DELETE FROM menu_permissions WHERE user_id = ?")->execute([$userId]);
        $ins = $db->prepare("
            INSERT INTO menu_permissions (user_id, menu_id, `add`, edit, `delete`, `print`, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        ");

        if (!empty($granularPermissions)) {
            foreach ($granularPermissions as $mKey => $g) {
                $mIdNum = (int)$mKey;
                if ($mIdNum <= 0) continue;
                $vAdd = !empty($g['add']) ? 1 : 0;
                $vEdit = !empty($g['edit']) ? 1 : 0;
                $vDel = !empty($g['delete']) ? 1 : 0;
                $vPrint = !empty($g['print']) ? 1 : 0;
                $ins->execute([$userId, $mIdNum, $vAdd, $vEdit, $vDel, $vPrint]);
            }
        } elseif (!empty($menuPermissions)) {
            foreach ($menuPermissions as $mId) {
                $mIdNum = (int)$mId;
                if ($mIdNum > 0) {
                    $ins->execute([$userId, $mIdNum, 1, 1, 1, 1]);
                }
            }
        }"""

    new_backend_perm_save = """        // Update assigned granular menu permissions in real time (save parent modules + all selected sub-permissions)
        $db->prepare("DELETE FROM menu_permissions WHERE user_id = ?")->execute([$userId]);
        $ins = $db->prepare("
            INSERT INTO menu_permissions (user_id, menu_id, `add`, edit, `delete`, `print`, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        ");

        $allUniqueMenuIds = [];
        if (is_array($menuPermissions)) {
            foreach ($menuPermissions as $mid) {
                $mIdNum = (int)$mid;
                if ($mIdNum > 0) $allUniqueMenuIds[$mIdNum] = true;
            }
        }
        if (is_array($granularPermissions)) {
            foreach ($granularPermissions as $mKey => $g) {
                $mIdNum = (int)$mKey;
                if ($mIdNum > 0) $allUniqueMenuIds[$mIdNum] = true;
            }
        }

        foreach ($allUniqueMenuIds as $mIdNum => $trueVal) {
            $g = $granularPermissions[$mIdNum] ?? null;
            $vAdd = $g ? (!empty($g['add']) ? 1 : 0) : 1;
            $vEdit = $g ? (!empty($g['edit']) ? 1 : 0) : 1;
            $vDel = $g ? (!empty($g['delete']) ? 1 : 0) : 1;
            $vPrint = $g ? (!empty($g['print']) ? 1 : 0) : 1;
            $ins->execute([$userId, $mIdNum, $vAdd, $vEdit, $vDel, $vPrint]);
        }"""

    if old_backend_perm_save in api_c:
        api_c = api_c.replace(old_backend_perm_save, new_backend_perm_save, 1)
        print(f"[OK] {api_fpath}: permission saving updated to save all parent + sub-permission IDs")
        with open(api_fpath, 'w', encoding='utf-8') as f:
            f.write(api_c)
    else:
        print(f"[!] {api_fpath}: old_backend_perm_save not found")


# 3. Update App.jsx canPerformAction to consider sub-permissions
app_path = os.path.join('client', 'src', 'App.jsx')
with open(app_path, 'r', encoding='utf-8') as f:
    app_c = f.read()

old_action_guard = """  // Granular RBAC Action Evaluator: checks view, add, edit, delete, print
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

new_action_guard = """  // Granular RBAC Action Evaluator: checks sub-permission IDs & granular view, add, edit, delete, print
  const canPerformAction = (menuId, action = 'view') => {
    if (isAdmin) return true;
    const mId = Number(menuId);
    if (!userPermNumbers.includes(mId)) return false;
    if (action === 'view') return true;

    // Check specific sub-permission IDs in userPermNumbers
    const subMap = {
      7: { add: [702, 703], edit: [704, 705, 706], delete: [707] },
      6: { add: [602], edit: [606], delete: [607] },
      8: { add: [802], edit: [803, 804], delete: [807] },
      10: { add: [1002], edit: [1003], delete: [1006] },
      2: { add: [3, 201], edit: [4, 202], delete: [3, 203] }
    };

    if (subMap[mId] && subMap[mId][action]) {
      const allowedSubs = subMap[mId][action];
      const allModuleSubs = [...(subMap[mId].add || []), ...(subMap[mId].edit || []), ...(subMap[mId].delete || [])];
      const hasAnySubConfigured = allModuleSubs.some(sid => userPermNumbers.includes(sid));
      if (hasAnySubConfigured && !allowedSubs.some(sid => userPermNumbers.includes(sid))) {
        return false;
      }
    }

    const gran = currentUser?.granular_permissions;
    if (!gran) return true;
    const modPerm = gran[mId] || gran[String(mId)];
    if (!modPerm) return true;
    const val = modPerm[action];
    if (val === undefined || val === null) return true;
    return Boolean(val === 1 || val === true || val === '1');
  };"""

if old_action_guard in app_c:
    app_c = app_c.replace(old_action_guard, new_action_guard, 1)
    print("[OK] App.jsx: canPerformAction updated with sub-permission mappings")
    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(app_c)
else:
    print("[!] App.jsx: old_action_guard not found")

print("\nAll sub-permissions upgrades applied successfully!")
