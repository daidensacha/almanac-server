// server.js
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// const { expressjwt } = require('express-jwt');
// const logger = require('./utils/logger');

// mongoose.set('strictQuery', false);

// const app = express();
// const port = process.env.PORT || 8000;

// // --- DB
// mongoose
//   .connect(process.env.DATABASE_URL)
//   .then(() => logger.info('DB Connected'))
//   .catch(err => logger.error('DB Connection Error:', err));

// // --- Middleware
// const devOrigins = [
//   'http://localhost:3000',
//   'http://localhost:5173',
//   'http://localhost:5174',
//   'http://127.0.0.1:3000',
//   'http://127.0.0.1:5173',
//   'http://127.0.0.1:5174',
// ];
// const prodOrigin = process.env.CLIENT_ORIGIN;

// app.use(cookieParser());
// app.use(express.json());
// app.use(bodyParser.json({ limit: '2mb' }));
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
// // 🚫 DO NOT add app.options('*', cors()) (this is what crashed before)

// // --- Auth gate (public routes whitelisted below)
// app.use(
//   expressjwt({
//     secret: process.env.JWT_SECRET,
//     algorithms: ['HS256'],
//     getToken: req => {
//       if (req.headers.authorization?.startsWith('Bearer ')) {
//         return req.headers.authorization.split(' ')[1];
//       }
//       if (req.cookies?.token) return req.cookies.token;
//       return null;
//     },
//   }).unless({
//     path: [
//       // public
//       {
//         url: /\/api\/auth\/(signin|signup|forgot-password|reset-password)$/i,
//         methods: ['POST'],
//       },
//       { url: /\/api\/health$/i, methods: ['GET'] },
//       { url: /.*/, methods: ['OPTIONS'] },
//     ],
//   }),
// );

// // --- Safe loader so one bad router doesn't kill the process
// function safeRequire(label, p) {
//   try {
//     const mod = require(p);
//     logger.info(`loaded: ${label}`);
//     return mod;
//   } catch (e) {
//     console.error(`❌ Failed requiring ${label} (${p})`);
//     console.error(e);
//     return null; // don't crash
//   }
// }

// // --- Routes (add back one-by-one and restart)
// const authRouter = safeRequire('auth', './routes/auth');
// if (authRouter) app.use('/api', authRouter);

// const userRouter = safeRequire('user', './routes/user');
// if (userRouter) app.use('/api', userRouter);

// const categoryRouter = safeRequire('category', './routes/category');
// if (categoryRouter) app.use('/api', categoryRouter);

// const plantRouter = safeRequire('plant', './routes/plant');
// if (plantRouter) app.use('/api', plantRouter);

// const eventRouter = safeRequire('event', './routes/event');
// if (eventRouter) app.use('/api', eventRouter);

// const climateZoneRouter = safeRequire('climateZone', './routes/climate_zone');
// if (climateZoneRouter) app.use('/api', climateZoneRouter);

// const unsplashRouter = safeRequire('unsplash', './routes/unsplash');
// if (unsplashRouter) app.use('/api/unsplash', unsplashRouter);

// const adminRouter = safeRequire('admin', './routes/admin');
// if (adminRouter) app.use('/api/admin', adminRouter);

// // health
// app.get('/api/health', (_req, res) => res.json({ ok: true }));

// app.listen(port, () => {
//   logger.info(`Server is running on port ${port}`);
// });

//////////////////////////////////////////////////////////////////

// server.js (diagnostic)
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const logger = require('./utils/logger');

// const app = express();
// const port = process.env.PORT || 8000;

// app.use(express.json());
// app.use(cors({ origin: true, credentials: true }));

// // sanity route
// app.get('/__boot', (_req, res) => res.json({ ok: true }));

// // helper to pinpoint broken file
// function safeRequire(label, p) {
//   try {
//     const mod = require(p);
//     logger.info(`loaded: ${label}`);
//     return mod;
//   } catch (e) {
//     console.error(`❌ Failed requiring ${label} (${p})`);
//     console.error(e);
//     process.exit(1);
//   }
// }

// // Then mount them (only after the corresponding require succeeds):
// app.use('/api', authRouter);
// app.use('/api', userRouter);
// app.use('/api', categoryRouter);
// app.use('/api', plantRouter);
// app.use('/api', eventRouter);
// app.use('/api', climateZoneRouter);
// app.use('/api/unsplash', unsplashRouter);
// app.use('/api/admin', adminRouter);

// app.listen(port, () => {
//   logger.info(`Server is running on port ${port}`);
// });

/////////////////////////////////////////////////////////////////

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
const adminRouter = require('./routes/admin');

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
// This crashes server !!!!!
// app.options('*', cors());

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
app.use('/api/admin', adminRouter);
// ───────────────────────────────────────────────
// Start
// ───────────────────────────────────────────────
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
