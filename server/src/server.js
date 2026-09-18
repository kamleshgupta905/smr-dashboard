require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');
const connectDB = require('./config/db');

// Import routes
const surveyRoutes = require('./routes/surveyRoutes');
const routerRoutes = require('./routes/routerRoutes');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const clientRoutes = require('./routes/clientRoutes');
const securityRoutes = require('./routes/securityRoutes');
const apiExplorerRoutes = require('./routes/apiExplorerRoutes');
const zampliaService = require('./services/zampliaService');

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

// API Routes
app.use('/api/zamplia', surveyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/manage', projectRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/explorer', apiExplorerRoutes);

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
  console.log('====================================================');
});
