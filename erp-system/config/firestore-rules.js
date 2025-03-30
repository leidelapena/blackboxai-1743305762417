// Firestore Security Rules
module.exports = {
  rules: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Company data - admin only
    match /companies/{companyId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // Customers - authenticated users
    match /customers/{customerId} {
      allow read, create: if request.auth != null;
      allow update, delete: if isOwner() || isAdmin();
    }

    // Products - read for all, write for inventory managers
    match /products/{productId} {
      allow read: if request.auth != null;
      allow write: if hasAnyRole(['admin', 'inventory']);
    }

    // Invoices - restricted access
    match /invoices/{invoiceId} {
      allow read: if isOwner() || isAdmin() || isAccountant();
      allow create, update: if isAccountant() || isAdmin();
      allow delete: if isAdmin();
    }

    // Employees - HR and admin only
    match /employees/{employeeId} {
      allow read: if isHR() || isAdmin();
      allow write: if isHR() || isAdmin();
    }

    // Helper functions
    function isAdmin() {
      return request.auth.token.admin == true;
    }
    function isOwner() {
      return request.auth.token.userId == resource.data.ownerId;
    }
    function isHR() {
      return request.auth.token.roles.hasAny(['hr', 'admin']);
    }
    function isAccountant() {
      return request.auth.token.roles.hasAny(['accountant', 'admin']);
    }
    function hasAnyRole(roles) {
      return request.auth.token.roles.hasAny(roles);
    }
  }
}`
};