const { auth } = require('../config/firebase-admin');
const { ROLES, setUserRoles } = require('../config/auth-config');

module.exports = {
  async login(req, res) {
    try {
      // Verify ID token from client
      const { idToken } = req.body;
      const decodedToken = await auth.verifyIdToken(idToken);
      
      // Get user record
      const user = await auth.getUser(decodedToken.uid);
      
      // Return user data with roles
      res.json({
        uid: user.uid,
        email: user.email,
        roles: user.customClaims?.roles || [ROLES.EMPLOYEE]
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).send('Authentication failed');
    }
  },

  async register(req, res) {
    try {
      const { email, password, role } = req.body;
      
      // Create user
      const user = await auth.createUser({
        email,
        password
      });

      // Set default role if not provided
      const roles = role ? [role] : [ROLES.EMPLOYEE];
      
      // Assign custom claims
      await setUserRoles(user.uid, roles);

      res.status(201).json({
        uid: user.uid,
        email: user.email,
        roles
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).send('Registration failed');
    }
  }
};