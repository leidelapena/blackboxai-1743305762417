const { auth } = require('./firebase-admin');

// Authentication roles and permissions
const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  ACCOUNTANT: 'accountant',
  INVENTORY: 'inventory'
};

// Custom claims middleware
async function setUserRoles(uid, roles) {
  try {
    await auth.setCustomUserClaims(uid, { roles });
    return true;
  } catch (error) {
    console.error('Error setting custom claims:', error);
    return false;
  }
}

// Authentication middleware
function checkRole(requiredRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).send('Unauthorized');
    if (!requiredRoles.some(role => req.user.roles.includes(role))) {
      return res.status(403).send('Forbidden');
    }
    next();
  };
}

module.exports = {
  ROLES,
  setUserRoles,
  checkRole
};