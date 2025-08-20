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

app.use(express.json());

//  Middleware
app.use(bodyParser.json({ limit: '2mb' }));
// app.use(cors()); //  allows all origins
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: `http://localhost:3000` }));
} else {
  app.use(cors());
}

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
