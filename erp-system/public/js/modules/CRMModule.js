class CRMModule {
  constructor() {
    this.name = "CRM";
    this.contacts = [];
    this.currentView = 'list'; // 'list' or 'form'
    this.currentContact = null;
  }

  async init() {
    await this.loadContacts();
    this.setupEventListeners();
  }

  async loadContacts() {
    const snapshot = await db.collection('contacts')
      .orderBy('lastContact', 'desc')
      .limit(50)
      .get();
    
    this.contacts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    this.renderContactsList();
  }

  renderContactsList() {
    const contactsHtml = this.contacts.map(contact => `
      <tr class="hover:bg-gray-50" data-contact-id="${contact.id}">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <div class="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <i class="fas fa-user text-blue-600"></i>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-900">${contact.name}</div>
              <div class="text-sm text-gray-500">${contact.email}</div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">${contact.company || '-'}</div>
          <div class="text-sm text-gray-500">${contact.phone || '-'}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
            ${contact.status === 'lead' ? 'bg-yellow-100 text-yellow-800' : 
              contact.status === 'customer' ? 'bg-green-100 text-green-800' : 
              'bg-gray-100 text-gray-800'}">
            ${contact.status}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${new Date(contact.lastContact?.seconds * 1000).toLocaleDateString()}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button class="text-blue-600 hover:text-blue-900 mr-3 edit-contact">Edit</button>
          <button class="text-red-600 hover:text-red-900 delete-contact">Delete</button>
        </td>
      </tr>
    `).join('');

    document.getElementById('module-content').innerHTML = `
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">${this.name}</h2>
          <button id="add-contact" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            <i class="fas fa-plus mr-2"></i>Add Contact
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Contact</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${contactsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderContactForm(contact = null) {
    this.currentContact = contact;
    const isEdit = !!contact;
    
    document.getElementById('module-content').innerHTML = `
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-2xl font-bold mb-6">${isEdit ? 'Edit' : 'Add'} Contact</h2>
        
        <form id="contact-form" class="space-y-6">
          <input type="hidden" id="contact-id" value="${isEdit ? contact.id : ''}">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" id="name" name="name" required 
                value="${isEdit ? contact.name : ''}"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
            
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="email" name="email" 
                value="${isEdit ? contact.email : ''}"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
              <input type="tel" id="phone" name="phone" 
                value="${isEdit ? contact.phone : ''}"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
            
            <div>
              <label for="company" class="block text-sm font-medium text-gray-700">Company</label>
              <input type="text" id="company" name="company" 
                value="${isEdit ? contact.company : ''}"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
          </div>
          
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
            <select id="status" name="status" required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value="lead" ${isEdit && contact.status === 'lead' ? 'selected' : ''}>Lead</option>
              <option value="prospect" ${isEdit && contact.status === 'prospect' ? 'selected' : ''}>Prospect</option>
              <option value="customer" ${isEdit && contact.status === 'customer' ? 'selected' : ''}>Customer</option>
            </select>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button type="button" id="cancel-form" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Cancel
            </button>
            <button type="submit" class="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              ${isEdit ? 'Update' : 'Save'} Contact
            </button>
          </div>
        </form>
      </div>
    `;
  }

  setupEventListeners() {
    // Add contact button
    document.getElementById('add-contact')?.addEventListener('click', () => {
      this.currentView = 'form';
      this.renderContactForm();
    });

    // Edit buttons
    document.querySelectorAll('.edit-contact').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const contactId = e.target.closest('tr').dataset.contactId;
        const contact = this.contacts.find(c => c.id === contactId);
        this.currentView = 'form';
        this.renderContactForm(contact);
      });
    });

    // Delete buttons
    document.querySelectorAll('.delete-contact').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const contactId = e.target.closest('tr').dataset.contactId;
        if (confirm('Are you sure you want to delete this contact?')) {
          await db.collection('contacts').doc(contactId).delete();
          await this.loadContacts();
        }
      });
    });

    // Cancel form
    document.getElementById('cancel-form')?.addEventListener('click', () => {
      this.currentView = 'list';
      this.renderContactsList();
    });

    // Submit form
    document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        company: document.getElementById('company').value,
        status: document.getElementById('status').value,
        lastContact: new Date()
      };

      try {
        if (this.currentContact) {
          // Update existing contact
          await db.collection('contacts').doc(this.currentContact.id).update(formData);
        } else {
          // Add new contact
          await db.collection('contacts').add(formData);
        }
        
        this.currentView = 'list';
        await this.loadContacts();
      } catch (error) {
        console.error('Error saving contact:', error);
        alert('Error saving contact');
      }
    });
  }

  render() {
    if (this.currentView === 'form') {
      return this.renderContactForm();
    } else {
      return this.renderContactsList();
    }
  }
}