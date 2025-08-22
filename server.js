require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const logger = require('./utils/logger');

//  Import routes
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const categoryRouter = require('./routes/category');
const plantRouter = require('./routes/plant');
const eventRouter = require('./routes/event');
const climateZoneRouter = require('./routes/climate_zone');
const unsplashRoutes = require('./routes/unsplash');

mongoose.set('strictQuery', false);

const app = express();

//  DB
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => logger.info('DB Connected'))
  .catch(err => logger.error('DB Connection Error: ', err));

const path = require('path');
const port = process.env.PORT || 8000;
// server/app.js
const devOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174', // <— add this
];
const prodOrigin = process.env.CLIENT_ORIGIN; // e.g. https://timely-sunshine-732f02.netlify.app/

app.use(express.json());

//  Middleware
app.use(bodyParser.json({ limit: '2mb' }));

app.use(
  cors({
    origin: (origin, cb) => {
      // allow curl/Postman/no-origin
      if (!origin) return cb(null, true);

      if (process.env.NODE_ENV === 'development') {
        if (devOrigins.includes(origin)) return cb(null, true);
      } else {
        if (origin === prodOrigin) return cb(null, true);
      }

      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  }),
);

// Routes middleware
app.use('/api', authRouter);
app.use('/api', userRouter);
app.use('/api', categoryRouter);
app.use('/api', plantRouter);
app.use('/api', eventRouter);
app.use('/api', climateZoneRouter);
app.use('/api/unsplash', unsplashRoutes);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
