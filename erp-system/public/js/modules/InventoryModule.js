class InventoryModule {
  constructor() {
    this.name = "Inventory";
    this.products = [];
    this.categories = [];
    this.currentView = 'products'; // 'products' or 'categories'
    this.currentProduct = null;
    this.currentCategory = null;
  }

  async init() {
    await Promise.all([
      this.loadProducts(),
      this.loadCategories()
    ]);
    this.setupEventListeners();
  }

  async loadProducts() {
    const snapshot = await db.collection('products')
      .orderBy('name')
      .get();
    
    this.products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    if (this.currentView === 'products') {
      this.renderProductsList();
    }
  }

  async loadCategories() {
    const snapshot = await db.collection('categories')
      .orderBy('name')
      .get();
    
    this.categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  renderProductsList() {
    const productsHtml = this.products.map(product => {
      const category = this.categories.find(c => c.id === product.categoryId);
      return `
        <tr class="hover:bg-gray-50" data-product-id="${product.id}">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">${product.code || ''}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">${product.name}</div>
            <div class="text-sm text-gray-500">${product.description || ''}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${category?.name || 'Uncategorized'}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            $${product.price?.toFixed(2) || '0.00'}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
              ${product.quantity > 10 ? 'bg-green-100 text-green-800' : 
                product.quantity > 0 ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'}">
              ${product.quantity} in stock
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button class="text-blue-600 hover:text-blue-900 mr-3 edit-product">Edit</button>
            <button class="text-red-600 hover:text-red-900 delete-product">Delete</button>
          </td>
        </tr>
      `;
    }).join('');

    document.getElementById('module-content').innerHTML = `
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">${this.name}</h2>
          <div class="flex space-x-3">
            <button id="view-categories" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
              <i class="fas fa-tags mr-2"></i>Categories
            </button>
            <button id="add-product" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              <i class="fas fa-plus mr-2"></i>Add Product
            </button>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${productsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderCategoriesList() {
    const categoriesHtml = this.categories.map(category => `
      <tr class="hover:bg-gray-50" data-category-id="${category.id}">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">${category.name}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-500">${category.description || ''}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button class="text-blue-600 hover:text-blue-900 mr-3 edit-category">Edit</button>
          <button class="text-red-600 hover:text-red-900 delete-category">Delete</button>
        </td>
      </tr>
    `).join('');

    document.getElementById('module-content').innerHTML = `
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">Product Categories</h2>
          <div class="flex space-x-3">
            <button id="view-products" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
              <i class="fas fa-boxes mr-2"></i>View Products
            </button>
            <button id="add-category" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              <i class="fas fa-plus mr-2"></i>Add Category
            </button>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${categoriesHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderProductForm(product = null) {
    this.currentProduct = product;
    const isEdit = !!product;
    
    const categoryOptions = this.categories.map(category => `
      <option value="${category.id}" ${isEdit && product.categoryId === category.id ? 'selected' : ''}>
        ${category.name}
      </option>
    `).join('');

    document.getElementById('module-content').innerHTML = `
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-2xl font-bold mb-6">${isEdit ? 'Edit' : 'Add'} Product</h2>
        
        <form id="product-form" class="space-y-6">
          <input type="hidden" id="product-id" value="${isEdit ? product.id : ''}">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="code" class="block text-sm font-medium text-gray-700">Product Code</label>
              <input type="text" id="code" name="code" 
                value="${isEdit ? product.code : ''}"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
            
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">Product Name *</label>
              <input type="text" id="name" name="name" required
                value="${isEdit ? product.name : ''}"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
          </div>
          
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" name="description" rows="3"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">${isEdit ? product.description : ''}</textarea>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
              <select id="category" name="category"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option value="">-- Select Category --</option>
                ${categoryOptions}
              </select>
            </div>
            
            <div>
              <label for="price" class="block text-sm font-medium text-gray-700">Price *</label>
              <input type="number" id="price" name="price" step="0.01" min="0" required
                value="${isEdit ? product.price : ''}"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
            
            <div>
              <label for="quantity" class="block text-sm font-medium text-gray-700">Quantity *</label>
              <input type="number" id="quantity" name="quantity" min="0" required
                value="${isEdit ? product.quantity : ''}"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button type="button" id="cancel-form" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Cancel
            </button>
            <button type="submit" class="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              ${isEdit ? 'Update' : 'Save'} Product
            </button>
          </div>
        </form>
      </div>
    `;
  }

  renderCategoryForm(category = null) {
    this.currentCategory = category;
    const isEdit = !!category;
    
    document.getElementById('module-content').innerHTML = `
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-2xl font-bold mb-6">${isEdit ? 'Edit' : 'Add'} Category</h2>
        
        <form id="category-form" class="space-y-6">
          <input type="hidden" id="category-id" value="${isEdit ? category.id : ''}">
          
          <div>
            <label for="category-name" class="block text-sm font-medium text-gray-700">Name *</label>
            <input type="text" id="category-name" name="name" required
              value="${isEdit ? category.name : ''}"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
          </div>
          
          <div>
            <label for="category-description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="category-description" name="description" rows="3"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">${isEdit ? category.description : ''}</textarea>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button type="button" id="cancel-category-form" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Cancel
            </button>
            <button type="submit" class="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              ${isEdit ? 'Update' : 'Save'} Category
            </button>
          </div>
        </form>
      </div>
    `;
  }

  setupEventListeners() {
    // View categories button
    document.getElementById('view-categories')?.addEventListener('click', () => {
      this.currentView = 'categories';
      this.renderCategoriesList();
    });

    // View products button
    document.getElementById('view-products')?.addEventListener('click', () => {
      this.currentView = 'products';
      this.renderProductsList();
    });

    // Add product button
    document.getElementById('add-product')?.addEventListener('click', () => {
      this.currentView = 'product-form';
      this.renderProductForm();
    });

    // Add category button
    document.getElementById('add-category')?.addEventListener('click', () => {
      this.currentView = 'category-form';
      this.renderCategoryForm();
    });

    // Edit product buttons
    document.querySelectorAll('.edit-product').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.closest('tr').dataset.productId;
        const product = this.products.find(p => p.id === productId);
        this.currentView = 'product-form';
        this.renderProductForm(product);
      });
    });

    // Delete product buttons
    document.querySelectorAll('.delete-product').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const productId = e.target.closest('tr').dataset.productId;
        if (confirm('Are you sure you want to delete this product?')) {
          await db.collection('products').doc(productId).delete();
          await this.loadProducts();
        }
      });
    });

    // Edit category buttons
    document.querySelectorAll('.edit-category').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const categoryId = e.target.closest('tr').dataset.categoryId;
        const category = this.categories.find(c => c.id === categoryId);
        this.currentView = 'category-form';
        this.renderCategoryForm(category);
      });
    });

    // Delete category buttons
    document.querySelectorAll('.delete-category').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const categoryId = e.target.closest('tr').dataset.categoryId;
        if (confirm('Are you sure you want to delete this category?')) {
          await db.collection('categories').doc(categoryId).delete();
          await this.loadCategories();
        }
      });
    });

    // Cancel product form
    document.getElementById('cancel-form')?.addEventListener('click', () => {
      this.currentView = 'products';
      this.renderProductsList();
    });

    // Cancel category form
    document.getElementById('cancel-category-form')?.addEventListener('click', () => {
      this.currentView = 'categories';
      this.renderCategoriesList();
    });

    // Submit product form
    document.getElementById('product-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        code: document.getElementById('code').value,
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        categoryId: document.getElementById('category').value || null,
        price: parseFloat(document.getElementById('price').value),
        quantity: parseInt(document.getElementById('quantity').value),
        updatedAt: new Date()
      };

      try {
        if (this.currentProduct) {
          // Update existing product
          await db.collection('products').doc(this.currentProduct.id).update(formData);
        } else {
          // Add new product
          await db.collection('products').add(formData);
        }
        
        this.currentView = 'products';
        await this.loadProducts();
      } catch (error) {
        console.error('Error saving product:', error);
        alert('Error saving product');
      }
    });

    // Submit category form
    document.getElementById('category-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        name: document.getElementById('category-name').value,
        description: document.getElementById('category-description').value,
        updatedAt: new Date()
      };

      try {
        if (this.currentCategory) {
          // Update existing category
          await db.collection('categories').doc(this.currentCategory.id).update(formData);
        } else {
          // Add new category
          await db.collection('categories').add(formData);
        }
        
        this.currentView = 'categories';
        await this.loadCategories();
      } catch (error) {
        console.error('Error saving category:', error);
        alert('Error saving category');
      }
    });
  }

  render() {
    switch (this.currentView) {
      case 'categories':
        return this.renderCategoriesList();
      case 'product-form':
        return this.renderProductForm();
      case 'category-form':
        return this.renderCategoryForm();
      default:
        return this.renderProductsList();
    }
  }
}