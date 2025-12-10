let products = [];
let currentCategory = 'all';
let currentSubcategory = null;
let currentLanguage = 'en';
let clientsCount = 0;
let clientsCountInterval = null;
let visitorsCount = 0;
let visitorsCountInterval = null;

// Language translations
const translations = {
    ar: {
        all: 'الكل',
        cheats: 'الهاكات',
        spoofers: 'السبوفرات',
        tweaks: 'التويكات',
        external: 'خارجية',
        internal: 'داخلية',
        permanent: 'دائمة',
        temporary: 'مؤقتة',
        optimize: 'تحسين الحاسوب',
        products: 'المنتجات',
        category: 'القسم',
        store: 'المتجر',
        price: 'السعر',
        rating: 'التقييم',
        visitStore: 'زيارة المتجر',
        rateStore: 'قيم المتجر',
        noProducts: 'لا توجد منتجات في هذا القسم',
        errorLoading: 'خطأ في تحميل المنتجات',
        ratingCooldown: 'يمكنك التقييم مرة كل يومين. آخر تقييم كان قبل',
        ratingCooldownDays: 'يوم',
        ratingCooldownHours: 'ساعة',
        ratingCooldownMinutes: 'دقيقة',
        ratingCooldownRemaining: 'متبقي',
        topStores: 'أفضل المتاجر',
        topStoresSubtitle: 'أشهر المتاجر بالشغل الجيد والأمان والدعم الفني',
        productsCount: 'عدد المنتجات',
        avgRating: 'متوسط التقييم',
        goodWork: 'شغل جيد',
        security: 'أمان',
        support: 'دعم فني',
        back: '← رجوع'
    },
    en: {
        all: 'All',
        cheats: 'Cheats',
        spoofers: 'Spoofers',
        tweaks: 'Tweaks',
        external: 'External',
        internal: 'Internal',
        permanent: 'Permanent',
        temporary: 'Temporary',
        optimize: 'PC Optimize',
        products: 'Products',
        category: 'Category',
        store: 'Store',
        price: 'Price',
        rating: 'Rating',
        visitStore: 'Visit Store',
        rateStore: 'Rate Store',
        noProducts: 'No products in this category',
        errorLoading: 'Error loading products',
        ratingCooldown: 'You can rate once every 2 days. Last rating was',
        ratingCooldownDays: 'days',
        ratingCooldownHours: 'hours',
        ratingCooldownMinutes: 'minutes',
        ratingCooldownRemaining: 'remaining',
        topStores: 'Top Stores',
        topStoresSubtitle: 'Most Popular Stores with Good Work, Security & Technical Support',
        productsCount: 'Products Count',
        avgRating: 'Average Rating',
        goodWork: 'Good Work',
        security: 'Security',
        support: 'Technical Support',
        back: '← Back'
    }
};

// Set language
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    
    document.documentElement.lang = lang;
    if (lang === 'ar') {
        document.documentElement.dir = 'rtl';
    } else {
        document.documentElement.dir = 'ltr';
    }
    
    // Update all elements with data attributes
    document.querySelectorAll('[data-en][data-ar]').forEach(element => {
        const text = element.getAttribute(`data-${lang}`) || element.getAttribute('data-en');
        if (text) {
            element.textContent = text;
        }
    });
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        const tab = btn.getAttribute('data-tab');
        if (tab && tab !== 'all') {
            btn.textContent = t(tab);
        } else if (tab === 'all') {
            btn.textContent = t('all');
        }
    });
    
    // Update dropdown items
    document.querySelectorAll('.dropdown-content a').forEach(link => {
        const text = link.getAttribute(`data-${lang}`) || link.getAttribute('data-en');
        if (text) {
            link.textContent = text;
        }
    });
    
    // Update language dropdown current text
    const langCurrentText = document.getElementById('lang-current-text');
    if (langCurrentText) {
        langCurrentText.textContent = lang === 'ar' ? 'العربية' : 'English';
    }
    
    // Update language dropdown options
    document.querySelectorAll('.lang-option').forEach(option => {
        const text = option.getAttribute(`data-${lang}`);
        if (text) {
            option.textContent = text;
        }
    });
    
    // Close dropdown after selection
    const langDropdown = document.querySelector('.lang-dropdown');
    if (langDropdown) {
        langDropdown.classList.remove('active');
    }
    
    // Re-display products and stores with new language
    if (document.getElementById('homeSection').style.display !== 'none') {
        displayProducts();
        displayTopStores();
    }
}

// Get translation
function t(key) {
    return translations[currentLanguage][key] || key;
}

// Toggle language dropdown
function toggleLangDropdown() {
    const dropdown = document.querySelector('.lang-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const langDropdown = document.querySelector('.lang-dropdown');
    if (langDropdown && !langDropdown.contains(event.target)) {
        langDropdown.classList.remove('active');
    }
});

// Load products from JSON
function loadProducts() {
    // Use XMLHttpRequest to load products.json (works with both file:// and http://)
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'products.json', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 0) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    products = processProductsData(data);
                    console.log('Products loaded successfully from products.json:', products.length);
                    
                    // Ensure we're on home page
                    currentCategory = 'all';
                    currentSubcategory = null;
                    
                    // Always try to display products and stores
                    displayProducts();
                    displayTopStores();
                } catch(error) {
                    console.error('Error parsing products.json:', error);
                    showError('Error parsing products.json: ' + error.message);
                }
            } else {
                console.error('Failed to load products.json:', xhr.status);
                showError('Failed to load products.json: ' + xhr.status);
            }
        }
    };
    xhr.onerror = function() {
        console.error('Network error loading products.json');
        showError('Network error loading products.json');
    };
    xhr.send();
}

// Show error message
function showError(message) {
    const grid = document.getElementById('productsGrid');
    const storesGrid = document.getElementById('topStoresGrid');
    
    if (grid) {
        grid.innerHTML = `<div class="no-products">${t('errorLoading')}: ${message}</div>`;
    }
    if (storesGrid) {
        storesGrid.innerHTML = `<div class="no-products">${t('errorLoading')}: ${message}</div>`;
    }
}

// Process products data and translate based on current language
function processProductsData(data) {
    if (!Array.isArray(data)) {
        return [];
    }
    
    // Process each product - keep original data for filtering
    // Translation happens when displaying using t() function
    return data.map(product => {
        return {
            ...product,
            // Keep original category/subcategory keys for filtering
            // Translation will be done in display functions using t() function
        };
    });
}

// Initialize app function (called from HTML script tag)
function initializeApp() {
    // Load products
    loadProducts();
}

// Select category with subcategory
function selectCategory(category, subcategory) {
    currentCategory = category;
    currentSubcategory = subcategory;
    
    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.remove('active');
        if (b.getAttribute('data-tab') === category) {
            b.classList.add('active');
        }
    });
    
    showCategory(category, subcategory);
}

// Show category products
function showCategory(category, subcategory) {
    document.getElementById('homeSection').style.display = 'none';
    document.getElementById('categorySection').style.display = 'block';
    document.getElementById('productSection').style.display = 'none';
    
    const categoryNames = {
        cheats: { 
            external: { en: 'External Cheats', ar: 'الهاكات الخارجية' },
            internal: { en: 'Internal Cheats', ar: 'الهاكات الداخلية' }
        },
        spoofers: {
            permanent: { en: 'Permanent Spoofers', ar: 'السبوفرات الدائمة' },
            temporary: { en: 'Temporary Spoofers', ar: 'السبوفرات المؤقتة' }
        },
        tweaks: {
            optimize: { en: 'PC Optimize', ar: 'تحسين الحاسوب' }
        }
    };
    
    const title = categoryNames[category]?.[subcategory]?.[currentLanguage] || 
                  `${t(category)} - ${t(subcategory)}`;
    document.getElementById('categoryTitle').textContent = title;
    
    let filteredProducts = products.filter(p => p.category === category);
    if (subcategory) {
        filteredProducts = filteredProducts.filter(p => p.subcategory === subcategory);
    }
    
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = `<div class="no-products">${t('noProducts')}</div>`;
        return;
    }
    
    filteredProducts.forEach(product => {
        const avgRating = calculateAverageRating(product.id);
        const ratingStars = generateStars(avgRating);
        
        const card = document.createElement('div');
        card.className = 'category-card';
        card.onclick = () => showProductDetails(product.id);
        
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" 
                 onerror="this.src='public/images/kenta-logo.png'">
            <div class="product-name">${product.name}</div>
            ${product.store ? `
                <div class="product-info">
                    <strong>${t('store')}:</strong> ${product.store}
                </div>
            ` : ''}
            ${avgRating > 0 ? `
                <div class="product-rating">
                    <span class="rating-stars">${ratingStars}</span>
                    <span class="rating-value">${avgRating.toFixed(1)}/5</span>
                </div>
            ` : ''}
            ${product.price ? `
                <div class="product-price">${t('price')}: ${product.price}</div>
            ` : ''}
            <p style="color: #999; font-size: 0.9em; margin-top: 10px;" data-en="Click to view details" data-ar="اضغط لعرض التفاصيل">Click to view details</p>
        `;
        
        grid.appendChild(card);
    });
    
    window.scrollTo(0, 0);
}

// Show product details
function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    document.getElementById('homeSection').style.display = 'none';
    document.getElementById('categorySection').style.display = 'none';
    document.getElementById('productSection').style.display = 'block';
    
    const avgRating = calculateAverageRating(product.id);
    const ratingStars = generateStars(avgRating);
    const categoryText = t(product.category);
    const subcategoryText = product.subcategory ? ' - ' + t(product.subcategory) : '';
    
    const details = document.getElementById('productDetails');
    details.innerHTML = `
        <div class="product-detail-card">
            <img src="${product.image}" alt="${product.name}" class="product-detail-image" 
                 onerror="this.src='public/images/kenta-logo.png'">
            <div class="product-detail-content">
                <h1 class="product-detail-name">${product.name}</h1>
                ${avgRating > 0 ? `
                    <div class="product-rating">
                        <span class="rating-stars">${ratingStars}</span>
                        <span class="rating-value">${avgRating.toFixed(1)}/5</span>
                    </div>
                ` : ''}
                <div class="product-detail-info">
                    <div class="info-item">
                        <strong>${t('category')}:</strong> ${categoryText}${subcategoryText}
                    </div>
                    ${product.price ? `
                        <div class="info-item">
                            <strong>${t('price')}:</strong> ${product.price}
                        </div>
                    ` : ''}
                    ${product.store ? `
                        <div class="info-item">
                            <strong>${t('store')}:</strong> ${product.store}
                        </div>
                    ` : ''}
                </div>
                ${product.storeLink ? `
                    <a href="${product.storeLink}" target="_blank" class="store-link">
                        ${t('visitStore')}
                    </a>
                ` : ''}
                <div class="rating-section">
                    <div class="rating-label">${t('rateStore')}:</div>
                    <div class="rating-buttons">
                        ${[1, 2, 3, 4, 5].map(rating => `
                            <button class="rating-btn" onclick="rateProduct(${product.id}, ${rating})" 
                                    data-rating="${rating}">${rating}</button>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    window.scrollTo(0, 0);
}

// Go back to category
function goBackCategory() {
    document.getElementById('productSection').style.display = 'none';
    document.getElementById('categorySection').style.display = 'block';
    window.scrollTo(0, 0);
}

// Go home
function goHome() {
    document.getElementById('homeSection').style.display = 'block';
    document.getElementById('categorySection').style.display = 'none';
    document.getElementById('productSection').style.display = 'none';
    
    // Reset category
    currentCategory = 'all';
    currentSubcategory = null;
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.nav-btn[data-tab="all"]').classList.add('active');
    
    displayProducts();
    window.scrollTo(0, 0);
}

// Display products based on selected category
function displayProducts() {
    const grid = document.getElementById('productsGrid');
    
    if (!grid) {
        console.error('Products grid not found');
        return;
    }
    
    // Only show products on home page when category is 'all'
    const homeSection = document.getElementById('homeSection');
    const isHomeVisible = homeSection && homeSection.style.display !== 'none';
    
    if (currentCategory !== 'all' || !isHomeVisible) {
        console.log('Not displaying products - category:', currentCategory, 'home visible:', isHomeVisible);
        return; // Don't display products in category view
    }
    
    console.log('Displaying products, count:', products.length);
    
    if (products.length === 0) {
        grid.innerHTML = `<div class="no-products">${t('noProducts')}</div>`;
        return;
    }
    
    // Clear grid first
    grid.innerHTML = '';
    
    // Display all products
    products.forEach(product => {
        const avgRating = calculateAverageRating(product.id);
        const ratingStars = generateStars(avgRating);
        const categoryText = t(product.category);
        const subcategoryText = product.subcategory ? ' - ' + t(product.subcategory) : '';
        
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => showCategory(product.category, product.subcategory || '');
        
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" 
                 onerror="this.src='public/images/kenta-logo.png'">
            <div class="product-name">${product.name}</div>
            <div class="product-info">
                <strong>${t('category')}:</strong> ${categoryText}${subcategoryText}
            </div>
            ${avgRating > 0 ? `
                <div class="product-rating">
                    <span class="rating-stars">${ratingStars}</span>
                    <span class="rating-value">${avgRating.toFixed(1)}/5</span>
                </div>
            ` : ''}
            ${product.price ? `
                <div class="product-price">${t('price')}: ${product.price}</div>
            ` : ''}
            ${product.store ? `
                <div class="product-info">
                    <strong>${t('store')}:</strong> ${product.store}
                </div>
            ` : ''}
            <button class="view-product-btn" onclick="event.stopPropagation(); showCategory('${product.category}', '${product.subcategory || ''}')" data-en="View Details" data-ar="عرض التفاصيل">
                <span data-en="View Details" data-ar="عرض التفاصيل">View Details</span>
            </button>
        `;
        
        grid.appendChild(card);
    });
    
    console.log('Products displayed:', products.length);
}

// Calculate top products based on ratings (for Top Stores section)
function calculateTopStores() {
    // Get all products with their ratings
    const productsWithRatings = products.map(product => {
        const avgRating = calculateAverageRating(product.id);
        return {
            ...product,
            avgRating,
            ratingCount: getProductRatings(product.id).length
        };
    });
    
    // Sort by rating (highest first), then by number of ratings
    return productsWithRatings
        .filter(p => p.avgRating > 0) // Only products with ratings
        .sort((a, b) => {
            // First sort by rating
            if (b.avgRating !== a.avgRating) {
                return b.avgRating - a.avgRating;
            }
            // If same rating, sort by number of ratings
            return b.ratingCount - a.ratingCount;
        });
}

// Display top stores (now shows top products)
function displayTopStores() {
    const grid = document.getElementById('topStoresGrid');
    
    if (!grid) {
        console.error('Top stores grid not found');
        return;
    }
    
    console.log('Displaying top stores, products count:', products.length);
    
    if (products.length === 0) {
        grid.innerHTML = `<div class="no-products">${t('noProducts')}</div>`;
        return;
    }
    
    const topProducts = calculateTopStores();
    console.log('Top products calculated:', topProducts.length);
    
    if (topProducts.length === 0) {
        grid.innerHTML = `<div class="no-products">${t('noProducts')}</div>`;
        return;
    }
    
    // Clear grid first
    grid.innerHTML = '';
    
    // Display top products using same card style as regular products
    topProducts.forEach(product => {
        const avgRating = product.avgRating;
        const ratingStars = generateStars(avgRating);
        const categoryText = t(product.category);
        const subcategoryText = product.subcategory ? ' - ' + t(product.subcategory) : '';
        
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => showProductDetails(product.id);
        
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" 
                 onerror="this.src='public/images/kenta-logo.png'">
            <div class="product-name">${product.name}</div>
            <div class="product-info">
                <strong>${t('category')}:</strong> ${categoryText}${subcategoryText}
            </div>
            ${avgRating > 0 ? `
                <div class="product-rating">
                    <span class="rating-stars">${ratingStars}</span>
                    <span class="rating-value">${avgRating.toFixed(1)}/5</span>
                </div>
            ` : ''}
            ${product.price ? `
                <div class="product-price">${t('price')}: ${product.price}</div>
            ` : ''}
            ${product.store ? `
                <div class="product-info">
                    <strong>${t('store')}:</strong> ${product.store}
                </div>
            ` : ''}
            <button class="view-product-btn" onclick="event.stopPropagation(); showProductDetails(${product.id})" data-en="View Details" data-ar="عرض التفاصيل">
                <span data-en="View Details" data-ar="عرض التفاصيل">View Details</span>
            </button>
        `;
        
        grid.appendChild(card);
    });
}

// Generate stars for rating
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '⭐'.repeat(fullStars);
    if (hasHalfStar) stars += '⭐';
    return stars;
}

// Calculate average rating for a product
function calculateAverageRating(productId) {
    const ratings = getProductRatings(productId);
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((a, b) => a + b, 0);
    return sum / ratings.length;
}

// Get product ratings from localStorage
function getProductRatings(productId) {
    const key = `product_${productId}_ratings`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
}

// Get user ID (create if doesn't exist)
function getUserId() {
    let userId = localStorage.getItem('user_id');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('user_id', userId);
    }
    return userId;
}

// Get last rating time for a product by this user
function getLastRatingTime(productId) {
    const userId = getUserId();
    const key = `product_${productId}_lastRating_${userId}`;
    const lastRating = localStorage.getItem(key);
    return lastRating ? parseInt(lastRating) : null;
}

// Save last rating time for a product by this user
function saveLastRatingTime(productId) {
    const userId = getUserId();
    const key = `product_${productId}_lastRating_${userId}`;
    localStorage.setItem(key, Date.now().toString());
}

// Check if user can rate (2 days cooldown)
function canUserRate(productId) {
    const lastRatingTime = getLastRatingTime(productId);
    if (!lastRatingTime) return { canRate: true, timeRemaining: null };
    
    const now = Date.now();
    const timeDiff = now - lastRatingTime;
    const twoDaysInMs = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
    
    if (timeDiff >= twoDaysInMs) {
        return { canRate: true, timeRemaining: null };
    }
    
    const remaining = twoDaysInMs - timeDiff;
    return { canRate: false, timeRemaining: remaining };
}

// Format time remaining
function formatTimeRemaining(ms) {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    
    const parts = [];
    if (days > 0) parts.push(`${days} ${t('ratingCooldownDays')}`);
    if (hours > 0) parts.push(`${hours} ${t('ratingCooldownHours')}`);
    if (minutes > 0 && days === 0) parts.push(`${minutes} ${t('ratingCooldownMinutes')}`);
    
    return parts.join(' ') || `1 ${t('ratingCooldownMinutes')}`;
}

// Delete all ratings data
function resetAllRatings() {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    
    // Delete all rating-related keys
    keys.forEach(key => {
        if (key.startsWith('product_') && (key.includes('_ratings') || key.includes('_lastRating_'))) {
            localStorage.removeItem(key);
        }
    });
    
    // Delete user_id to reset user
    localStorage.removeItem('user_id');
    
    // Reload page to reset everything
    location.reload();
}

// Save product rating
function saveProductRating(productId, rating) {
    const key = `product_${productId}_ratings`;
    const ratings = getProductRatings(productId);
    ratings.push(rating);
    localStorage.setItem(key, JSON.stringify(ratings));
    saveLastRatingTime(productId);
}

// Rate a product
function rateProduct(productId, rating) {
    // Check if user can rate
    const { canRate, timeRemaining } = canUserRate(productId);
    
    if (!canRate) {
        const timeStr = formatTimeRemaining(timeRemaining);
        const message = `${t('ratingCooldown')} ${timeStr} ${t('ratingCooldownRemaining')}`;
        alert(message);
        return;
    }
    
    saveProductRating(productId, rating);
    
    // Update button appearance
    const buttons = document.querySelectorAll(`[onclick*="rateProduct(${productId}"]`);
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.getAttribute('data-rating')) === rating) {
            btn.classList.add('active');
        }
    });
    
    // Re-display to update average rating and refresh Top Stores
    setTimeout(() => {
        if (document.getElementById('productSection').style.display !== 'none') {
            showProductDetails(productId);
        } else {
            displayProducts();
        }
        // Always refresh Top Stores to update order based on new ratings
        displayTopStores();
    }, 300);
}

// Tab switching from navbar
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Don't trigger if clicking dropdown
        if (e.target.closest('.dropdown-content')) return;
        
        const category = btn.getAttribute('data-tab');
        if (category === 'all') {
            goHome();
        } else {
            currentCategory = category;
            currentSubcategory = null;
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showCategory(category, null);
        }
    });
});

// Loading Screen - Show for 1 second then hide permanently
function animateLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    
    if (!loadingScreen) {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('loading');
        showContent();
        return;
    }
    
    // Wait exactly 1 second (1000ms) then remove loading screen
    setTimeout(function() {
        if (loadingScreen && loadingScreen.parentNode) {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transition = 'opacity 0.3s ease';
            
            setTimeout(function() {
                if (loadingScreen && loadingScreen.parentNode) {
                    loadingScreen.parentNode.removeChild(loadingScreen);
                }
                document.body.style.overflow = 'auto';
                document.body.classList.remove('loading');
                showContent();
            }, 300);
        } else {
            document.body.style.overflow = 'auto';
            document.body.classList.remove('loading');
            showContent();
        }
    }, 1000);
}

// Animate clients counter
function animateClientsCounter() {
    const clientsElement = document.getElementById('clientsCount');
    if (!clientsElement) return;
    
    // Get saved count or start from 0
    const savedCount = parseInt(localStorage.getItem('clientsCount')) || 0;
    clientsCount = savedCount;
    
    // Animate to saved count first
    animateNumber(clientsElement, 0, clientsCount, 2000);
    
    // Then start auto-incrementing
    setTimeout(function() {
        if (clientsCountInterval) {
            clearInterval(clientsCountInterval);
        }
        
        clientsCountInterval = setInterval(function() {
            clientsCount++;
            localStorage.setItem('clientsCount', clientsCount);
            animateNumber(clientsElement, clientsCount - 1, clientsCount, 500);
        }, 3000); // Increase every 3 seconds
    }, 2000);
}

// Animate visitors counter
function animateVisitorsCounter() {
    const visitorsElement = document.getElementById('visitorsCount');
    if (!visitorsElement) return;
    
    // Get saved count or start from 0
    const savedCount = parseInt(localStorage.getItem('visitorsCount')) || 0;
    visitorsCount = savedCount;
    
    // Increment visitor count on page load
    visitorsCount++;
    localStorage.setItem('visitorsCount', visitorsCount);
    
    // Animate to new count
    animateNumber(visitorsElement, savedCount, visitorsCount, 2000);
    
    // Then start auto-incrementing
    setTimeout(function() {
        if (visitorsCountInterval) {
            clearInterval(visitorsCountInterval);
        }
        
        visitorsCountInterval = setInterval(function() {
            visitorsCount++;
            localStorage.setItem('visitorsCount', visitorsCount);
            animateNumber(visitorsElement, visitorsCount - 1, visitorsCount, 500);
        }, 4000); // Increase every 4 seconds
    }, 2000);
}

// Animate number counting
function animateNumber(element, from, to, duration) {
    const startTime = Date.now();
    const range = to - from;
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(from + (range * progress));
        
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = to.toLocaleString();
        }
    }
    
    update();
}

// Show main content with smooth animation
function showContent() {
    // Show navbar
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.opacity = '1';
        navbar.style.visibility = 'visible';
    }
    
    // Show language selector
    const languageSelector = document.querySelector('.language-selector');
    if (languageSelector) {
        languageSelector.style.opacity = '1';
        languageSelector.style.visibility = 'visible';
    }
    
    // Show home section
    const homeSection = document.getElementById('homeSection');
    if (homeSection) {
        homeSection.style.display = 'block';
        homeSection.style.opacity = '1';
        homeSection.style.visibility = 'visible';
    }
    
    // Ensure we're on home page
    currentCategory = 'all';
    currentSubcategory = null;
    
    // Start counters animation
    setTimeout(function() {
        animateClientsCounter();
        animateVisitorsCounter();
    }, 500);
    
    // Display products and stores
    setTimeout(function() {
        if (products.length > 0) {
            console.log('Displaying products:', products.length);
            displayProducts();
            displayTopStores();
        } else {
            console.log('Loading products...');
            // Load products if not loaded yet
            loadProducts();
        }
    }, 200);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Block body scroll during loading
    document.body.style.overflow = 'hidden';
    document.body.classList.add('loading');
    
    // Hide navbar and language selector initially
    const navbar = document.querySelector('.navbar');
    const languageSelector = document.querySelector('.language-selector');
    if (navbar) {
        navbar.style.opacity = '0';
        navbar.style.visibility = 'hidden';
    }
    if (languageSelector) {
        languageSelector.style.opacity = '0';
        languageSelector.style.visibility = 'hidden';
    }
    
    // Hide home section initially
    const homeSection = document.getElementById('homeSection');
    if (homeSection) {
        homeSection.style.display = 'none';
        homeSection.style.opacity = '0';
        homeSection.style.visibility = 'hidden';
    }
    
    // Load saved language (default to English)
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
    
    // Ensure currentCategory is 'all' initially
    currentCategory = 'all';
    currentSubcategory = null;
    
    // Pre-load products in background
    loadProducts();
    
    // Start loading animation (1 second then show content)
    animateLoading();
});

// Backup: Force show content after 1.5 seconds if loading screen still exists
window.addEventListener('load', function() {
    setTimeout(function() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            try {
                if (loadingScreen.parentNode) {
                    loadingScreen.parentNode.removeChild(loadingScreen);
                }
            } catch(e) {}
            document.body.style.overflow = 'auto';
            document.body.classList.remove('loading');
            showContent();
        }
    }, 1500);
});
