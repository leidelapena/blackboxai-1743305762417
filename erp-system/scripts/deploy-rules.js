const { admin } = require('../config/firebase-admin');
const { rules } = require('../config/firestore-rules');

async function deploySecurityRules() {
  try {
    const source = { files: [{ content: rules }] };
    await admin.securityRules().releaseFirestoreRulesetFromSource(source);
    console.log('Firestore security rules deployed successfully');
  } catch (error) {
    console.error('Error deploying security rules:', error);
    process.exit(1);
  }
}

deploySecurityRules();