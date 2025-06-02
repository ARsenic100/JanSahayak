require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const webhookRoutes = require('./routes/webhook');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Routes
app.use('/webhook', webhookRoutes);

// Connect to DB and start server
const PORT = process.env.PORT || 5500;

(async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI not defined in .env');

    await connectDB(mongoUri);

    app.listen(PORT, () => {
      console.log(`Connected to DB and listening on ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
})();
