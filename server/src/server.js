require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Import routes
const surveyRoutes = require('./routes/surveyRoutes');
const routerRoutes = require('./routes/routerRoutes');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const clientRoutes = require('./routes/clientRoutes');
const securityRoutes = require('./routes/securityRoutes');
const apiExplorerRoutes = require('./routes/apiExplorerRoutes');
const analyticsController = require('./controllers/analyticsController');
const zampliaService = require('./services/zampliaService');
const marketXcelService = require('./services/marketXcelService');
const zampliaConfig = require('./config/zamplia');
const marketXcelConfig = require('./config/marketXcel');

const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for proper IP tracking behind Nginx / Cloudflare
app.set('trust proxy', true);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'SMR Zamplia MERN Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// System status endpoint — reports live-connection health of each upstream.
// This is what the UI's "System Status" panel and the API-key health check call,
// so operators can tell at a glance whether the Zamplia / Market Xcel keys are
// actually reaching their upstreams (vs. serving simulated fallback data).
app.get('/api/status', async (req, res) => {
  try {
    const force = req.query.force === 'true';
    const [zamplia, marketXcel] = await Promise.all([
      zampliaService.probeConnection(force),
      marketXcelService.probeConnection(force),
    ]);

    const mongoOnline = mongoose.connection.readyState === 1;

    res.json({
      success: true,
      service: 'SMR Zamplia MERN Backend',
      version: '3.4.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: {
        node: process.version,
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 5000,
        mongodb: {
          connected: mongoOnline,
          host: mongoOnline ? mongoose.connection.host : null,
        },
      },
      upstreams: {
        zamplia: {
          label: 'Zamplia Supply API',
          mode: zampliaConfig.useSandbox ? 'sandbox' : 'production',
          baseUrl: zampliaConfig.baseUrl,
          live: zamplia.live,
          httpStatus: zamplia.httpStatus,
          error: zamplia.error,
          keySource: zamplia.keySource,
          keyConfigured: !!zampliaConfig.apiKey,
          usingFallbackKey: zampliaConfig.usingFallbackKey,
          checkedAt: zamplia.checkedAt,
          checkedInMs: zamplia.checkedInMs,
        },
        marketXcel: {
          label: 'Market Xcel Demand API',
          baseUrl: marketXcelConfig.baseUrl,
          live: marketXcel.live,
          httpStatus: marketXcel.httpStatus,
          error: marketXcel.error,
          checkedAt: marketXcel.checkedAt,
          checkedInMs: marketXcel.checkedInMs,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// API Routes
app.use('/api/zamplia', surveyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/manage', projectRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/explorer', apiExplorerRoutes);

// Dashboard Analytics (was missing -> 404)
app.get('/api/dashboard/analytics', analyticsController.getAnalytics);

// High-Speed Traffic Router & Callbacks (Root Level)
app.use('/', routerRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Automated Cron: Sync Zamplia surveys every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  console.log('[Cron] Running scheduled Zamplia survey auto-sync...');
  try {
    const res = await zampliaService.syncSurveysToDb();
    console.log(`[Cron] Zamplia auto-sync complete: ${res.message}`);
  } catch (err) {
    console.error('[Cron] Zamplia auto-sync failed:', err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 SMR Zamplia MERN Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Surveys API: http://localhost:${PORT}/api/zamplia`);
  console.log(`   System Status: http://localhost:${PORT}/api/status`);
  console.log('====================================================');
  if (zampliaConfig.usingFallbackKey) {
    console.warn('⚠️  Security: using the built-in demo Zamplia API key.');
    console.warn('   Set ZAMPLIA_API_KEY (or ZAMPLIA_SANDBOX_API_KEY) in server/.env for production.');
  }
});
