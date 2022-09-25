require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//  Import routes
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const categoryRouter = require('./routes/category');
const plantRouter = require('./routes/plant');
const eventRouter = require('./routes/event');

const app = express();

//  DB
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log('DB Connected'))
  .catch(err => console.log('DB Connection Error: ', err));

const path = require('path');
const port = process.env.PORT || 8000;

app.use(express.json());

//  Middleware
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '2mb' }));
// app.use(cors()); //  allows all origins
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: `http://localhost:3000` }));
}

// Routes middleware
app.use('/api', authRouter);
app.use('/api', userRouter);
app.use('/api', categoryRouter);
app.use('/api', plantRouter);
app.use('/api', eventRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})
