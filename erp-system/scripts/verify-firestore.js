const { db } = require('../config/firebase-admin');

async function verifyFirestore() {
  try {
    // Test database connection
    const testDoc = db.collection('_connection_test').doc('status');
    await testDoc.set({ timestamp: new Date() });
    
    // Verify write operation
    const doc = await testDoc.get();
    if (doc.exists) {
      console.log('✅ Firestore connection verified successfully');
      console.log('Database ID:', db.app.options.projectId);
      console.log('Test document created at:', doc.data().timestamp);
    } else {
      throw new Error('Test document not found');
    }
  } catch (error) {
    console.error('❌ Firestore verification failed:');
    console.error(error.message);
    
    if (error.code === 5) {
      console.log('\nPossible solution:');
      console.log('1. Go to Firebase Console -> Firestore Database');
      console.log('2. Click "Create Database" if available');
      console.log('3. Select Native mode and a location');
      console.log('4. Wait a few minutes after creation');
    } else if (error.code === 7) {
      console.log('\nPossible solution:');
      console.log('1. Enable Firestore API at:');
      console.log('https://console.cloud.google.com/apis/api/firestore.googleapis.com/overview?project=overall-business-system');
    }
    
    process.exit(1);
  }
}

verifyFirestore();