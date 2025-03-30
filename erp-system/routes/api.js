const express = require('express');
const router = express.Router();
const { checkRole } = require('../config/auth-config');
const { ROLES } = require('../config/auth-config');

// Import controllers
const authController = require('../controllers/auth');
const inventoryController = require('../controllers/inventory');

// Authentication routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Inventory routes
router.get('/products', checkRole([ROLES.ADMIN, ROLES.INVENTORY]), inventoryController.getProducts);
router.post('/products', checkRole([ROLES.ADMIN, ROLES.INVENTORY]), inventoryController.createProduct);

module.exports = router;