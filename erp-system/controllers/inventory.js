const { db } = require('../config/firebase-admin');

module.exports = {
  async getProducts(req, res) {
    try {
      let query = db.collection('products');
      
      // Add filters if provided
      if (req.query.category) {
        query = query.where('category', '==', req.query.category);
      }
      if (req.query.minPrice) {
        query = query.where('price', '>=', parseFloat(req.query.minPrice));
      }

      const snapshot = await query.get();
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).send('Error fetching products');
    }
  },

  async createProduct(req, res) {
    try {
      const productData = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Validate required fields
      if (!productData.sku || !productData.name || !productData.price) {
        return res.status(400).send('Missing required fields');
      }

      const docRef = await db.collection('products').add(productData);
      res.status(201).json({ id: docRef.id });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).send('Error creating product');
    }
  },

  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (typeof quantity !== 'number') {
        return res.status(400).send('Invalid quantity');
      }

      const docRef = db.collection('products').doc(id);
      await docRef.update({
        quantity,
        updatedAt: new Date()
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating stock:', error);
      res.status(500).send('Error updating stock');
    }
  }
};