require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/unstop_db';

// Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration for cookies & credentials
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Express Session with MongoStore
app.use(
  session({
    name: 'unstop_sid',
    secret: process.env.SESSION_SECRET || 'unstop_super_secret_y2k_session_key_982347102938',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      collectionName: 'sessions',
      ttl: 30 * 24 * 60 * 60, // 30 days
      autoRemove: 'native',
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // Default 24 hours (extended to 30 days if rememberMe is selected)
    },
  })
);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'UNSTOP — Student Academic & Productivity Management System',
    timestamp: new Date().toISOString(),
  });
});

// Mount Internal API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/planner', require('./routes/plannerRoutes'));
app.use('/api/focus', require('./routes/focusRoutes'));
app.use('/api/habits', require('./routes/habitRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found.' });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('[Internal Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[UNSTOP Backend Server] Running on http://localhost:${PORT}`);
    console.log(`[UNSTOP Backend Server] Target MongoDB: ${MONGO_URI}`);
  });
}

module.exports = app;
