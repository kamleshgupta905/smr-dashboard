# SMR dashboard redesign analysis

## Product surface reviewed

The repository is a React/Vite client with a Laravel/PHP API deployment path and a Node/Express development gateway. The dashboard is not a single report page; it is a multi-role survey operations console.

### Feature map

| Area | Existing responsibility | UI treatment in this pass |
| --- | --- | --- |
| Authentication | Server-verified admin login, token/session persistence, role and menu permissions | Rebuilt sign-in experience; kept server-only verification and storage contract intact |
| Workspace shell | Sidebar groups, URL hash routing, browser back/forward, global search, notifications, profile menu, sync | Rebuilt responsive shell with clearer hierarchy, compact navigation, mobile drawer, and calmer topbar |
| Dashboard | Inventory KPIs, Zamplia sync, CPI/quota insights, audience mix, activity/analytics | Rebuilt as a responsive operations overview with live metrics, SVG chart, inventory mix, priority supply table, signals, and quick actions |
| Survey inventory | Live Zamplia/Market Xcel supply, search/filtering, quotas, qualifications, vendor assignment, pre-screener launch | Existing API and action flows preserved; dashboard actions continue to open the same modals |
| Partners | Client demand integrations and supply vendor management | Existing CRUD and integration screens preserved; shell styling normalized |
| Operations | Traffic leads, payments, reconciliation, security/fraud policy, routing tests | Existing routes and permissions preserved; dense screens receive the shared surface/input/table polish |
| Administration | Users, granular RBAC, team directory, reference data, API developer center | Existing pages and impersonation controls preserved; new shell keeps role-aware visibility |
| Public router | Vendor entry links, pre-screener, survey callbacks and settlement redirects | Existing public route detection and components preserved |
| Resilience | Bundled survey snapshot, API fallbacks, background sync, 15-second refresh | Preserved; dashboard renders meaningful empty/loading states when a source is unavailable |

## Data and security checks

- Live survey objects are normalized from both PascalCase Zamplia responses and the local snake_case schema before metrics are calculated.
- Dashboard numbers are derived from `surveys`, `stats`, and the analytics endpoint. No client-side admin credential fallback was introduced.
- Existing login token, user data, permissions, impersonation, logout, and hash-routing contracts remain unchanged.
- The API interceptor now reads the same `smr_auth_role` key that the login screen writes, while retaining the legacy key for compatibility.
- Existing fallback snapshots remain available for inventory continuity when the supplier gateway is slow or unavailable.

## Visual decisions

- No gradients are used in the client UI. Charts use solid strokes, solid fills, and SVG rings.
- Palette: ink for primary actions, teal for live/healthy states, amber for yield and attention, and blue for partner context.
- Typography is compact and operational: strong numeric hierarchy, restrained labels, predictable table density, and no decorative dashboard noise.
- Motion is limited to page/card entrance, sidebar accordion, popovers, counter easing, chart point selection, and sync feedback. `prefers-reduced-motion` is respected.
- The responsive breakpoints collapse the shell into a mobile drawer, stack dashboard regions, make tables horizontally scrollable, and preserve touch-sized actions.

## Validation completed

- `npm run build` succeeds for the client.
- `git diff --check` passes.
- Client source has no remaining `gradient`, `linear-gradient`, or `radial-gradient` declarations.
- Local Vite + Express preview starts on ports 3000 and 5000; the inventory and analytics endpoints respond.
