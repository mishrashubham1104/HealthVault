import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { seedMockData } from './utils/seedData.js';

// Route Imports
import authRoutes from './routes/auth.js';
import recordRoutes from './routes/records.js';
import sharingRoutes from './routes/sharing.js';
import reminderRoutes from './routes/reminders.js';
import healthRoutes from './routes/health.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security Headers (Helmet)
app.use(helmet());

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per 15 minutes for auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login or registration attempts, please try again after 15 minutes'
  }
});

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Not allowed by policy - ' + origin));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply Global Rate Limiter (to all endpoints)
app.use(globalLimiter);

// Serve static encrypted files directory as a fallback (though direct access is forbidden without auth download route)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/sharing', sharingRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/health', healthRoutes);

// Health check endpoint
app.get('/api/healthcheck', (req, res) => {
  res.json({
    status: 'online',
    database: global.isMockDB ? 'Demo (In-Memory Mock)' : 'Connected (MongoDB Atlas)',
    timestamp: new Date()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Connect Database & Start Server
const startServer = async () => {
  // Connect to DB (sets global.isMockDB)
  await connectDB();

  // If connection failed, seed mock database (Disabled as per user request to remove all dummy/mock data)
  if (global.isMockDB) {
    console.log('[Seed Data] In-memory mock seeding is disabled.');
  }

  app.listen(PORT, () => {
    console.log(`[Server] HealthVault Backend listening on port ${PORT}`);
    console.log(`[Server] Mode: ${global.isMockDB ? 'DEMO (Mock DB)' : 'PRODUCTION (MongoDB)'}`);
  });
};

startServer();
