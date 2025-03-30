// Initialize Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "overall-business-system.firebaseapp.com",
  projectId: "overall-business-system",
  storageBucket: "overall-business-system.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Make available to other files
const auth = firebase.auth();
const db = firebase.firestore();

// Export if using modules
// export { auth, db };