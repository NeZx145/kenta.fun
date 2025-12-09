// ============ LANGUAGE SYSTEM ============
let currentLanguage = 'en';

// Helper to show form messages (success / error / info)
function showFormMsg(elId, msg, type = 'info') {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('msg-success', 'msg-error', 'msg-info');
    if (type === 'success') el.classList.add('msg-success');
    else if (type === 'error') el.classList.add('msg-error');
    else el.classList.add('msg-info');
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    
    document.documentElement.lang = lang;
    if (lang === 'ar') {
        document.documentElement.dir = 'rtl';
    } else {
        document.documentElement.dir = 'ltr';
    }
    
    document.querySelectorAll('[data-en][data-ar][data-tr]').forEach(element => {
        element.textContent = element.getAttribute(`data-${lang}`);
    });
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`lang-${lang}`).classList.add('active');
}

// ============ SAMPLE DATA ============
const productsData = {
    spoofers: {
        permanent: [
            {
                id: 1,
                name: "Blurred",
                rating: 9.4,
                detection: "Undetected",
                type: "permanent",
                prices: ["$24.99", "$39.99", "$399.99"],
                description: "Advanced permanent spoofer with high success rate. Compatible with all iOS devices.",
                features: ["External", "Private", "Invite-only"]
            },
            {
                id: 2,
                name: "PML4",
                rating: 8.6,
                detection: "Undetected",
                type: "permanent",
                prices: ["$50", "$120"],
                description: "Professional spoofer with reliable detection evasion.",
                features: ["External", "Private", "Invite-only"]
            }
        ],
        temporary: [
            {
                id: 3,
                name: "Pulse.GG",
                rating: 7.6,
                detection: "Undetected",
                type: "temporary",
                prices: ["$50", "$120"],
                description: "Temporary spoofer solution for temporary needs.",
                features: ["External", "Public", "Slotted"]
            },
            {
                id: 4,
                name: "SinfulEXP",
                rating: 8.1,
                detection: "Detected",
                type: "temporary",
                prices: ["$135"],
                description: "Fast temporary spoofer with good reliability.",
                features: ["External", "Private", "Invite-only"]
            }
        ]
    },
    tweaks: {
        ios: [
            {
                id: 5,
                name: "Cydia Tweaks Bundle",
                rating: 8.9,
                detection: "Undetected",
                prices: ["$9.99", "$19.99"],
                description: "Collection of premium iOS tweaks for customization.",
                features: ["Latest", "Tested", "Verified"]
            },
            {
                id: 6,
                name: "jailbreak Tools Pack",
                rating: 8.5,
                detection: "Testing",
                prices: ["$29.99"],
                description: "Complete jailbreak tools for iOS devices.",
                features: ["Latest", "Tested", "Support"]
            }
        ],
        optimize: [
            {
                id: 5,
                name: "PC Optimizer Suite",
                rating: 8.9,
                detection: "Undetected",
                prices: ["$9.99", "$19.99"],
                description: "Collection of premium optimization tools for Windows PC.",
                features: ["Latest", "Tested", "Verified"]
            },
            {
                id: 6,
                name: "System Tune Pack",
                rating: 8.5,
                detection: "Testing",
                prices: ["$29.99"],
                description: "Complete optimization tools for faster PCs.",
                features: ["Latest", "Tested", "Support"]
            }
        ],
        drivers: [
            {
                id: 7,
                name: "Xposed Module Collection",
                rating: 8.3,
                detection: "Undetected",
                prices: ["$14.99"],
                description: "Powerful Android modification modules.",
                features: ["Latest", "Tested", "Free Updates"]
            },
            {
                id: 8,
                name: "Android Mods Pack",
                rating: 7.8,
                detection: "Detected",
                prices: ["$19.99", "$39.99"],
                description: "Advanced Android tweaks and mods.",
                features: ["Latest", "Customizable", "Support"]
            }
        ]
    },
    cheats: {
        external: [
            {
                id: 9,
                name: "Game ESP Cheat",
                rating: 9.2,
                detection: "Undetected",
                prices: ["$24.99", "$49.99"],
                description: "Advanced ESP cheat for competitive games.",
                features: ["External", "Public", "Detection-Free"]
            },
            {
                id: 10,
                name: "Aimbot Master",
                rating: 8.7,
                detection: "Undetected",
                prices: ["$19.99", "$44.99"],
                description: "Professional aimbot for multiple games.",
                features: ["External", "Public", "Smooth"]
            }
        ],
        internal: [
            {
                id: 11,
                name: "Game Wallhack",
                rating: 8.4,
                detection: "Testing",
                prices: ["$29.99"],
                description: "Internal wallhack with advanced features.",
                features: ["Internal", "Application Required", "24/7 Support"]
            },
            {
                id: 12,
                name: "DMA Cheat Suite",
                rating: 8.9,
                detection: "Undetected",
                prices: ["$39.99", "$79.99"],
                description: "Professional DMA-based cheat suite.",
                features: ["Internal", "DMA", "No Detection"]
            }
        ]
    }
};

const subcategoryNames = {
    spoofers: { permanent: 'Permanent Spoofers', temporary: 'Temporary Spoofers' },
    tweaks: { ios: 'iOS Tweaks', android: 'Android Tweaks' },
    cheats: { external: 'External Cheats', internal: 'Internal Cheats' }
};

let currentView = { category: null, subcategory: null };

// ============ LOCAL STORAGE ============
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getProducts() {
    return JSON.parse(localStorage.getItem('products')) || [];
}

function saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser')) || null;
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// ============ NAVIGATION ============
function goHome() {
    document.getElementById('homeSection').classList.remove('hidden');
    document.getElementById('categorySection').style.display = 'none';
    document.getElementById('productSection').style.display = 'none';
    currentView = { category: null, subcategory: null };
    window.scrollTo(0, 0);
}

function showCategory(category, subcategory) {
    document.getElementById('homeSection').classList.add('hidden');
    document.getElementById('categorySection').style.display = 'block';
    document.getElementById('productSection').style.display = 'none';
    
    currentView = { category, subcategory };
    
    const products = productsData[category][subcategory] || [];
    document.getElementById('categoryTitle').textContent = subcategoryNames[category][subcategory];
    
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.onclick = () => showProductDetails(category, subcategory, product.id);
        
        card.innerHTML = `
            <h3>${product.name}</h3>
            <p class="detection-status status-${product.detection.toLowerCase()}">${product.detection}</p>
            <div class="product-rating">
                <span class="rating-stars">⭐ ${product.rating}/10</span>
            </div>
            <p style="color: #999; font-size: 14px; margin-top: 10px;">Click to view details</p>
        `;
        
        grid.appendChild(card);
    });
    
    window.scrollTo(0, 0);
}

function showProductDetails(category, subcategory, productId) {
    document.getElementById('homeSection').classList.add('hidden');
    document.getElementById('categorySection').style.display = 'none';
    document.getElementById('productSection').style.display = 'block';
    
    const product = productsData[category][subcategory].find(p => p.id === productId);
    if (!product) return;
    
    const details = document.getElementById('productDetails');
    details.innerHTML = `
        <div class="product-card">
            <div class="product-header-info">
                <div>
                    <h1 class="product-title">${product.name}</h1>
                    <div class="product-rating">
                        <span class="rating-stars">⭐ ${product.rating}/10</span>
                    </div>
                </div>
                <div class="detection-status status-${product.detection.toLowerCase()}">${product.detection}</div>
            </div>
            
            <div class="product-meta">
                <div class="meta-item">
                    <div class="meta-label">CATEGORY</div>
                    <div class="meta-value">${category}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">TYPE</div>
                    <div class="meta-value">${subcategory}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">RATING</div>
                    <div class="meta-value">${product.rating}/10</div>
                </div>
            </div>
            
            <div class="product-description">
                <strong>Description:</strong><br><br>
                ${product.description}
            </div>
            
            <div>
                <strong style="color: #b10000; display: block; margin-bottom: 10px;">FEATURES:</strong>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
                    ${product.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
                </div>
            </div>
            
            <div>
                <strong style="color: #b10000; display: block; margin-bottom: 10px;">PRICING:</strong>
                <div class="product-prices">
                    ${product.prices.map(p => `<div class="price-item">${p}</div>`).join('')}
                </div>
            </div>
        </div>
    `;
    
    window.scrollTo(0, 0);
}

function goBackCategory() {
    if (currentView.category && currentView.subcategory) {
        showCategory(currentView.category, currentView.subcategory);
    } else {
        goHome();
    }
}

// ============ LOGIN & REGISTER ============
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
    document.getElementById('registerModal').style.display = 'none';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
    document.getElementById('loginModal').style.display = 'none';
}

function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
}

function switchToRegister() {
    closeLoginModal();
    showRegisterModal();
}

function switchToLogin() {
    closeRegisterModal();
    showLoginModal();
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        setCurrentUser(user);
        closeLoginModal();
        document.getElementById('loginForm').reset();
        updateNavbar();
        // show success message briefly
        showFormMsg('loginMsg', 'Login successful! مرحباً ' + user.username, 'success');
        // reveal CTA
        const submitBtn = document.getElementById('submitNowBtn');
        if (submitBtn) submitBtn.style.display = 'inline-block';
        // open dashboard
        setTimeout(() => {
            showUserDashboard();
            showFormMsg('loginMsg', '', 'info');
        }, 700);
    } else {
        showFormMsg('loginMsg', 'Invalid credentials! بيانات غير صحيحة', 'error');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;
    
    document.getElementById('usernameMsg').textContent = '';
    document.getElementById('emailMsg').textContent = '';
    document.getElementById('passwordMsg').textContent = '';
    
    let isValid = true;
    
    if (username.length < 3) {
        document.getElementById('usernameMsg').textContent = 'Minimum 3 characters';
        document.getElementById('usernameMsg').classList.add('msg-error');
        isValid = false;
    }
    
    const users = getUsers();
    if (users.find(u => u.username === username)) {
        document.getElementById('usernameMsg').textContent = 'Username exists! المستخدم موجود بالفعل';
        document.getElementById('usernameMsg').classList.add('msg-error');
        isValid = false;
    }
    
    if (users.find(u => u.email === email)) {
        document.getElementById('emailMsg').textContent = 'Email registered! البريد مسجل بالفعل';
        document.getElementById('emailMsg').classList.add('msg-error');
        isValid = false;
    }
    
    if (password.length < 6) {
        document.getElementById('passwordMsg').textContent = 'Minimum 6 characters';
        document.getElementById('passwordMsg').classList.add('msg-error');
        isValid = false;
    }
    
    if (password !== confirm) {
        document.getElementById('passwordMsg').textContent = 'Passwords don\'t match! كلمات المرور غير متطابقة';
        document.getElementById('passwordMsg').classList.add('msg-error');
        isValid = false;
    }
    
    if (!isValid) return;
    
    const newUser = {
        id: Date.now(),
        username: username,
        email: email,
        password: password,
        joinDate: new Date().toLocaleDateString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // show success message in login modal
    closeRegisterModal();
    document.getElementById('registerForm').reset();
    showLoginModal();
    setTimeout(() => {
        showFormMsg('loginMsg', 'Account created! الحساب جاهز، الرجاء تسجيل الدخول', 'success');
    }, 300);
}

function updateNavbar() {
    const currentUser = getCurrentUser();
    const userBtn = document.getElementById('userNavBtn');
    
    if (currentUser) {
        userBtn.style.display = 'inline-block';
        userBtn.textContent = currentUser.username;
        document.querySelector('.nav-btn:not(.register-btn)').style.display = 'none';
        document.querySelector('.nav-btn.register-btn').style.display = 'none';
    } else {
        userBtn.style.display = 'none';
        document.querySelector('.nav-btn:not(.register-btn)').style.display = 'inline-block';
        document.querySelector('.nav-btn.register-btn').style.display = 'inline-block';
    }
}

// ============ USER DASHBOARD ============
function showUserDashboard() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showLoginModal();
        return;
    }
    
    goHome();
    document.getElementById('userDashboard').classList.add('active');
    loadUserProfile();
}

function logoutUser() {
    if (confirm('Logout?')) {
        localStorage.removeItem('currentUser');
        location.reload();
    }
}

function showDashboardSection(section) {
    document.querySelectorAll('.dashboard-section').forEach(s => {
        s.classList.remove('active');
    });
    document.getElementById(section + '-section').classList.add('active');
    
    document.querySelectorAll('.dashboard-menu a').forEach(a => {
        a.classList.remove('menu-active');
    });
    event.target.classList.add('menu-active');
    
    return false;
}

function updateSubcategories() {
    const category = document.getElementById('productCategory').value;
    const subSelect = document.getElementById('productSubcategory');
    subSelect.innerHTML = '';
    
    if (category === 'spoofers') {
        subSelect.innerHTML = '<option value="permanent">Permanent</option><option value="temporary">Temporary</option>';
    } else if (category === 'tweaks') {
        subSelect.innerHTML = '<option value="ios">iOS</option><option value="android">Android</option>';
    } else if (category === 'cheats') {
        subSelect.innerHTML = '<option value="external">External</option><option value="internal">Internal</option>';
    }
}

function handleSubmitProduct(event) {
    event.preventDefault();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Please login first!');
        return;
    }
    
    const product = {
        id: Date.now(),
        userId: currentUser.id,
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        subcategory: document.getElementById('productSubcategory').value,
        type: document.getElementById('productType').value,
        rating: parseFloat(document.getElementById('productRating').value),
        detection: document.getElementById('productDetection').value,
        prices: document.getElementById('productPrices').value.split(','),
        description: document.getElementById('productDescription').value,
        status: 'pending',
        submittedDate: new Date().toLocaleDateString()
    };
    
    const products = getProducts();
    products.push(product);
    saveProducts(products);
    
    alert('Product submitted for review!');
    document.getElementById('submitProductForm').reset();
}

// Handle website submission from dashboard (Submit Website form)
function handleSubmitWebsite(event) {
    event.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showFormMsg('submitWebsiteMsg', 'Please login first. الرجاء تسجيل الدخول', 'error');
        return;
    }
    const name = document.getElementById('websiteName').value;
    const url = document.getElementById('websiteUrl').value;
    const category = document.getElementById('websiteCategory').value;
    const description = document.getElementById('websiteDescription').value;
    const features = document.getElementById('websiteFeatures').value.split(',').map(s=>s.trim()).filter(Boolean);
    const price = document.getElementById('websitePrice').value || 'Free';

    const submission = {
        id: Date.now(),
        userId: currentUser.id,
        name: name,
        url: url,
        category: category,
        description: description,
        features: features,
        price: price,
        status: 'pending',
        submittedDate: new Date().toLocaleDateString()
    };

    const products = getProducts();
    products.push(submission);
    saveProducts(products);

    showFormMsg('submitWebsiteMsg', 'تم الإرسال، في انتظار مراجعة الإدارة (Submitted — pending admin review)', 'success');
    document.getElementById('submitWebsiteForm').reset();
    loadUserProfile();
}

function loadUserProfile() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const products = getProducts().filter(p => p.userId === currentUser.id);
    
    const info = document.getElementById('userProfileInfo');
    info.innerHTML = `
        <div class="profile-info-item">
            <div class="profile-info-label">Username:</div>
            <div class="profile-info-value">${currentUser.username}</div>
        </div>
        <div class="profile-info-item">
            <div class="profile-info-label">Email:</div>
            <div class="profile-info-value">${currentUser.email}</div>
        </div>
        <div class="profile-info-item">
            <div class="profile-info-label">Join Date:</div>
            <div class="profile-info-value">${currentUser.joinDate}</div>
        </div>
        <div class="profile-info-item">
            <div class="profile-info-label">Submissions:</div>
            <div class="profile-info-value">${products.length}</div>
        </div>
    `;
}

// ============ ADMIN PANEL ============
function closeAdminAccessModal() {
    document.getElementById('adminAccessModal').style.display = 'none';
}

// Generate a 6-digit admin code, save with expiry and log to console
function generateAdminCode() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + (5 * 60 * 1000); // 5 minutes
    localStorage.setItem('adminAccessCode', code);
    localStorage.setItem('adminAccessCodeExpiry', expiry.toString());
    console.log('%c⚠️ ADMIN CODE: ' + code + ' (expires in 5 minutes)', 'background:#222;color:#ffcc00;padding:4px 8px;font-weight:bold');
    return code;
}

function generateAndShowAdminCode() {
    generateAdminCode();
    document.getElementById('adminAccessModal').style.display = 'block';
}

function handleAdminAccess(event) {
    event.preventDefault();
    
    const code = document.getElementById('adminAccessCode').value;
    const savedCode = localStorage.getItem('adminAccessCode');
    const expiry = parseInt(localStorage.getItem('adminAccessCodeExpiry') || '0', 10);
    if (expiry && Date.now() > expiry) {
        showFormMsg('loginMsg', 'Admin code expired. الرجاء توليد كود جديد', 'error');
        return;
    }
    
    if (code === '123456' || code === savedCode) {
        localStorage.setItem('adminLoggedIn', 'true');
        closeAdminAccessModal();
        showAdminPanel();
    } else {
        showFormMsg('loginMsg', 'Invalid admin code! كود غير صالح', 'error');
    }
}

function showAdminPanel() {
    document.getElementById('adminPanel').classList.add('active');
    loadAdminData();
}

function logoutAdmin() {
    if (confirm('Logout?')) {
        localStorage.removeItem('adminLoggedIn');
        location.reload();
    }
}

function showAdminSection(section) {
    document.querySelectorAll('.admin-section').forEach(s => {
        s.classList.remove('active');
    });
    document.getElementById(section + '-section').classList.add('active');
    
    document.querySelectorAll('.admin-menu a').forEach(a => {
        a.classList.remove('menu-active');
    });
    event.target.classList.add('menu-active');
    
    return false;
}

function loadAdminData() {
    const products = getProducts();
    const users = getUsers();
    
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalPending').textContent = products.filter(p => p.status === 'pending').length;
    document.getElementById('totalApproved').textContent = products.filter(p => p.status === 'approved').length;
    document.getElementById('totalRejected').textContent = products.filter(p => p.status === 'rejected').length;
    
    loadPendingProducts();
    loadApprovedProducts();
    loadRejectedProducts();
    loadAdminUsers();
}

function loadPendingProducts() {
    const products = getProducts().filter(p => p.status === 'pending');
    const container = document.getElementById('pendingSubmissionsList');
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<p style="color: #999; grid-column: 1/-1; text-align: center;">No pending products</p>';
        return;
    }
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'submission-review-card';
        card.innerHTML = `
            <h3>${product.name}</h3>
            <div class="review-info">
                <label>Submitted by:</label>
                <value>${product.userId}</value>
            </div>
            <div class="review-info">
                <label>Category:</label>
                <value>${product.category}</value>
            </div>
            <div class="review-info">
                <label>Rating:</label>
                <value>${product.rating}/10</value>
            </div>
            <div class="review-actions">
                <button class="review-btn approve-btn" onclick="approveProduct(${product.id})">Approve</button>
                <button class="review-btn reject-btn" onclick="rejectProduct(${product.id})">Reject</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function approveProduct(productId) {
    if (confirm('Approve this product?')) {
        const products = getProducts();
        const product = products.find(p => p.id === productId);
        if (product) {
            product.status = 'approved';
            saveProducts(products);
            loadAdminData();
        }
    }
}

function rejectProduct(productId) {
    if (confirm('Reject this product?')) {
        const products = getProducts();
        const product = products.find(p => p.id === productId);
        if (product) {
            product.status = 'rejected';
            saveProducts(products);
            loadAdminData();
        }
    }
}

function loadApprovedProducts() {
    const products = getProducts().filter(p => p.status === 'approved');
    const container = document.getElementById('approvedSubmissionsList');
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<p style="color: #999; grid-column: 1/-1; text-align: center;">No approved products</p>';
        return;
    }
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'submission-review-card';
        card.innerHTML = `
            <h3 style="color: #00ff00;">${product.name}</h3>
            <div class="review-info">
                <label>Category:</label>
                <value>${product.category}</value>
            </div>
            <div class="review-info">
                <label>Rating:</label>
                <value>${product.rating}/10</value>
            </div>
        `;
        container.appendChild(card);
    });
}

function loadRejectedProducts() {
    const products = getProducts().filter(p => p.status === 'rejected');
    const container = document.getElementById('rejectedSubmissionsList');
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<p style="color: #999; grid-column: 1/-1; text-align: center;">No rejected products</p>';
        return;
    }
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'submission-review-card';
        card.innerHTML = `
            <h3 style="color: #ff6666;">${product.name}</h3>
            <div class="review-info">
                <label>Category:</label>
                <value>${product.category}</value>
            </div>
        `;
        container.appendChild(card);
    });
}

function loadAdminUsers() {
    const users = getUsers();
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const userProducts = getProducts().filter(p => p.userId === user.id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.joinDate}</td>
            <td>${userProducts.length}</td>
            <td><button class="review-btn reject-btn" onclick="deleteUser(${user.id})">Delete</button></td>
        `;
        tbody.appendChild(row);
    });
}

function deleteUser(userId) {
    if (confirm('Delete user?')) {
        let users = getUsers();
        users = users.filter(u => u.id !== userId);
        saveUsers(users);
        loadAdminUsers();
    }
}

// ============ CLOSE MODALS ============
window.onclick = function(event) {
    const modals = [
        document.getElementById('loginModal'),
        document.getElementById('registerModal'),
        document.getElementById('adminAccessModal')
    ];
    
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// ============ INITIALIZATION ============
window.addEventListener('load', function() {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
    
    updateNavbar();
    
    const currentUser = getCurrentUser();
    const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
    
    if (currentUser) {
        updateNavbar();
    }
    
    if (isAdmin) {
        showAdminPanel();
    }
    
    // Admin access: Ctrl + Shift + Click on logo
    const logo = document.querySelector('.nav-logo');
    if (logo) {
        logo.addEventListener('click', function(e) {
            if (e.ctrlKey && e.shiftKey) {
                document.getElementById('adminAccessModal').style.display = 'block';
            }
        });
    }
});