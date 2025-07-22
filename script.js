// Enhanced BackpackrGo JavaScript
// Modern ES6+ features and improved functionality

// Configuration and constants
const CONFIG = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 300,
  INTERSECTION_THRESHOLD: 0.1,
  SEARCH_MIN_LENGTH: 2
};

// Utility functions
const utils = {
  // Debounce function for performance optimization
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Smooth scroll with offset for fixed header
  smoothScrollTo(target, offset = 80) {
    const element = document.querySelector(target);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  },

  // Animation observer for scroll-triggered animations
  createAnimationObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: CONFIG.INTERSECTION_THRESHOLD,
      rootMargin: '0px 0px -50px 0px'
    });

    return observer;
  },

  // Local storage helpers
  storage: {
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn('Failed to save to localStorage:', e);
      }
    },
    
    get(key) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        console.warn('Failed to read from localStorage:', e);
        return null;
      }
    }
  }
};

// Enhanced destination data with more detailed information
const destinationData = {
  "Sundarbans": {
    category: ["nature", "adventure"],
    difficulty: "medium",
    bestTime: "November to February",
    activities: [
      "Boat safari through mangrove forests",
      "Royal Bengal Tiger spotting",
      "Bird watching (250+ species)",
      "Visit Karamjal Wildlife Center",
      "Explore Hiron Point",
      "Sunset viewing from the boat",
      "Mangrove forest walking",
      "Wildlife photography"
    ],
    food: ["Fresh fish curry", "Prawn malai curry", "Local river fish", "Traditional Bengali thali", "Hilsa fish", "Crab curry"],
    transport: "Launch from Dhaka to Mongla (10-12 hours), then speedboat",
    tips: [
      "Book forest permits in advance",
      "Carry mosquito repellent",
      "Respect wildlife and maintain silence",
      "Stay quiet during tiger spotting",
      "Bring binoculars for bird watching",
      "Pack light and waterproof bags"
    ],
    budget: {
      low: "৳4,000-6,000",
      medium: "৳6,000-10,000", 
      high: "৳10,000-15,000"
    }
  },
  "Cox's Bazar": {
    category: ["beach", "adventure"],
    difficulty: "easy",
    bestTime: "November to March",
    activities: [
      "Beach walking and swimming",
      "Sunset photography",
      "Inani Beach visit",
      "Himchari National Park",
      "Buddhist temples tour",
      "Water sports and parasailing",
      "Beach volleyball",
      "Surfing lessons"
    ],
    food: ["Fresh seafood", "Shutki bhorta", "Coconut water", "Tribal cuisine", "Beach BBQ", "Grilled fish", "Sea salt ice cream"],
    transport: "Flight (1.5 hours) or bus (10-12 hours) from Dhaka",
    tips: [
      "Best time: November to March",
      "Book hotels early in season",
      "Try local seafood",
      "Respect local culture",
      "Use sunscreen regularly",
      "Stay hydrated"
    ],
    budget: {
      low: "৳3,000-5,000",
      medium: "৳5,000-8,000",
      high: "৳8,000-12,000"
    }
  },
  "Sylhet": {
    category: ["nature", "heritage"],
    difficulty: "easy",
    bestTime: "October to March",
    activities: [
      "Tea garden tours",
      "Ratargul Swamp Forest",
      "Jaflong stone collection",
      "Bichnakandi boat ride",
      "Shah Jalal Mazar visit",
      "Hazrat Shah Paran Mazar",
      "Lalakhal river cruise",
      "Tamabil border visit"
    ],
    food: ["Seven-layer tea", "Sylheti pitha", "Shutki dishes", "River fish", "Local sweets", "Paan", "Special rice dishes"],
    transport: "Train (6-8 hours) or flight (1 hour) from Dhaka",
    tips: [
      "Monsoon season offers best views",
      "Carry rain gear",
      "Book boat rides early",
      "Try authentic tea",
      "Respect religious sites",
      "Learn basic local phrases"
    ],
    budget: {
      low: "৳2,500-4,000",
      medium: "৳4,000-7,000",
      high: "৳7,000-10,000"
    }
  },
  "Dhaka": {
    category: ["heritage", "urban"],
    difficulty: "easy",
    bestTime: "November to February",
    activities: [
      "Old Dhaka exploration",
      "Lalbagh Fort visit",
      "Ahsan Manzil tour",
      "National Museum",
      "Sadarghat boat terminal",
      "Star Mosque visit",
      "Shakhari Bazaar shopping",
      "Dhakeshwari Temple"
    ],
    food: ["Puran Dhaka biryani", "Kacchi biriyani", "Bakarkhani", "Fuchka", "Chotpoti", "Haleem", "Kebabs"],
    transport: "Walking, rickshaw, CNG, bus, or ride-sharing within city",
    tips: [
      "Avoid rush hours",
      "Bargain for rickshaw fares",
      "Try street food carefully",
      "Carry cash",
      "Use ride-sharing apps",
      "Stay alert in crowded areas"
    ],
    budget: {
      low: "৳1,500-3,000",
      medium: "৳3,000-5,000",
      high: "৳5,000-8,000"
    }
  }
};

// Search functionality
const searchEngine = {
  data: [],
  
  init() {
    this.buildSearchIndex();
    this.setupSearchListeners();
  },

  buildSearchIndex() {
    // Build searchable data from destinations
    Object.entries(destinationData).forEach(([name, data]) => {
      this.data.push({
        type: 'destination',
        name: name,
        keywords: [name, ...data.activities, ...data.food, ...data.tips].join(' ').toLowerCase(),
        data: data
      });
    });
  },

  search(query) {
    if (query.length < CONFIG.SEARCH_MIN_LENGTH) return [];
    
    const searchTerm = query.toLowerCase();
    return this.data.filter(item => 
      item.keywords.includes(searchTerm) || 
      item.name.toLowerCase().includes(searchTerm)
    ).slice(0, 5); // Limit results
  },

  setupSearchListeners() {
    const searchToggle = document.querySelector('.search-toggle');
    const searchOverlay = document.getElementById('search-overlay');
    const searchInput = document.getElementById('search-input');
    const searchClose = document.querySelector('.search-close');
    const searchResults = document.getElementById('search-results');

    if (searchToggle && searchOverlay) {
      searchToggle.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        searchInput.focus();
      });

      searchClose.addEventListener('click', () => {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        searchResults.innerHTML = '';
      });

      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
          searchOverlay.classList.remove('active');
        }
      });

      // Search input handler with debounce
      const debouncedSearch = utils.debounce(async (query) => {
        const results = this.search(query);
        this.displayResults(results, searchResults);
        
        // Save search analytics to Firebase
        if (query.length >= CONFIG.SEARCH_MIN_LENGTH && window.firebaseDB) {
          try {
            await window.firebaseDB.saveSearchAnalytics(query, results);
          } catch (error) {
            console.warn('Failed to save search analytics:', error);
          }
        }
      }, CONFIG.DEBOUNCE_DELAY);

      searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
      });
    }
  },

  displayResults(results, container) {
    if (results.length === 0) {
      container.innerHTML = '<div class="search-no-results">No results found</div>';
      return;
    }

    const html = results.map(result => `
      <div class="search-result-item" data-destination="${result.name}">
        <h4>${result.name}</h4>
        <p>${result.data.activities.slice(0, 2).join(', ')}...</p>
        <span class="result-type">${result.type}</span>
      </div>
    `).join('');

    container.innerHTML = html;

    // Add click handlers
    container.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const destination = item.dataset.destination;
        utils.smoothScrollTo('#destinations');
        document.getElementById('search-overlay').classList.remove('active');
        // Highlight the destination card
        this.highlightDestination(destination);
      });
    });
  },

  highlightDestination(destinationName) {
    // Find and highlight the destination card
    setTimeout(() => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        const title = card.querySelector('h3');
        if (title && title.textContent.includes(destinationName)) {
          card.style.transform = 'scale(1.05)';
          card.style.boxShadow = '0 20px 40px rgba(0, 105, 92, 0.3)';
          card.style.border = '2px solid var(--accent-primary)';
          
          setTimeout(() => {
            card.style.transform = '';
            card.style.boxShadow = '';
            card.style.border = '';
          }, 2000);
        }
      });
    }, 500);
  }
};

// Enhanced navigation and scroll effects
const navigation = {
  init() {
    this.setupScrollEffects();
    this.setupActiveNavigation();
    this.setupMobileMenu();
    this.setupSmoothScrolling();
  },

  setupScrollEffects() {
    const header = document.querySelector('header');
    const hero = document.querySelector('#hero');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', utils.debounce(() => {
      const currentScrollY = window.scrollY;
      
      // Header scroll effects
      if (currentScrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Header hide/show on scroll
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        header.style.transform = 'translateY(-100%)';
      } else {
        header.style.transform = 'translateY(0)';
      }

      lastScrollY = currentScrollY;
    }, 10));
  },

  setupActiveNavigation() {
    const navLinks = document.querySelectorAll('nav a[data-section]');
    const sections = document.querySelectorAll('section[id]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const navLink = document.querySelector(`nav a[data-section="${entry.target.id}"]`);
        
        if (entry.isIntersecting && navLink) {
          // Remove active class from all links
          navLinks.forEach(link => link.classList.remove('active'));
          // Add active class to current section link
          navLink.classList.add('active');
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '-80px 0px -50% 0px'
    });

    sections.forEach(section => observer.observe(section));
  },

  setupMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-list');

    if (mobileToggle && navList) {
      mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navList.classList.toggle('mobile-active');
        
        // Update ARIA attributes
        const isExpanded = mobileToggle.classList.contains('active');
        mobileToggle.setAttribute('aria-expanded', isExpanded);
      });

      // Close mobile menu on link click
      navList.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
          mobileToggle.classList.remove('active');
          navList.classList.remove('mobile-active');
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  },

  setupSmoothScrolling() {
    // Enhanced smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        if (target !== '#') {
          utils.smoothScrollTo(target);
        }
      });
    });

    // Watch Guide button scroll to destinations
    const watchGuideBtn = document.getElementById('watch-guide-btn');
    if (watchGuideBtn) {
      watchGuideBtn.addEventListener('click', () => {
        utils.smoothScrollTo('#destinations');
      });
    }
  }
};

// Filter functionality for destinations
const filterSystem = {
  init() {
    this.setupFilterButtons();
  },

  setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.card[data-category]');

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Update active button
        filterButtons.forEach(btn => {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');

        // Filter cards
        const filter = button.dataset.filter;
        this.filterCards(cards, filter);
      });
    });
  },

  filterCards(cards, filter) {
    cards.forEach(card => {
      const categories = card.dataset.category ? card.dataset.category.split(' ') : [];
      const shouldShow = filter === 'all' || categories.includes(filter);

      if (shouldShow) {
        card.style.display = 'block';
        card.style.animation = 'fadeInUp 0.5s ease forwards';
      } else {
        card.style.display = 'none';
      }
    });
  }
};

// Interactive card features
const cardInteractions = {
  init() {
    this.setupFavorites();
    this.setupCardActions();
    this.setupCardAnimations();
  },

  setupFavorites() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    const favorites = utils.storage.get('favorites') || [];

    // Initialize favorite states
    favoriteButtons.forEach(btn => {
      const cardTitle = btn.closest('.card').querySelector('h3').textContent;
      if (favorites.includes(cardTitle)) {
        btn.classList.add('active');
        btn.querySelector('.heart-icon').textContent = '♥';
      }
    });

    favoriteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.card');
        const cardTitle = card.querySelector('h3').textContent;
        const heartIcon = btn.querySelector('.heart-icon');
        
        btn.classList.toggle('active');
        const isFavorite = btn.classList.contains('active');
        
        heartIcon.textContent = isFavorite ? '♥' : '♡';
        
        // Update favorites in storage
        let favorites = utils.storage.get('favorites') || [];
        if (isFavorite) {
          favorites.push(cardTitle);
        } else {
          favorites = favorites.filter(fav => fav !== cardTitle);
        }
        utils.storage.set('favorites', favorites);

        // Visual feedback
        btn.style.transform = 'scale(1.2)';
        setTimeout(() => {
          btn.style.transform = '';
        }, 200);
      });
    });
  },

  setupCardActions() {
    // Learn More buttons
    document.querySelectorAll('.learn-more-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const destination = btn.dataset.destination;
        
        // Save interaction to Firebase
        if (window.firebaseDB) {
          try {
            await window.firebaseDB.saveDestinationInteraction(destination, 'learn_more');
          } catch (error) {
            console.warn('Failed to save interaction:', error);
          }
        }
        
        this.showDestinationDetails(destination);
      });
    });

    // Add to Plan buttons
    document.querySelectorAll('.add-to-plan-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const destination = btn.dataset.destination;
        
        // Save interaction to Firebase
        if (window.firebaseDB) {
          try {
            await window.firebaseDB.saveDestinationInteraction(destination, 'add_to_plan');
          } catch (error) {
            console.warn('Failed to save interaction:', error);
          }
        }
        
        this.addToPlan(destination);
      });
    });

    // Favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const card = btn.closest('.card');
        const destination = card.querySelector('h3').textContent.replace(/[^\w\s]/gi, '').trim();
        
        // Toggle favorite state
        const isFavorite = btn.classList.toggle('active');
        const heartIcon = btn.querySelector('.heart-icon');
        heartIcon.textContent = isFavorite ? '♥' : '♡';
        
        // Save to Firebase if adding to favorites
        if (isFavorite && window.firebaseDB) {
          try {
            await window.firebaseDB.saveFavorite(destination);
            this.showNotification(`${destination} added to favorites!`);
          } catch (error) {
            console.warn('Failed to save favorite:', error);
            this.showNotification(`${destination} added to local favorites!`);
          }
        } else if (isFavorite) {
          this.showNotification(`${destination} added to local favorites!`);
        }
        
        // Update local storage as backup
        let favorites = utils.storage.get('favorites') || [];
        if (isFavorite && !favorites.includes(destination)) {
          favorites.push(destination);
        } else if (!isFavorite) {
          favorites = favorites.filter(fav => fav !== destination);
        }
        utils.storage.set('favorites', favorites);
      });
    });
  },

  setupCardAnimations() {
    const observer = utils.createAnimationObserver();
    document.querySelectorAll('.card').forEach(card => {
      observer.observe(card);
    });
  },

  showDestinationDetails(destination) {
    // Create modal or expand card with destination details
    const data = destinationData[destination];
    if (!data) return;

    // For now, show an alert with basic info
    // In a full implementation, this would open a modal
    alert(`${destination}\n\nBest Time: ${data.bestTime}\nDifficulty: ${data.difficulty}\n\nActivities: ${data.activities.slice(0, 3).join(', ')}...`);
  },

  async addToPlan(destination) {
    let plans = utils.storage.get('travelPlan') || [];
    if (!plans.includes(destination)) {
      plans.push(destination);
      utils.storage.set('travelPlan', plans);
      
      // Save to Firebase
      if (window.firebaseDB) {
        try {
          const tripData = {
            destinations: plans,
            lastUpdated: new Date(),
            totalDestinations: plans.length
          };
          await window.firebaseDB.saveTripPlan(tripData);
          this.showNotification(`${destination} added to your travel plan!`);
        } catch (error) {
          console.warn('Failed to save to Firebase:', error);
          this.showNotification(`${destination} added to local travel plan!`);
        }
      } else {
        this.showNotification(`${destination} added to local travel plan!`);
      }
    } else {
      this.showNotification(`${destination} is already in your travel plan.`);
    }
  },

  showNotification(message) {
    // Create and show notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: var(--accent-primary);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after delay
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
};

// Enhanced theme management
const themeManager = {
  init() {
    this.loadSavedTheme();
    this.setupThemeToggle();
    this.watchSystemTheme();
  },

  loadSavedTheme() {
    const savedTheme = utils.storage.get('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = savedTheme || systemTheme;
    
    this.setTheme(theme);
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    utils.storage.set('theme', theme);
    
    // Update toggle button state
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
  },

  setupThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Add transition class for smooth theme change
        document.documentElement.classList.add('theme-transition');
        this.setTheme(newTheme);
        
        // Remove transition class after animation
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transition');
        }, 300);

        // Visual feedback
        toggle.style.transform = 'scale(1.1) rotate(180deg)';
        setTimeout(() => {
          toggle.style.transform = '';
        }, 300);
      });
    }
  },

  watchSystemTheme() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!utils.storage.get('theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
};

// Loading screen management
const loadingManager = {
  init() {
    this.hideLoadingScreen();
    this.setupPageVisibility();
  },

  hideLoadingScreen() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
          loadingScreen.classList.add('hidden');
          
          // Remove from DOM after animation
          setTimeout(() => {
            loadingScreen.remove();
          }, 300);
        }
      }, 500); // Minimum loading time for smooth experience
    });
  },

  setupPageVisibility() {
    // Handle page visibility changes for performance
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Pause animations when tab is not visible
        document.body.classList.add('page-hidden');
      } else {
        document.body.classList.remove('page-hidden');
      }
    });
  }
};

// Performance and accessibility enhancements
const performanceManager = {
  init() {
    this.setupLazyLoading();
    this.setupKeyboardNavigation();
    this.setupReducedMotion();
  },

  setupLazyLoading() {
    // Native lazy loading for images
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    // Fallback for browsers that don't support native lazy loading
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => {
        if (img.dataset.src) {
          imageObserver.observe(img);
        }
      });
    }
  },

  setupKeyboardNavigation() {
    // Enhanced keyboard navigation
    document.addEventListener('keydown', (e) => {
      // Tab trap in search overlay
      if (document.getElementById('search-overlay').classList.contains('active')) {
        const focusableElements = document.querySelectorAll('#search-overlay input, #search-overlay button');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }

      // Quick navigation shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            document.querySelector('.search-toggle').click();
            break;
          case '/':
            e.preventDefault();
            document.querySelector('.search-toggle').click();
            break;
        }
      }
    });
  },

  setupReducedMotion() {
    // Respect user's motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('reduced-motion');
    }
  }
};

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all managers and systems
  loadingManager.init();
  themeManager.init();
  navigation.init();
  searchEngine.init();
  filterSystem.init();
  cardInteractions.init();
  performanceManager.init();

  // Legacy trip planner support (keeping existing functionality)
  const tripForm = document.getElementById("trip-form");
  if (tripForm) {
    tripForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const location = document.getElementById("location").value;
      const days = parseInt(document.getElementById("days").value);
      const budget = document.getElementById("budget") ? document.getElementById("budget").value : "medium";
      const itineraryDiv = document.getElementById("itinerary");

      if (!location) {
        itineraryDiv.innerHTML = "<p style='color: #e74c3c;'>Please select a destination.</p>";
        return;
      }

      if (!days || days < 1 || days > 15) {
        itineraryDiv.innerHTML = "<p style='color: #e74c3c;'>Please enter a valid number of days (1-15).</p>";
        return;
      }

      generateItinerary(location, days, budget, itineraryDiv);
    });
  }
});

function generateItinerary(location, days, budget, container) {
  const data = destinationData[location];
  
  if (!data) {
    container.innerHTML = "<p>Sorry, we don't have detailed information for this destination yet.</p>";
    return;
  }

  let itinerary = `
    <div class="itinerary-result">
      <h3>🗺️ Your ${days}-Day Adventure in ${location}</h3>
      
      <div class="journey-pathway">
        <div class="pathway-header">
          <h4>🛤️ Your Journey Route</h4>
          <p>Follow this step-by-step pathway for the perfect experience</p>
        </div>
        
        <div class="pathway-timeline">
          <div class="pathway-point start-point">
            <div class="point-marker">🏠</div>
            <div class="point-content">
              <h5>Journey Starts</h5>
              <p>Departure from Dhaka</p>
            </div>
          </div>
          
          <div class="pathway-connector"></div>
          
          <div class="pathway-point transport-point">
            <div class="point-marker">🚗</div>
            <div class="point-content">
              <h5>Transportation</h5>
              <p>${data.transport}</p>
            </div>
          </div>
          
          <div class="pathway-connector"></div>
          
          <div class="pathway-point arrival-point">
            <div class="point-marker">📍</div>
            <div class="point-content">
              <h5>Arrival at ${location}</h5>
              <p>Your adventure begins!</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="itinerary-section">
        <h4>📅 Daily Itinerary</h4>
        <div class="daily-plans-pathway">
  `;

  // Generate day-by-day itinerary with pathway theme
  for (let i = 1; i <= days; i++) {
    const activitiesForDay = getActivitiesForDay(data.activities, i, days);
    const isLastDay = i === days;
    
    itinerary += `
      <div class="day-plan-pathway">
        <div class="day-timeline">
          <div class="day-marker">
            <span class="day-number">${i}</span>
          </div>
          ${!isLastDay ? '<div class="day-connector"></div>' : ''}
        </div>
        
        <div class="day-content">
          <h5>Day ${i} - ${getDayTheme(i, days, location)}</h5>
          <div class="activity-points">
    `;
    
    activitiesForDay.forEach((activity, index) => {
      const timeSlot = getTimeSlot(index, activitiesForDay.length);
      itinerary += `
        <div class="activity-point">
          <div class="activity-time">${timeSlot}</div>
          <div class="activity-description">
            <span class="activity-icon">${getActivityIcon(activity)}</span>
            ${activity}
          </div>
        </div>
      `;
    });
    
    itinerary += `
          </div>
        </div>
      </div>
    `;
  }

  // Add return journey
  itinerary += `
    <div class="day-plan-pathway return-journey">
      <div class="day-timeline">
        <div class="day-marker return-marker">
          <span class="day-number">🏠</span>
        </div>
      </div>
      
      <div class="day-content">
        <h5>Return Journey</h5>
        <div class="activity-points">
          <div class="activity-point">
            <div class="activity-time">Morning</div>
            <div class="activity-description">
              <span class="activity-icon">📦</span>
              Pack memories and souvenirs
            </div>
          </div>
          <div class="activity-point">
            <div class="activity-time">Departure</div>
            <div class="activity-description">
              <span class="activity-icon">🚗</span>
              Return journey to Dhaka
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  itinerary += `
        </div>
      </div>
      
      <div class="itinerary-section">
        <h4>🍽️ Must-Try Foods</h4>
        <div class="food-pathway">
          ${data.food.map((food, index) => `
            <div class="food-stop">
              <div class="food-marker">${index + 1}</div>
              <span class="food-name">${food}</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="itinerary-section">
        <h4>💡 Travel Tips</h4>
        <div class="tips-pathway">
          ${data.tips.map((tip, index) => `
            <div class="tip-checkpoint">
              <div class="tip-icon">✓</div>
              <span class="tip-text">${tip}</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="budget-estimate">
        <h4>💰 Estimated Budget</h4>
        <p>${getBudgetEstimate(location, days, budget)}</p>
        <div class="budget-breakdown">
          <div class="budget-item">
            <span>Transportation:</span>
            <span>${Math.round(getBudgetAmount(location, days, budget) * 0.3).toLocaleString()} BDT</span>
          </div>
          <div class="budget-item">
            <span>Accommodation:</span>
            <span>${Math.round(getBudgetAmount(location, days, budget) * 0.4).toLocaleString()} BDT</span>
          </div>
          <div class="budget-item">
            <span>Food & Activities:</span>
            <span>${Math.round(getBudgetAmount(location, days, budget) * 0.3).toLocaleString()} BDT</span>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = itinerary;
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Helper functions for pathway theme
function getDayTheme(day, totalDays, location) {
  const themes = {
    1: "Arrival & Exploration",
    2: "Main Attractions",
    3: "Cultural Immersion", 
    4: "Adventure Activities",
    5: "Hidden Gems",
    6: "Relaxation & Shopping",
    7: "Final Experiences"
  };
  
  if (day === 1) return "Arrival & Exploration";
  if (day === totalDays && totalDays > 1) return "Final Experiences & Departure Prep";
  
  const themeKeys = Object.keys(themes);
  const themeIndex = ((day - 1) % (themeKeys.length - 1)) + 2;
  return themes[themeIndex] || "Exploration Day";
}

function getTimeSlot(index, total) {
  const times = ["Morning", "Late Morning", "Afternoon", "Evening", "Night"];
  return times[index] || times[index % times.length];
}

function getActivityIcon(activity) {
  const icons = {
    "boat": "🚤", "safari": "🐅", "bird": "🦅", "sunset": "🌅",
    "beach": "🏖️", "swimming": "🏊", "temple": "🏛️", "photography": "📸",
    "tea": "🍃", "forest": "🌲", "museum": "🏛️", "fort": "🏰",
    "food": "🍽️", "market": "🛒", "walk": "🚶", "boat": "⛵"
  };
  
  for (let key in icons) {
    if (activity.toLowerCase().includes(key)) {
      return icons[key];
    }
  }
  return "📌";
}

function getBudgetAmount(location, days, budget) {
  const baseCosts = {
    "Sundarbans": { budget: 3000, "mid-range": 5000, luxury: 8000 },
    "Cox's Bazar": { budget: 2500, "mid-range": 4000, luxury: 7000 },
    "Sylhet": { budget: 2000, "mid-range": 3500, luxury: 6000 },
    "Dhaka": { budget: 1500, "mid-range": 2500, luxury: 4500 }
  };
  
  const cost = baseCosts[location] || { budget: 2000, "mid-range": 3500, luxury: 6000 };
  const dailyCost = cost[budget] || cost["mid-range"];
  return dailyCost * days;
}

function getActivitiesForDay(activities, day, totalDays) {
  // Distribute activities across days
  const activitiesPerDay = Math.ceil(activities.length / totalDays);
  const startIndex = (day - 1) * activitiesPerDay;
  const endIndex = Math.min(startIndex + activitiesPerDay, activities.length);
  
  let dayActivities = activities.slice(startIndex, endIndex);
  
  // If last day and we have remaining activities, add them
  if (day === totalDays && endIndex < activities.length) {
    dayActivities = dayActivities.concat(activities.slice(endIndex));
  }
  
  return dayActivities;
}

function getBudgetEstimate(location, days, budget) {
  const baseCosts = {
    "Sundarbans": { low: 3000, medium: 5000, high: 8000 },
    "Cox's Bazar": { low: 2500, medium: 4000, high: 7000 },
    "Sylhet": { low: 2000, medium: 3500, high: 6000 },
    "Dhaka": { low: 1500, medium: 2500, high: 4500 }
  };
  
  const cost = baseCosts[location] || { low: 2000, medium: 3500, high: 6000 };
  const dailyCost = cost[budget] || cost.medium;
  const totalCost = dailyCost * days;
  
  return `Approximately ৳${totalCost.toLocaleString()} BDT for ${days} days (${budget} budget)`;
}

// Load preset itinerary function
function loadPresetItinerary(presetId) {
  const preset = presetItineraries[presetId];
  if (!preset) return;
  
  // Fill form with preset values
  const locationSelect = document.getElementById("location");
  const daysInput = document.getElementById("days");
  const budgetSelect = document.getElementById("budget");
  
  if (locationSelect) locationSelect.value = preset.location;
  if (daysInput) daysInput.value = preset.days;
  if (budgetSelect) budgetSelect.value = preset.budget;
  
  // Generate itinerary automatically
  const itineraryDiv = document.getElementById("itinerary");
  if (itineraryDiv) {
    generateItinerary(preset.location, preset.days, preset.budget, itineraryDiv);
    
    // Scroll to results
    itineraryDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Enhanced navbar scroll effects
window.addEventListener('scroll', function() {
  const header = document.querySelector('header');
  const scrollPosition = window.scrollY;
  
  if (scrollPosition > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Smooth scrolling for navigation links
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    
    // Remove active class from all links
    document.querySelectorAll('nav a').forEach(link => {
      link.classList.remove('active');
    });
    
    // Add active class to clicked link
    this.classList.add('active');
    
    // Smooth scroll to target
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const headerHeight = document.querySelector('header').offsetHeight;
      const targetPosition = target.offsetTop - headerHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Highlight active section while scrolling
window.addEventListener('scroll', function() {
  const sections = document.querySelectorAll('section[id]');
  const scrollPos = window.scrollY + 100;
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    
    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
      // Remove active class from all nav links
      document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
      });
      
      // Add active class to current section link
      const activeLink = document.querySelector(`nav a[href="#${sectionId}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }
    }
  });
});

// Add smooth scroll to hero buttons
document.addEventListener('DOMContentLoaded', function() {
  // Watch Guide button functionality
  const watchGuideBtn = document.querySelector('.btn-secondary');
  if (watchGuideBtn) {
    watchGuideBtn.addEventListener('click', function() {
      // Scroll to destinations section
      const destinationsSection = document.getElementById('destinations');
      if (destinationsSection) {
        destinationsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
  
  // Add loading animation to form submission
  const tripForm = document.getElementById("trip-form");
  if (tripForm) {
    const submitBtn = tripForm.querySelector('.generate-btn');
    const originalText = submitBtn ? submitBtn.textContent : '';
    
    tripForm.addEventListener('submit', function() {
      if (submitBtn) {
        submitBtn.textContent = '🔄 Generating...';
        submitBtn.disabled = true;
        
        // Re-enable after a delay
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }, 1500);
      }
    });
  }
  
  // Add intersection observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe sections for fade-in effect
  document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });
});

// Add type effect to hero text
function typeEffect(element, text, speed = 50) {
  let i = 0;
  element.textContent = '';
  
  function typeWriter() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(typeWriter, speed);
    }
  }
  
  typeWriter();
}

// Initialize type effect for hero text
document.addEventListener('DOMContentLoaded', function() {
  const heroTitle = document.querySelector('#hero h2');
  if (heroTitle) {
    const originalText = heroTitle.textContent;
    setTimeout(() => {
      typeEffect(heroTitle, originalText, 80);
    }, 1000);
  }
});

// Reset form functionality
document.addEventListener('DOMContentLoaded', function() {
  const resetBtn = document.querySelector('.reset-btn');
  const tripForm = document.getElementById('trip-form');
  
  if (resetBtn && tripForm) {
    resetBtn.addEventListener('click', function() {
      // Reset form fields
      tripForm.reset();
      
      // Uncheck all interest cards
      document.querySelectorAll('.interest-card input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
      });
      
      // Clear itinerary results
      const itineraryDiv = document.getElementById('itinerary');
      if (itineraryDiv) {
        itineraryDiv.innerHTML = `
          <div class="welcome-message">
            <h3>👋 Welcome to Trip Planner!</h3>
            <p>Fill out the form to generate a personalized itinerary for your Bangladesh adventure.</p>
            <div class="features-preview">
              <div class="feature-item">✅ Day-by-day activities</div>
              <div class="feature-item">✅ Local food recommendations</div>
              <div class="feature-item">✅ Transportation details</div>
              <div class="feature-item">✅ Budget breakdown</div>
            </div>
          </div>
        `;
      }
      
      // Add reset animation
      resetBtn.style.transform = 'scale(0.95)';
      setTimeout(() => {
        resetBtn.style.transform = 'scale(1)';
      }, 150);
    });
  }
  
  // Enhanced form submission with better loading states
  const generateBtn = document.querySelector('.generate-btn');
  if (tripForm && generateBtn) {
    const originalText = generateBtn.innerHTML;
    
    tripForm.addEventListener('submit', function() {
      // Add loading state
      generateBtn.innerHTML = '🔄 Generating Your Journey...';
      generateBtn.classList.add('loading');
      generateBtn.disabled = true;
      
      // Re-enable after processing
      setTimeout(() => {
        generateBtn.innerHTML = originalText;
        generateBtn.classList.remove('loading');
        generateBtn.disabled = false;
      }, 2000);
    });
  }
  
  // Add input validation feedback
  const requiredInputs = document.querySelectorAll('input[required], select[required]');
  requiredInputs.forEach(input => {
    input.addEventListener('blur', function() {
      if (this.value.trim() === '') {
        this.style.borderColor = '#ff6b6b';
        this.style.boxShadow = '0 0 0 3px rgba(255,107,107,0.1)';
      } else {
        this.style.borderColor = '#00695c';
        this.style.boxShadow = '0 0 0 3px rgba(0,105,92,0.1)';
      }
    });
    
    input.addEventListener('input', function() {
      if (this.value.trim() !== '') {
        this.style.borderColor = '#00695c';
        this.style.boxShadow = '0 0 0 3px rgba(0,105,92,0.1)';
      }
    });
  });
  
  // Add interest card click animations
  document.querySelectorAll('.interest-card').forEach(card => {
    card.addEventListener('click', function() {
      const checkbox = this.querySelector('input[type="checkbox"]');
      const cardContent = this.querySelector('.card-content');
      
      // Add click animation
      cardContent.style.transform = 'scale(0.95)';
      setTimeout(() => {
        cardContent.style.transform = checkbox.checked ? 'translateY(-3px)' : 'translateY(0)';
      }, 100);
    });
  });
  
  // Form progress indicator
  const formInputs = document.querySelectorAll('#trip-form input, #trip-form select');
  const stepIndicator = document.querySelector('.step-indicator');
  
  function updateProgress() {
    let filledFields = 0;
    const requiredFields = 2; // location and days are required
    
    if (document.getElementById('location').value) filledFields++;
    if (document.getElementById('days').value) filledFields++;
    
    const progress = Math.round((filledFields / requiredFields) * 100);
    if (stepIndicator) {
      stepIndicator.textContent = `Progress: ${progress}%`;
      if (progress === 100) {
        stepIndicator.style.background = 'linear-gradient(135deg, #27ae60, #219a52)';
        stepIndicator.textContent = '✓ Ready to Generate!';
      } else {
        stepIndicator.style.background = 'linear-gradient(135deg, #00695c, #004d40)';
      }
    }
  }
  
  formInputs.forEach(input => {
    input.addEventListener('change', updateProgress);
    input.addEventListener('input', updateProgress);
  });
  
  // Initial progress check
  updateProgress();
});

// Dark Mode Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  
  // Check for saved theme preference or default to light mode
  const savedTheme = localStorage.getItem('theme') || 'light';
  body.setAttribute('data-theme', savedTheme);
  
  // Update toggle button state
  function updateToggleState(theme) {
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');
    
    if (theme === 'dark') {
      themeToggle.setAttribute('aria-label', 'Switch to light mode');
    } else {
      themeToggle.setAttribute('aria-label', 'Switch to dark mode');
    }
  }
  
  // Initialize toggle state
  updateToggleState(savedTheme);
  
  // Theme toggle event listener
  themeToggle.addEventListener('click', function() {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Add transition effect
    body.style.transition = 'all 0.3s ease';
    
    // Update theme
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update toggle state
    updateToggleState(newTheme);
    
    // Add click animation
    themeToggle.style.transform = 'scale(0.9)';
    setTimeout(() => {
      themeToggle.style.transform = 'scale(1)';
    }, 150);
    
    // Remove transition after theme change
    setTimeout(() => {
      body.style.transition = '';
    }, 300);
  });
  
  // Add keyboard support
  themeToggle.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      themeToggle.click();
    }
  });
});

// Firebase Data Management
const firebaseDataManager = {
  currentUser: null,

  async init() {
    // Wait for Firebase to be available
    if (typeof window.firebaseServices !== 'undefined') {
      this.setupAuthListener();
      await this.loadUserData();
    } else {
      // Retry after a short delay
      setTimeout(() => this.init(), 1000);
    }
  },

  setupAuthListener() {
    if (window.firebaseServices && window.firebaseServices.onAuthStateChanged) {
      window.firebaseServices.onAuthStateChanged(window.firebaseServices.auth, (user) => {
        this.currentUser = user;
        if (user) {
          console.log('User signed in:', user.email);
          this.loadUserData(user.uid);
        } else {
          console.log('User signed out');
          this.currentUser = null;
        }
      });
    }
  },

  async loadUserData(userId = 'guest') {
    try {
      if (window.firebaseDB) {
        // Load user favorites
        const favorites = await window.firebaseDB.getFavorites(userId);
        this.displayFavorites(favorites);

        // Load user trip plans
        const tripPlans = await window.firebaseDB.getTripPlans(userId);
        this.displayTripPlans(tripPlans);

        console.log('User data loaded successfully');
      }
    } catch (error) {
      console.warn('Failed to load user data:', error);
    }
  },

  displayFavorites(favorites) {
    // Update favorite buttons based on saved favorites
    favorites.forEach(favorite => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        const title = card.querySelector('h3').textContent.replace(/[^\w\s]/gi, '').trim();
        if (title === favorite.destination) {
          const favoriteBtn = card.querySelector('.favorite-btn');
          const heartIcon = favoriteBtn.querySelector('.heart-icon');
          favoriteBtn.classList.add('active');
          heartIcon.textContent = '♥';
        }
      });
    });

    // Also update local storage for offline functionality
    const favoriteDestinations = favorites.map(fav => fav.destination);
    utils.storage.set('favorites', favoriteDestinations);
  },

  displayTripPlans(tripPlans) {
    if (tripPlans.length > 0) {
      const latestPlan = tripPlans[tripPlans.length - 1];
      if (latestPlan.destinations) {
        utils.storage.set('travelPlan', latestPlan.destinations);
        console.log('Latest trip plan loaded:', latestPlan.destinations);
      }
    }
  },

  async loadPopularDestinations() {
    try {
      if (window.firebaseDB) {
        const popular = await window.firebaseDB.getPopularDestinations();
        console.log('Popular destinations:', popular);
        // You could use this data to highlight popular destinations
        this.highlightPopularDestinations(popular);
      }
    } catch (error) {
      console.warn('Failed to load popular destinations:', error);
    }
  },

  highlightPopularDestinations(popularDestinations) {
    // Add "Popular" badges to top destinations
    popularDestinations.slice(0, 3).forEach((item, index) => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        const title = card.querySelector('h3').textContent.replace(/[^\w\s]/gi, '').trim();
        if (title === item.destination) {
          const badge = document.createElement('div');
          badge.className = 'popular-badge';
          badge.textContent = index === 0 ? '🔥 Most Popular' : '⭐ Popular';
          badge.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: linear-gradient(45deg, #ff6b35, #f7931e);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: 600;
            z-index: 10;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          `;
          
          const imageContainer = card.querySelector('.card-image-container');
          if (imageContainer && !imageContainer.querySelector('.popular-badge')) {
            imageContainer.style.position = 'relative';
            imageContainer.appendChild(badge);
          }
        }
      });
    });
  }
};

// Initialize Firebase data management when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  firebaseDataManager.init();
  
  // Load popular destinations after a delay to ensure Firebase is ready
  setTimeout(() => {
    firebaseDataManager.loadPopularDestinations();
  }, 2000);
});

