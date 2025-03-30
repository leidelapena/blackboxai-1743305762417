const { db } = require('../config/firebase-admin');
const schema = require('../config/firestore-schema');

async function initializeCollections() {
  try {
    // Create reference documents for each collection
    for (const [collectionName, config] of Object.entries(schema)) {
      const docRef = db.collection(collectionName).doc('--schema--');
      await docRef.set({
        _schema: config.fields,
        _createdAt: new Date(),
        _description: `Schema definition for ${collectionName} collection`
      });
      console.log(`Created schema reference for ${collectionName}`);
    }
    
    console.log('Firestore initialization completed successfully');
  } catch (error) {
    console.error('Initialization failed:', error);
  }
}

initializeCollections();