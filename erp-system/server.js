const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const { auth } = require('./config/firebase-admin');

// Configure emulators in development
if (process.env.NODE_ENV === 'development') {
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
app.use(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      req.user = await auth.verifyIdToken(token);
    }
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).send('Unauthorized');
  }
});

// Routes
app.use('/api', apiRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(`ERP API server running on port ${PORT}`);
});