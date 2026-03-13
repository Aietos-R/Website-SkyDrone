// Customer Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize customer dashboard
    initializeCustomerDashboard();
    
    // Add smooth scrolling
    addSmoothScrolling();
    
    // Add loading states
    addLoadingStates();
    
    // Add interactive animations
    addInteractiveAnimations();
    
    // Add cart functionality
    addCartFunctionality();
    
    // Add notification system
    initializeNotifications();
});

function initializeCustomerDashboard() {
    // Initialize wishlist
    initializeWishlist();
    
    // Initialize search and filter
    initializeSearchAndFilter();
    
    // Add fade-in animation to elements
    const elementsToAnimate = document.querySelectorAll('.card, .stat-card, .hero-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });
    
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
    
    updateCartCount();
    window.addEventListener('cart:update', function(e){
        const d = e.detail || {};
        const cartCountElement = document.querySelector('.navbar .badge');
        if (cartCountElement && typeof d.count !== 'undefined') {
            cartCountElement.textContent = d.count;
            cartCountElement.style.display = d.count > 0 ? 'inline-block' : 'none';
        }
    });
    
    console.log('Customer dashboard initialized');
}

function addSmoothScrolling() {
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function addLoadingStates() {
    // Add loading state to buttons
    const buttons = document.querySelectorAll('.btn:not(.no-loading)');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Only add loading state for form submissions or AJAX calls
            if (this.type === 'submit' || this.classList.contains('ajax-btn')) {
                const originalText = this.innerHTML;
                const originalWidth = this.offsetWidth;
                
                // Set fixed width to prevent layout shift
                this.style.width = originalWidth + 'px';
                
                // Add loading state
                this.innerHTML = '<span class="loading"></span>';
                this.disabled = true;
                
                // Remove loading state after 3 seconds (or when operation completes)
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.disabled = false;
                    this.style.width = '';
                }, 3000);
            }
        });
    });
}

function addInteractiveAnimations() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.card, .stat-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add click effects to buttons
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

function addCartFunctionality() {
    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const form = this.closest('form');
            if (!form) return;
            const fd = new FormData(form);
            const params = new URLSearchParams();
            for (const [k, v] of fd.entries()) params.append(k, v);
            const originalText = this.innerHTML;
            this.innerHTML = '<span class="loading"></span>';
            this.disabled = true;
            try {
                const resp = await fetch('/customer/order/add', {
                    method: 'POST',
                    body: params,
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    credentials: 'same-origin',
                    cache: 'no-store'
                });
                const data = await resp.json();
                if (resp.ok && data.success) {
                    const name = this.dataset.menuName || 'Menu';
                    addToCartAnimation(this, name);
                    const cartBadge = document.querySelector('.navbar .badge');
                    if (cartBadge && data.cartCount !== undefined) {
                        cartBadge.textContent = data.cartCount;
                        cartBadge.style.display = data.cartCount > 0 ? 'inline-block' : 'none';
                    }
                    try { window.dispatchEvent(new CustomEvent('cart:update', { detail: { count: data.cartCount, total: data.total } })); } catch (e) {}
                    showNotification(`${name} ditambahkan ke keranjang!`, 'success');
                    form.reset();
                    const qty = form.querySelector('input[name="quantity"]');
                    if (qty) qty.value = 1;
                } else {
                    showNotification((data && data.message) || 'Gagal menambahkan ke keranjang', 'danger');
                }
            } catch {
                showNotification('Terjadi kesalahan saat menambahkan ke keranjang', 'danger');
            } finally {
                this.innerHTML = originalText;
                this.disabled = false;
            }
        });
    });
    
    
}

function addToCartAnimation(button, itemName) {
    // Create flying animation to cart icon
    const cartIcon = document.querySelector('.navbar .fa-shopping-cart');
    if (!cartIcon) return;
    
    const rect = button.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();
    
    // Create flying cart element with CSS class
    const flyingCart = document.createElement('div');
    flyingCart.className = 'flying-cart';
    flyingCart.innerHTML = '<div class="cart-icon"><i class="fas fa-plus"></i></div>';
    
    // Set initial position
    flyingCart.style.left = rect.left + rect.width / 2 - 20 + 'px';
    flyingCart.style.top = rect.top + rect.height / 2 - 20 + 'px';
    
    document.body.appendChild(flyingCart);
    
    // Animate to cart icon
    setTimeout(() => {
        flyingCart.style.left = cartRect.left + cartRect.width / 2 - 20 + 'px';
        flyingCart.style.top = cartRect.top + cartRect.height / 2 - 20 + 'px';
        flyingCart.classList.add('flying');
    }, 100);
    
    // Remove element and add bounce animation to cart icon
    setTimeout(() => {
        flyingCart.remove();
        
        // Add bounce animation to cart icon
        cartIcon.style.transform = 'scale(1.3)';
        cartIcon.style.transition = 'transform 0.2s ease';
        setTimeout(() => {
            cartIcon.style.transform = 'scale(1)';
        }, 200);
    }, 900);
}

function updateCartCount() {
    // Update cart count in navbar
    const cartCountElement = document.querySelector('.navbar .badge');
    const cartItemNodes = document.querySelectorAll('.cart-item');
    if (!cartCountElement) return;

    // Jika bukan halaman keranjang (tidak ada .cart-item), jangan override angka yang sudah ada
    if (cartItemNodes.length === 0) {
        const current = parseInt(cartCountElement.textContent) || 0;
        cartCountElement.style.display = current > 0 ? 'inline-block' : 'none';
        return;
    }

    let quantitySum = 0;
    cartItemNodes.forEach((item) => {
        const qtyEl = item.querySelector('.cart-item-quantity');
        const qty = qtyEl ? parseInt(qtyEl.textContent) || 0 : 0;
        quantitySum += qty;
    });
    cartCountElement.textContent = quantitySum;
    cartCountElement.style.display = quantitySum > 0 ? 'inline-block' : 'none';
    
    // Add animation when count changes
    cartCountElement.style.transform = 'scale(1.3)';
    setTimeout(() => { cartCountElement.style.transform = 'scale(1)'; }, 200);
}

function updateCartTotal() {
    // Update cart total
    const cartItems = document.querySelectorAll('.cart-item');
    let total = 0;
    
    cartItems.forEach(item => {
        const priceText = item.querySelector('.cart-item-price').textContent;
        const quantityText = item.querySelector('.cart-item-quantity').textContent;
        const price = parseInt(priceText.replace(/[^0-9]/g, ''));
        const quantity = parseInt(quantityText);
        total += price * quantity;
    });
    
    const totalElement = document.querySelector('.cart-total');
    if (totalElement) {
        totalElement.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    }
}

function initializeNotifications() {
    // Create notification container
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 350px;
    `;
    document.body.appendChild(notificationContainer);
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.style.cssText = `
        margin-bottom: 10px;
        border: none;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        animation: slideInRight 0.3s ease-out;
    `;
    
    const icons = {
        success: 'fa-check-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle',
        danger: 'fa-times-circle'
    };
    
    notification.innerHTML = `
        <i class="fas ${icons[type]} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// Add CSS for notifications
const notificationStyles = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search, Filter, and Sorting Functions
function initializeSearchAndFilter() {
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortBy = document.getElementById('sortBy');
    const filterChips = document.querySelectorAll('.chip');
    const viewToggle = document.getElementById('viewToggle');
    
    if (!searchInput) return; // Only run on order page
    
    // Search functionality
    const debouncedSearch = debounce(performSearch, 300);
    searchInput.addEventListener('input', debouncedSearch);
    
    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        clearSearch.style.display = 'none';
        performSearch();
        searchInput.focus();
    });
    
    searchInput.addEventListener('input', () => {
        clearSearch.style.display = searchInput.value ? 'block' : 'none';
    });
    
    // Category filter
    categoryFilter.addEventListener('change', () => {
        performSearch();
        updateActiveChip('all');
    });
    
    // Sort functionality
    sortBy.addEventListener('change', performSearch);
    
    // Filter chips
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('chip-active'));
            chip.classList.add('chip-active');
            performSearch();
        });
    });
    
    // View toggle
    viewToggle.addEventListener('click', () => {
        const currentView = viewToggle.dataset.view;
        const newView = currentView === 'grid' ? 'list' : 'grid';
        viewToggle.dataset.view = newView;
        viewToggle.innerHTML = newView === 'grid' ? '<i class="fas fa-th"></i>' : '<i class="fas fa-list"></i>';
        toggleView(newView);
    });
    
    // Initialize with all menu items
    window.allMenuItems = collectAllMenuItems();
}

function collectAllMenuItems() {
    const items = [];
    const menuCards = document.querySelectorAll('.menu-card');
    
    menuCards.forEach(card => {
        const category = card.closest('.category-section');
        const categoryName = category.querySelector('.category-title').textContent.trim();
        const categoryType = getCategoryType(categoryName);
        
        items.push({
            element: card,
            name: card.querySelector('.menu-title').textContent.toLowerCase(),
            price: parseInt(card.querySelector('.menu-price').textContent.replace(/[^0-9]/g, '')),
            category: categoryType,
            categoryName: categoryName,
            isPromo: card.querySelector('.badge-promo') !== null,
            isNew: card.querySelector('.badge-new') !== null,
            isBestseller: card.querySelector('.badge-bestseller') !== null,
            isVegetarian: card.querySelector('.badge-vegetarian') !== null
        });
    });
    
    return items;
}

function getCategoryType(categoryName) {
    const categoryMap = {
        'ayam': 'ayam',
        'nasi': 'nasi',
        'minuman': 'minuman',
        'side dish': 'side_dish',
        'paket': 'paket'
    };
    
    return categoryMap[categoryName.toLowerCase()] || 'other';
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    const activeChip = document.querySelector('.chip-active').dataset.filter;
    
    showLoadingState();
    
    setTimeout(() => {
        let filteredItems = filterItems(searchTerm, categoryFilter, activeChip);
        let sortedItems = sortItems(filteredItems, sortBy);
        displayResults(sortedItems);
        hideLoadingState();
    }, 300);
}

function filterItems(searchTerm, categoryFilter, activeChip) {
    return window.allMenuItems.filter(item => {
        // Search filter
        const matchesSearch = !searchTerm || 
            item.name.includes(searchTerm) || 
            item.categoryName.toLowerCase().includes(searchTerm);
        
        // Category filter
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        
        // Chip filter
        const matchesChip = activeChip === 'all' ||
            (activeChip === 'promo' && item.isPromo) ||
            (activeChip === 'new' && item.isNew) ||
            (activeChip === 'bestseller' && item.isBestseller) ||
            (activeChip === 'vegetarian' && item.isVegetarian);
        
        return matchesSearch && matchesCategory && matchesChip;
    });
}

function sortItems(items, sortBy) {
    const sorted = [...items];
    
    switch (sortBy) {
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'price_asc':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price_desc':
            return sorted.sort((a, b) => b.price - a.price);
        case 'popular':
            // Sort by bestseller first, then promo, then new
            return sorted.sort((a, b) => {
                if (a.isBestseller && !b.isBestseller) return -1;
                if (!a.isBestseller && b.isBestseller) return 1;
                if (a.isPromo && !b.isPromo) return -1;
                if (!a.isPromo && b.isPromo) return 1;
                if (a.isNew && !b.isNew) return -1;
                if (!a.isNew && b.isNew) return 1;
                return 0;
            });
        default:
            return sorted;
    }
}

function displayResults(items) {
    // Hide all items first
    window.allMenuItems.forEach(item => {
        item.element.style.display = 'none';
    });
    
    // Show filtered items
    items.forEach(item => {
        item.element.style.display = 'block';
        item.element.style.animation = 'fadeInUp 0.6s ease-out';
    });
    
    // Update category sections visibility
    const categories = document.querySelectorAll('.category-section');
    categories.forEach(category => {
        const visibleItems = category.querySelectorAll('.menu-card[style*="display: block"], .menu-card:not([style*="display: none"])');
        category.style.display = visibleItems.length > 0 ? 'block' : 'none';
    });
    
    // Update menu count
    const menuCount = document.getElementById('menuCount');
    const menuTitle = document.getElementById('menuTitle');
    
    if (menuCount) {
        menuCount.textContent = `${items.length} Menu`;
    }
    
    if (menuTitle) {
        const searchTerm = document.getElementById('searchInput').value;
        const activeChip = document.querySelector('.chip-active').dataset.filter;
        
        if (searchTerm) {
            menuTitle.textContent = `Hasil Pencarian: "${searchTerm}"`;
        } else if (activeChip !== 'all') {
            const chipTexts = {
                'promo': 'Menu Promo',
                'new': 'Menu Terbaru',
                'bestseller': 'Best Seller',
                'vegetarian': 'Menu Vegetarian'
            };
            menuTitle.textContent = chipTexts[activeChip] || 'Menu Spesial Hari Ini';
        } else {
            menuTitle.textContent = 'Menu Spesial Hari Ini';
        }
    }
    
    // Show/hide no results state
    const noResults = document.getElementById('noResults');
    if (noResults) {
        noResults.style.display = items.length === 0 ? 'block' : 'none';
    }
}

function toggleView(viewType) {
    const cardColumns = document.querySelectorAll('.category-section .row > div');
    
    if (viewType === 'list') {
        cardColumns.forEach(col => {
            col.classList.remove('col-md-6', 'col-lg-4');
            col.classList.add('col-12');
        });
    } else {
        cardColumns.forEach(col => {
            col.classList.remove('col-12');
            col.classList.add('col-md-6', 'col-lg-4');
        });
    }
}

function updateActiveChip(filter) {
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.classList.toggle('chip-active', chip.dataset.filter === filter);
    });
}

function showLoadingState() {
    const loadingState = document.getElementById('loadingState');
    const menuContainer = document.getElementById('menuContainer');
    
    if (loadingState) {
        loadingState.style.display = 'block';
    }
    
    if (menuContainer) {
        menuContainer.style.opacity = '0.5';
    }
}

function hideLoadingState() {
    const loadingState = document.getElementById('loadingState');
    const menuContainer = document.getElementById('menuContainer');
    
    if (loadingState) {
        loadingState.style.display = 'none';
    }
    
    if (menuContainer) {
        menuContainer.style.opacity = '1';
    }
}

// Initialize search and filter when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeSearchAndFilter);

// Wishlist Functions
function initializeWishlist() {
    // Load wishlist from localStorage
    window.wishlist = JSON.parse(localStorage.getItem('customerWishlist')) || [];
    updateWishlistUI();
}

function toggleWishlist(button) {
    const menuId = button.dataset.menuId;
    const menuName = button.dataset.menuName;
    const icon = button.querySelector('i');
    
    const isInWishlist = window.wishlist.some(item => item.id === menuId);
    
    if (isInWishlist) {
        // Remove from wishlist
        window.wishlist = window.wishlist.filter(item => item.id !== menuId);
        button.classList.remove('btn-danger', 'active');
        button.classList.add('btn-outline-danger');
        icon.classList.remove('fas', 'fa-heart');
        icon.classList.add('far', 'fa-heart');
        
        showNotification(`${menuName} dihapus dari favorit`, 'info');
    } else {
        // Add to wishlist
        window.wishlist.push({
            id: menuId,
            name: menuName,
            addedAt: new Date().toISOString()
        });
        button.classList.remove('btn-outline-danger');
        button.classList.add('btn-danger', 'active');
        icon.classList.remove('far', 'fa-heart');
        icon.classList.add('fas', 'fa-heart');
        
        showNotification(`${menuName} ditambahkan ke favorit`, 'success');
    }
    
    // Save to localStorage
    localStorage.setItem('customerWishlist', JSON.stringify(window.wishlist));
    updateWishlistUI();
}

function updateWishlistUI() {
    // Update all wishlist buttons
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        const menuId = button.dataset.menuId;
        const icon = button.querySelector('i');
        const isInWishlist = window.wishlist.some(item => item.id === menuId);
        
        if (isInWishlist) {
            button.classList.remove('btn-outline-danger');
            button.classList.add('btn-danger', 'active');
            icon.classList.remove('far', 'fa-heart');
            icon.classList.add('fas', 'fa-heart');
        } else {
            button.classList.remove('btn-danger', 'active');
            button.classList.add('btn-outline-danger');
            icon.classList.remove('fas', 'fa-heart');
            icon.classList.add('far', 'fa-heart');
        }
    });
    
    // Update wishlist count in navbar if exists
    const wishlistCount = document.getElementById('wishlist-count');
    if (wishlistCount) {
        wishlistCount.textContent = window.wishlist.length;
    }
}

function getWishlistCount() {
    return window.wishlist ? window.wishlist.length : 0;
}

// Rating Functions
function rateMenu(menuId, rating) {
    // Send rating to server (you'll need to implement this endpoint)
    fetch(`/api/menu/${menuId}/rate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: rating })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateStarRating(menuId, rating);
            showNotification('Terima kasih atas penilaian Anda!', 'success');
        } else {
            showNotification('Gagal memberi penilaian', 'error');
        }
    })
    .catch(error => {
        console.error('Error rating menu:', error);
        // Fallback: update UI locally even if server fails
        updateStarRating(menuId, rating);
        showNotification('Penilaian disimpan secara lokal', 'info');
    });
}

function updateStarRating(menuId, rating) {
    const starRating = document.querySelector(`[data-menu-id="${menuId}"].star-rating`);
    if (!starRating) return;
    
    const stars = starRating.querySelectorAll('i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('text-muted');
            star.classList.add('text-warning');
        } else {
            star.classList.remove('text-warning');
            star.classList.add('text-muted');
        }
    });
    
    // Update rating text
    starRating.dataset.rating = rating;
    
    // Add animation
    starRating.style.transform = 'scale(1.1)';
    setTimeout(() => {
        starRating.style.transform = 'scale(1)';
    }, 200);
}

// Add hover effect for rating stars
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('mouseover', (e) => {
        if (e.target.matches('.star-rating i')) {
            const starRating = e.target.closest('.star-rating');
            const stars = starRating.querySelectorAll('i');
            const hoverValue = parseInt(e.target.dataset.value);
            
            stars.forEach((star, index) => {
                if (index < hoverValue) {
                    star.style.transform = 'scale(1.2)';
                    star.style.cursor = 'pointer';
                }
            });
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        if (e.target.matches('.star-rating i')) {
            const starRating = e.target.closest('.star-rating');
            const stars = starRating.querySelectorAll('i');
            
            stars.forEach(star => {
                star.style.transform = 'scale(1)';
            });
        }
    });
});

// Export functions for use in other scripts
window.CustomerDashboard = {
    showNotification,
    updateCartCount,
    formatCurrency,
    addToCartAnimation,
    debounce,
    initializeSearchAndFilter,
    performSearch
};
// Reserve Form AJAX submit
document.addEventListener('DOMContentLoaded', function(){
    const reserveForm = document.querySelector('form[action="/customer/reserve"]');
    if (reserveForm) {
        reserveForm.addEventListener('submit', async function(e){
            e.preventDefault();
            const btn = reserveForm.querySelector('button[type="submit"]');
            const original = btn ? btn.innerHTML : null;
            if (btn) { btn.innerHTML = '<span class="loading"></span>'; btn.disabled = true; }
            try {
                const fd = new FormData(reserveForm);
                const params = new URLSearchParams();
                for (const [k,v] of fd.entries()) params.append(k, v);
                const resp = await fetch('/customer/reserve', {
                    method: 'POST',
                    body: params,
                    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/x-www-form-urlencoded' },
                    credentials: 'same-origin',
                    cache: 'no-store'
                });
                const data = await resp.json().catch(() => null);
                if (resp.ok && data && data.success) {
                    showNotification('Reservasi dikirim', 'success');
                    window.location.href = '/customer/reservations';
                } else {
                    showNotification('Gagal mengirim reservasi', 'danger');
                }
            } catch (_) {
                showNotification('Terjadi kesalahan jaringan saat mengirim', 'danger');
            } finally {
                if (btn) { btn.innerHTML = original; btn.disabled = false; }
            }
        });
    }
});
