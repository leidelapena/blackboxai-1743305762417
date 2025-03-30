// Core ERP Collections Schema
module.exports = {
  // Company Information
  companies: {
    fields: {
      name: { type: 'string', required: true },
      address: { type: 'object' },
      taxId: { type: 'string' },
      phone: { type: 'string' },
      email: { type: 'string' },
      website: { type: 'string' }
    }
  },

  // CRM Module
  customers: {
    fields: {
      name: { type: 'string', required: true },
      contactPerson: { type: 'string' },
      email: { type: 'string' },
      phone: { type: 'string' },
      address: { type: 'object' },
      status: { type: 'string', enum: ['lead', 'customer', 'inactive'] },
      notes: { type: 'array' }
    }
  },

  // Inventory Module
  products: {
    fields: {
      sku: { type: 'string', required: true },
      name: { type: 'string', required: true },
      description: { type: 'string' },
      price: { type: 'number', required: true },
      cost: { type: 'number' },
      quantity: { type: 'number', required: true },
      category: { type: 'string' },
      supplier: { type: 'reference', collection: 'suppliers' }
    }
  },

  // Accounting Module
  invoices: {
    fields: {
      invoiceNumber: { type: 'string', required: true },
      customer: { type: 'reference', collection: 'customers', required: true },
      date: { type: 'timestamp', required: true },
      dueDate: { type: 'timestamp' },
      items: { type: 'array' },
      subtotal: { type: 'number', required: true },
      tax: { type: 'number' },
      total: { type: 'number', required: true },
      status: { type: 'string', enum: ['draft', 'sent', 'paid', 'cancelled'] }
    }
  },

  // HR Module
  employees: {
    fields: {
      name: { type: 'string', required: true },
      position: { type: 'string' },
      department: { type: 'string' },
      hireDate: { type: 'timestamp' },
      salary: { type: 'number' },
      contact: { type: 'object' }
    }
  }
};