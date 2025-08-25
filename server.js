require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { expressjwt } = require('express-jwt');
const path = require('path');
const logger = require('./utils/logger');
// import publicRouter from './routes/public.js';

// Routers
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const categoryRouter = require('./routes/category');
const plantRouter = require('./routes/plant');
const eventRouter = require('./routes/event');
const climateZoneRouter = require('./routes/climate_zone');
const unsplashRoutes = require('./routes/unsplash');
const adminRouter = require('./routes/admin');
const ipLocateRoutes = require('./routes/ip-locate');

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
// const devOrigins = [
//   'http://localhost:3000',
//   'http://localhost:5173',
//   'http://localhost:5174',
//   'http://127.0.0.1:3000',
//   'http://127.0.0.1:5173',
//   'http://127.0.0.1:5174',
// ];
// const prodOrigin = process.env.CLIENT_ORIGIN;

// app.use(cookieParser()); // ✅ must be before express-jwt
// app.use(express.json());
// app.use(bodyParser.json({ limit: '2mb' }));

// // 1) PUBLIC first (no auth)
// // app.use('/api', publicRouter);

// app.use(
//   cors({
//     origin: (origin, cb) => {
//       if (!origin) return cb(null, true);
//       if (process.env.NODE_ENV === 'development') {
//         if (devOrigins.includes(origin)) return cb(null, true);
//       } else {
//         if (origin === prodOrigin) return cb(null, true);
//       }
//       return cb(new Error(`CORS blocked: ${origin}`));
//     },
//     credentials: true,
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   }),
// );
// ---- CORS (defensive, with normalization) ----
const devOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

app.use(cookieParser()); // fine before auth
app.use(express.json());
app.use(bodyParser.json({ limit: '2mb' }));

// normalize helper: lower-case, trim, remove trailing slash
const norm = (u = '') => String(u).trim().toLowerCase().replace(/\/+$/, '');

const DEV_SET = new Set(devOrigins.map(norm));
const PROD_ORIGIN = norm(process.env.CLIENT_ORIGIN);

// good to see what the server thinks:
console.log('[CORS] NODE_ENV=', process.env.NODE_ENV);
console.log('[CORS] PROD_ORIGIN=', PROD_ORIGIN || '(unset)');

const corsOptions = (req, callback) => {
  const reqOrigin = req.header('Origin');
  // Allow non-browser tools (no Origin header) so health checks / curl work
  if (!reqOrigin) {
    return callback(null, {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
  }

  const O = norm(reqOrigin);
  const isDev = process.env.NODE_ENV === 'development';
  const allowed =
    (isDev && DEV_SET.has(O)) || (!isDev && PROD_ORIGIN && O === PROD_ORIGIN);

  if (allowed) {
    return callback(null, {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
  }

  console.warn('[CORS] blocked:', reqOrigin);
  // Important: callback with an Error tells the cors middleware NOT to set CORS headers
  return callback(new Error(`CORS blocked: ${reqOrigin}`));
};

// Put cors BEFORE your routes
app.use(cors(corsOptions));
// Handle preflight with the SAME options (safe; no crash)
app.options('*', cors(corsOptions));
// This crashes server !!!!!
// app.options('*', cors());

// Public endpoints (no auth)
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, message: 'pong' });
});

// Make sure models are required at the top
// at top (adjust paths)
const User = require('./models/user');
const Plant = require('./models/plant');
const Category = require('./models/category');
const Event = require('./models/event');

// PUBLIC health route — put ABOVE express-jwt
app.get('/api/health', async (req, res) => {
  try {
    const [users, plants, categories, events] = await Promise.all([
      User.estimatedDocumentCount().exec(), // or countDocuments().exec()
      Plant.estimatedDocumentCount().exec(),
      Category.estimatedDocumentCount().exec(),
      Event.estimatedDocumentCount().exec(),
    ]);

    res.json({
      ok: true,
      db: 'ok',
      uptime: `${Math.floor(process.uptime())}s`,
      counts: { users, plants, categories, events },
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ───────────────────────────────────────────────
// Auth middleware (express-jwt)
// ───────────────────────────────────────────────
app.use(
  expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'],
    getToken: req => {
      if (req.headers.authorization?.startsWith('Bearer ')) {
        return req.headers.authorization.split(' ')[1];
      }
      if (req.cookies?.token) return req.cookies.token;
      return null;
    },
  }).unless({
    path: [
      // Public pings/health
      { url: /\/api\/ping/i, methods: ['GET'] },
      { url: /\/api\/health/i, methods: ['GET'] },
      { url: /\/api\/auth\/health/i, methods: ['GET'] },

      // Auth routes (non-/auth form)
      { url: /\/api\/signup/i, methods: ['POST'] },
      { url: /\/api\/signin/i, methods: ['POST'] },
      { url: /\/api\/signout/i, methods: ['POST'] },
      { url: /\/api\/account-activation/i, methods: ['POST'] },
      { url: /\/api\/forgot-password/i, methods: ['PUT'] }, // <— PUT (not POST)
      { url: /\/api\/reset-password/i, methods: ['PUT'] }, // <— PUT (not POST/GET)

      // Auth routes (with /auth prefix form)
      { url: /\/api\/auth\/signup/i, methods: ['POST'] },
      { url: /\/api\/auth\/signin/i, methods: ['POST'] },
      { url: /\/api\/auth\/signout/i, methods: ['POST'] },
      { url: /\/api\/auth\/account-activation/i, methods: ['POST'] },
      { url: /\/api\/auth\/forgot-password/i, methods: ['PUT'] },
      { url: /\/api\/auth\/reset-password/i, methods: ['PUT'] },

      // CORS preflight
      { url: /.*/, methods: ['OPTIONS'] },

      // Optional public proxy
      { url: /\/api\/unsplash\/.*/i, methods: ['GET'] },
    ],
  }),
);

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res
      .status(401)
      .json({ ok: false, error: 'unauthorized', path: req.path });
  }
  next(err);
});

// ───────────────────────────────────────────────
// Routes
// ───────────────────────────────────────────────
// trust proxy so req.ip works behind proxies
app.set('trust proxy', true);
app.use('/api', authRouter);
app.use('/api', userRouter);
app.use('/api', categoryRouter);
app.use('/api', plantRouter);
app.use('/api', eventRouter);
app.use('/api', climateZoneRouter);
app.use('/api/unsplash', unsplashRoutes);
app.use('/api/admin', adminRouter);
app.use('/api', ipLocateRoutes);
// ───────────────────────────────────────────────
// Start
// ───────────────────────────────────────────────
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
