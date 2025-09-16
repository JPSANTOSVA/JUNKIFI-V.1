
class AuthManager {
  static auth = null;
  static db = null;
  static isInitialized = false;

  static init() {
    if (this.isInitialized) return;
    
    // Firebase config
    const firebaseConfig = {
      apiKey: "AIzaSyDZHK5TEyMVdpQ2FNR1NY-9lpud5z8v2bc",
      authDomain: "junkifi-products.firebaseapp.com",
      projectId: "junkifi-products",
      storageBucket: "junkifi-products.firebasestorage.app",
      messagingSenderId: "191420309176",
      appId: "1:191420309176:web:20503f2a23140312de9e4d",
      measurementId: "G-L9XB09VTLJ"
    };

    // Initialize Firebase if not already initialized
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    
    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.isInitialized = true;
    
    console.log("Firebase initialized successfully");
    
    // Set up auth state listener
    this.setupAuthStateListener();
  }

  static setupAuthStateListener() {
    if (!this.auth) return;
    
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userId', user.uid);
        this.updateUI(true, user.email);
      } else {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        this.updateUI(false);
      }
    }, (error) => {
      console.error("Auth state error:", error);
    });
  }

static checkAuthState() {
  return new Promise((resolve) => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        document.getElementById("sign-in-btn").style.display = "none";
        document.getElementById("user-container").style.display = "flex";
        document.getElementById("user-email").textContent = user.email;

        // Show nav links
        updateBrowseLinkVisibility(true);
        updateCheckOfferLinkVisibility(true);
        updateSellLinkVisibility(true);
        updateDashboardLinkVisibility(true);

        resolve(true);
      } else {
        document.getElementById("sign-in-btn").style.display = "block";
        document.getElementById("user-container").style.display = "none";

        // Hide nav links
        updateBrowseLinkVisibility(false);
        updateCheckOfferLinkVisibility(false);
        updateSellLinkVisibility(false);
        updateDashboardLinkVisibility(false);

        resolve(false);
      }
    });
  });
}


  
  static async logout() {
    try {
        await this.auth.signOut();
        console.log("User signed out successfully");
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        this.updateUI(false);
        
        // Redirect to home page after logout
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Sign out error:", error);
    }
  }

  static updateUI(isLoggedIn, email = '') {
  const signInBtn = document.getElementById('sign-in-btn');
  const signUpBtn = document.getElementById('sign-up-btn');
  const userContainer = document.getElementById('user-container');
  const userEmailSpan = document.getElementById('user-email');
  const sellLink = document.getElementById('sell-link');
  const dashboardLink = document.getElementById('dashboard-link');
  const browseLink = document.getElementById('browse-link'); // NEW

   // Update sell link visibility
  if (typeof updateSellLinkVisibility === 'function') {
    updateSellLinkVisibility(isLoggedIn);
  }
  
  // Update dashboard link visibility
  if (typeof updateDashboardLinkVisibility === 'function') {
    updateDashboardLinkVisibility(isLoggedIn);
  }
  
  // Update check offer link visibility
  if (typeof updateCheckOfferLinkVisibility === 'function') {
    updateCheckOfferLinkVisibility(isLoggedIn);
  }
  
  // NEW: Update browse link visibility
  if (typeof updateBrowseLinkVisibility === 'function') {
    updateBrowseLinkVisibility(isLoggedIn);
  }

    if (signInBtn && signUpBtn && userContainer && userEmailSpan) {
      if (isLoggedIn) {
        signInBtn.style.display = 'none';
        signUpBtn.style.display = 'none';
        userContainer.style.display = 'flex';
        userEmailSpan.textContent = email ? email.split('@')[0] : 'User';
        
        if (sellLink) {
          sellLink.style.display = 'block';
        }
        
        if (dashboardLink) {
          dashboardLink.style.display = 'block';
        }
      } else {
        signInBtn.style.display = 'block';
        signUpBtn.style.display = 'block';
        userContainer.style.display = 'none';
        userEmailSpan.textContent = '';
        
        if (sellLink) {
          sellLink.style.display = 'none';
        }
        
        if (dashboardLink) {
          dashboardLink.style.display = 'none';
        }
      }
    }
    
    // Setup dropdown events after UI update
    this.setupDropdownEvents();
  }
  
  static setupDropdownEvents() {
    const userContainer = document.getElementById('user-container');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutContainer = document.getElementById('logout-container');
    
    if (userContainer) {
      // Remove any existing event listeners first
      userContainer.onclick = null;
      userContainer.addEventListener('click', function(e) {
        e.stopPropagation();
        if (logoutContainer) {
          logoutContainer.style.display = 
            logoutContainer.style.display === 'block' ? 'none' : 'block';
        }
      });
    }
    
    if (logoutBtn) {
      logoutBtn.onclick = null;
      logoutBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        AuthManager.logout();
      });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      const userContainer = document.getElementById('user-container');
      const logoutContainer = document.getElementById('logout-container');
      
      if (logoutContainer && userContainer && !userContainer.contains(e.target)) {
        logoutContainer.style.display = 'none';
      }
    });
  }

  static requireAuth(redirectUrl = 'signin.html') {
    return this.checkAuthState().then((isAuthenticated) => {
      if (!isAuthenticated) {
        window.location.href = redirectUrl + '?redirect=' + encodeURIComponent(window.location.pathname);
        return false;
      }
      return true;
    }).catch(error => {
      console.error("Auth check failed:", error);
      window.location.href = redirectUrl;
      return false;
    });
  }
}

// Make it globally available
window.AuthManager = AuthManager;

// Auto-initialize when script loads
AuthManager.init();

// Auto-check auth state when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  AuthManager.checkAuthState();
});