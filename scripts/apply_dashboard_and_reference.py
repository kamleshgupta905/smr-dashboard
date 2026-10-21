import re

# 1. Update App.jsx
with open('client/src/App.jsx', 'r', encoding='utf-8') as f:
    app = f.read()

# Add getClients to imports if needed
if 'getClients' not in app:
    app = app.replace(
        "import { getSurveys, syncSurveys, DEFAULT_SURVEYS, GoogleSheetAPI } from './services/api';",
        "import { getSurveys, syncSurveys, DEFAULT_SURVEYS, GoogleSheetAPI, getClients } from './services/api';"
    )

# Add clientsCount state
if 'clientsCount' not in app:
    app = app.replace(
        "const [surveys, setSurveys] = useState([]);",
        "const [surveys, setSurveys] = useState([]);\n  const [clientsCount, setClientsCount] = useState(2);"
    )

# Update loadData to fetch real clients count
old_load_data = """  const loadData = async () => {
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
  };"""

new_load_data = """  const loadData = async () => {
    try {
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
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setSurveys(DEFAULT_SURVEYS);
    } finally {
      setLoading(false);
    }
  };"""

app = app.replace(old_load_data, new_load_data)

# Fix computedStats demandSources to use clientsCount
old_demand = """    const demandSources = 3; // 3 Active Connected Demand Clients: Market Xcel, Zamplia Demand Global, Ipsos Reid
    return {
      totalSurveys: total,
      activeSurveys: active,
      avgCpi,
      activeVendors: demandSources
    };
  }, [surveys]);"""

new_demand = """    return {
      totalSurveys: total,
      activeSurveys: active,
      avgCpi,
      activeVendors: clientsCount
    };
  }, [surveys, clientsCount]);"""

app = app.replace(old_demand, new_demand)

# Add reference page rendering
if "{activeTab === 'reference' && <ReferenceDataPage />}" not in app:
    app = app.replace(
        "{activeTab === 'team' && <TeamPage />}",
        "{activeTab === 'team' && <TeamPage />}\n          {activeTab === 'reference' && <ReferenceDataPage />}"
    )

with open('client/src/App.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(app)

print("Updated App.jsx successfully!")

# 2. Update Sidebar.jsx
with open('client/src/components/Sidebar.jsx', 'r', encoding='utf-8') as f:
    sidebar = f.read()

# Add Database icon if not imported
if 'Database' not in sidebar:
    sidebar = sidebar.replace("Briefcase,", "Briefcase,\n  Database,")

# Add 'reference' to activeTab check in useEffect
if "'reference'" not in sidebar:
    sidebar = sidebar.replace(
        "['developer-center', 'users', 'team'].includes(activeTab)",
        "['developer-center', 'users', 'team', 'reference'].includes(activeTab)"
    )

# Add Reference Data button in System & Team
if "handleNav('reference')" not in sidebar:
    team_button = """                          <button
                            className={`submenu-item ${activeTab === 'team' ? 'active' : ''}`}
                            onClick={() => handleNav('team')}
                          >
                            <span className="bullet-circle" />
                            <span>Team Directory</span>
                          </button>"""

    reference_button = team_button + """
                          <button
                            className={`submenu-item ${activeTab === 'reference' ? 'active' : ''}`}
                            onClick={() => handleNav('reference')}
                          >
                            <span className="bullet-circle" />
                            <span>Reference Data</span>
                          </button>"""

    sidebar = sidebar.replace(team_button, reference_button)

with open('client/src/components/Sidebar.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(sidebar)

print("Updated Sidebar.jsx successfully!")
