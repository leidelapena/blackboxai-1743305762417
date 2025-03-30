class DashboardModule {
  constructor() {
    this.name = "Dashboard";
    this.stats = {
      customers: 0,
      products: 0,
      orders: 0,
      revenue: 0
    };
  }

  async init() {
    await this.loadStats();
    this.setupEventListeners();
  }

  async loadStats() {
    // Load data from Firestore
    const statsRef = db.collection('stats').doc('summary');
    const doc = await statsRef.get();
    
    if (doc.exists) {
      this.stats = doc.data();
      this.updateUI();
    }
  }

  updateUI() {
    document.getElementById('customer-count').textContent = this.stats.customers;
    document.getElementById('product-count').textContent = this.stats.products;
    document.getElementById('order-count').textContent = this.stats.orders;
    document.getElementById('revenue-amount').textContent = 
      `$${this.stats.revenue.toLocaleString()}`;
  }

  setupEventListeners() {
    // Refresh button
    document.getElementById('refresh-stats').addEventListener('click', async () => {
      await this.loadStats();
    });
  }

  render() {
    return `
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">${this.name}</h2>
          <button id="refresh-stats" class="text-blue-600 hover:text-blue-800">
            <i class="fas fa-sync-alt mr-1"></i> Refresh
          </button>
        </div>
        
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-blue-50 p-4 rounded-lg">
            <div class="text-blue-600 mb-2">
              <i class="fas fa-users text-2xl"></i>
            </div>
            <h3 class="font-semibold text-gray-700">Customers</h3>
            <p class="text-3xl font-bold" id="customer-count">${this.stats.customers}</p>
          </div>
          
          <div class="bg-green-50 p-4 rounded-lg">
            <div class="text-green-600 mb-2">
              <i class="fas fa-boxes text-2xl"></i>
            </div>
            <h3 class="font-semibold text-gray-700">Products</h3>
            <p class="text-3xl font-bold" id="product-count">${this.stats.products}</p>
          </div>
          
          <div class="bg-purple-50 p-4 rounded-lg">
            <div class="text-purple-600 mb-2">
              <i class="fas fa-shopping-cart text-2xl"></i>
            </div>
            <h3 class="font-semibold text-gray-700">Orders</h3>
            <p class="text-3xl font-bold" id="order-count">${this.stats.orders}</p>
          </div>
          
          <div class="bg-yellow-50 p-4 rounded-lg">
            <div class="text-yellow-600 mb-2">
              <i class="fas fa-dollar-sign text-2xl"></i>
            </div>
            <h3 class="font-semibold text-gray-700">Revenue</h3>
            <p class="text-3xl font-bold" id="revenue-amount">$${this.stats.revenue.toLocaleString()}</p>
          </div>
        </div>
        
        <!-- Recent Activity Section -->
        <div class="mt-8">
          <h3 class="text-xl font-semibold mb-4">Recent Activity</h3>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-gray-500">Activity feed will appear here</p>
          </div>
        </div>
      </div>
    `;
  }
}