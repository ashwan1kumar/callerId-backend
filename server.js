// index.js
require('dotenv').config();
const express = require('express');
const app = express();
const sequelize = require('./src/config/database');
const usersRoutes = require('./src/routes/users');
const searchRoutes = require('./src/routes/search');
const authCheck = require('./src/middlewares/auth');
const redis = require('./src/config/redis');

// Middleware to parse JSON request bodies
app.use(express.json());

// API routes
app.use('/api/users', usersRoutes);
app.use('/api/search',authCheck, searchRoutes);
app.locals.redisClient = redis;

// Start the server
const PORT = process.env.PORT || 3000;
sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

