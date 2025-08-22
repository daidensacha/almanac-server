// server/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { expressjwt } = require('express-jwt');
const path = require('path');
const logger = require('./utils/logger');

// Routers
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const categoryRouter = require('./routes/category');
const plantRouter = require('./routes/plant');
const eventRouter = require('./routes/event');
const climateZoneRouter = require('./routes/climate_zone');
const unsplashRoutes = require('./routes/unsplash');

mongoose.set('strictQuery', false);

const app = express();
const port = process.env.PORT || 8000;

// ───────────────────────────────────────────────
// DB
// ───────────────────────────────────────────────
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => logger.info('DB Connected'))
  .catch(err => logger.error('DB Connection Error: ', err));

// ───────────────────────────────────────────────
// Middleware
// ───────────────────────────────────────────────
const devOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];
const prodOrigin = process.env.CLIENT_ORIGIN;

app.use(cookieParser()); // must come before express-jwt
app.use(express.json());
app.use(bodyParser.json({ limit: '2mb' }));

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (process.env.NODE_ENV === 'development') {
        if (devOrigins.includes(origin)) return cb(null, true);
      } else {
        if (origin === prodOrigin) return cb(null, true);
      }
      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
);
app.options('*', cors());

// ───────────────────────────────────────────────
// Auth middleware (express-jwt)
// ───────────────────────────────────────────────
app.use(
  expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'],
    getToken: req => {
      // 1) Header
      if (req.headers.authorization?.startsWith('Bearer ')) {
        return req.headers.authorization.split(' ')[1];
      }
      // 2) Cookie
      if (req.cookies?.token) {
        return req.cookies.token;
      }
      return null;
    },
  }).unless({
    path: [
      // Public routes
      {
        url: /\/api\/auth\/(signin|signup|forgot-password|reset-password)/i,
        methods: ['POST', 'GET'],
      },
      { url: /\/api\/health/i, methods: ['GET'] },
      { url: /.*/, methods: ['OPTIONS'] }, // allow preflight
    ],
  }),
);

// ───────────────────────────────────────────────
// Routes
// ───────────────────────────────────────────────
app.use('/api', authRouter);
app.use('/api', userRouter);
app.use('/api', categoryRouter);
app.use('/api', plantRouter);
app.use('/api', eventRouter);
app.use('/api', climateZoneRouter);
app.use('/api/unsplash', unsplashRoutes);

// ───────────────────────────────────────────────
// Start
// ───────────────────────────────────────────────
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
