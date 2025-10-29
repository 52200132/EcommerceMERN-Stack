// Custom JavaScript for ShopGrids React App

// Initialize sliders and other interactive elements after DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  // Hide preloader
  setTimeout(() => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
      preloader.style.display = 'none';
    }
  }, 1000);

  // Smooth scroll for scroll-top button
  const scrollTop = document.querySelector('.scroll-top');
  if (scrollTop) {
    scrollTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Show/hide scroll top button
    window.addEventListener('scroll', function () {
      if (window.scrollY > 300) {
        scrollTop.style.display = 'block';
      } else {
        scrollTop.style.display = 'none';
      }
    });
  }

  // Mobile menu toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navbarCollapse = document.querySelector('.navbar-collapse');

  if (mobileMenuBtn && navbarCollapse) {
    mobileMenuBtn.addEventListener('click', function () {
      navbarCollapse.classList.toggle('show');
    });
  }

  // Category menu toggle
  const catButton = document.querySelector('.cat-button');
  const subCategory = document.querySelector('.sub-category');

  if (catButton && subCategory) {
    catButton.addEventListener('click', function () {
      subCategory.classList.toggle('show');
    });
  }

  // Shopping cart dropdown
  const cartBtn = document.querySelector('.cart-items .main-btn');
  const shoppingItem = document.querySelector('.shopping-item');

  if (cartBtn && shoppingItem) {
    cartBtn.addEventListener('click', function (e) {
      e.preventDefault();
      shoppingItem.classList.toggle('show');
    });

    // Close cart when clicking outside
    document.addEventListener('click', function (e) {
      if (!cartBtn.contains(e.target) && !shoppingItem.contains(e.target)) {
        shoppingItem.classList.remove('show');
      }
    });
  }

  // Remove cart items
  const removeButtons = document.querySelectorAll('.shopping-item .remove');
  removeButtons.forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      const listItem = this.closest('li');
      if (listItem) {
        listItem.remove();
        // Update cart count and total here
        updateCartCount();
      }
    });
  });
});

// Utility functions
function updateCartCount() {
  const cartItems = document.querySelectorAll('.shopping-item .shopping-list li');
  const countElements = document.querySelectorAll('.total-items');
  const count = cartItems.length;

  countElements.forEach(element => {
    element.textContent = count;
  });

  // Update cart header
  const cartHeader = document.querySelector('.dropdown-cart-header span');
  if (cartHeader) {
    cartHeader.textContent = `${count} Items`;
  }
}

// Search functionality
function handleSearch() {
  const searchInput = document.querySelector('.search-input input');
  const searchBtn = document.querySelector('.search-btn button');

  if (searchBtn) {
    searchBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        // Redirect to search results or handle search
        window.location.href = `/products?search=${encodeURIComponent(query)}`;
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = this.value.trim();
        if (query) {
          window.location.href = `/products?search=${encodeURIComponent(query)}`;
        }
      }
    });
  }
}

// Call search functionality
document.addEventListener('DOMContentLoaded', handleSearch);

// Product quick view functionality
function initQuickView() {
  const quickViewBtns = document.querySelectorAll('.quick-view');
  quickViewBtns.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const productId = this.dataset.productId;
      // Handle quick view modal
      console.log('Quick view for product:', productId);
    });
  });
}

// Wishlist functionality
function initWishlist() {
  const wishlistBtns = document.querySelectorAll('.wishlist-btn');
  wishlistBtns.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      this.classList.toggle('active');
      // Handle wishlist add/remove
      console.log('Wishlist toggled');
    });
  });
}

// Initialize additional functionality
document.addEventListener('DOMContentLoaded', function () {
  initQuickView();
  initWishlist();
});

export { updateCartCount, handleSearch, initQuickView, initWishlist };