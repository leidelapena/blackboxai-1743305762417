// Authentication Controller
class AuthController {
  constructor() {
    this.initAuthListeners();
    this.setupEventListeners();
    this.setupRegistration();
    this.initUserRoles();
  }

  initAuthListeners() {
    auth.onAuthStateChanged(async user => {
      if (user) {
        // User is signed in
        await this.handleUserSession(user);
        
        if (window.location.pathname === '/login.html' || 
            window.location.pathname === '/register.html') {
          window.location.href = '/';
        }
      } else {
        // User is signed out
        if (window.location.pathname !== '/login.html' && 
            window.location.pathname !== '/register.html') {
          window.location.href = '/login.html';
        }
      }
    });
  }

  async handleUserSession(user) {
    // Update UI with user info
    this.updateUserProfile(user);
    
    // Check email verification
    if (!user.emailVerified) {
      console.warn('Email not verified');
      // Optionally: show reminder to verify email
    }

    // Get user role
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists) {
      window.currentUser = {
        ...userDoc.data(),
        id: user.uid
      };
      this.applyRoleBasedAccess();
    }
  }

  updateUserProfile(user) {
    const userEl = document.getElementById('user-menu');
    if (userEl) {
      const nameEl = userEl.querySelector('span');
      if (nameEl) nameEl.textContent = user.displayName || user.email || 'User';
      
      const avatarEl = userEl.querySelector('div > i');
      if (avatarEl && user.photoURL) {
        avatarEl.parentElement.innerHTML = `
          <img class="h-8 w-8 rounded-full" src="${user.photoURL}" alt="User avatar">
        `;
      }
    }
  }

  applyRoleBasedAccess() {
    // Example: Hide admin features for non-admin users
    if (window.currentUser?.role !== 'admin') {
      document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = 'none';
      });
    }
  }

  setupEventListeners() {
    // Login form
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        await auth.signInWithEmailAndPassword(email, password);
      } catch (error) {
        this.showError(error.message);
      }
    });

    // Social logins
    this.setupSocialLogin('google-login', new firebase.auth.GoogleAuthProvider());
    this.setupSocialLogin('github-login', new firebase.auth.GithubAuthProvider());

    // Forgot password
    document.getElementById('forgot-password')?.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = prompt('Please enter your email address:');
      if (email) {
        try {
          await auth.sendPasswordResetEmail(email);
          alert('Password reset email sent!');
        } catch (error) {
          this.showError(error.message);
        }
      }
    });

    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await auth.signOut();
      } catch (error) {
        this.showError(error.message);
      }
    });
  }

  setupSocialLogin(buttonId, provider) {
    document.getElementById(buttonId)?.addEventListener('click', async () => {
      try {
        const result = await auth.signInWithPopup(provider);
        // Create user doc if first login
        const userDoc = await db.collection('users').doc(result.user.uid).get();
        if (!userDoc.exists) {
          await db.collection('users').doc(result.user.uid).set({
            email: result.user.email,
            createdAt: new Date(),
            role: 'user'
          });
        }
      } catch (error) {
        this.showError(error.message);
      }
    });
  }

  setupRegistration() {
    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      const firstName = document.getElementById('first-name').value;
      const lastName = document.getElementById('last-name').value;
      
      if (password !== confirmPassword) {
        this.showError('Passwords do not match!');
        return;
      }

      try {
        const { user } = await auth.createUserWithEmailAndPassword(email, password);
        await user.updateProfile({
          displayName: `${firstName} ${lastName}`
        });
        
        // Create user document
        await db.collection('users').doc(user.uid).set({
          firstName,
          lastName,
          email,
          createdAt: new Date(),
          role: 'user' // Default role
        });

        // Send email verification
        await user.sendEmailVerification();
        alert('Registration successful! Please check your email for verification.');
        window.location.href = '/login.html';
      } catch (error) {
        this.showError(error.message);
      }
    });
  }

  initUserRoles() {
    // Listen for role changes
    if (auth.currentUser) {
      db.collection('users').doc(auth.currentUser.uid)
        .onSnapshot(doc => {
          if (doc.exists) {
            window.currentUser = doc.data();
            this.applyRoleBasedAccess();
          }
        });
    }
  }

  showError(message) {
    console.error('Auth Error:', message);
    alert(`Error: ${message}`);
  }
}

// Initialize auth controller
if (typeof auth !== 'undefined') {
  new AuthController();
}