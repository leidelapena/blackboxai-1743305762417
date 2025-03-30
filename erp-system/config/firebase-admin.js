const admin = require('firebase-admin');
const serviceAccount = require('./credentials/firebase-service-account.js');

const config = {
  credential: admin.credential.cert(serviceAccount)
};

// Use emulator settings in development
if (process.env.NODE_ENV === 'development') {
  config.databaseURL = 'http://localhost:8080';
  config.storageBucket = 'localhost:9199';
} else {
  config.databaseURL = 'https://overall-business-system.firebaseio.com';
  config.storageBucket = 'overall-business-system.appspot.com';
}

admin.initializeApp(config);

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();
const bucket = storage.bucket();

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';
}

module.exports = { admin, db, auth, storage, bucket };
