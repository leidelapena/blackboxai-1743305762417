const axios = require('axios');
// Use test configuration
const admin = require('firebase-admin');
admin.initializeApp({
  projectId: 'test-project',
  credential: admin.credential.applicationDefault()
});
const auth = admin.auth();

const API_BASE = 'http://localhost:3000/api';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

async function testEndpoints() {
  try {
    // Create a test user
    const testUser = await auth.createUser({
      email: 'test@erp.com',
      password: 'test1234'
    });
    await auth.setCustomUserClaims(testUser.uid, { 
      roles: ['admin', 'inventory'] 
    });

    // Get ID token for authentication
    const token = await auth.createCustomToken(testUser.uid);
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // Test product creation
    const productData = {
      sku: 'TEST-001',
      name: 'Test Product',
      price: 9.99,
      quantity: 100,
      category: 'test'
    };
    const createRes = await axios.post(
      `${API_BASE}/products`, 
      productData, 
      config
    );
    console.log('Product created:', createRes.data);

    // Test product listing
    const listRes = await axios.get(
      `${API_BASE}/products`, 
      config
    );
    console.log('Products:', listRes.data);

    // Clean up
    await auth.deleteUser(testUser.uid);
    console.log('Test completed successfully');
  } catch (error) {
    console.error('API test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

testEndpoints();