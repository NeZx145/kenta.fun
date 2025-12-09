// API Base URL
// For production, this will automatically use the current domain
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
    ? 'http://localhost:3000/api' 
    : window.location.origin + '/api';

// ============ LANGUAGE SYSTEM ============
let currentLanguage = 'en';

function showFormMsg(elId, msg, type = 'info') {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = msg;
    el.className = 'form-msg';
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
        element.textContent = element.getAttribute(`data-${lang}`) || element.getAttribute('data-en');
    });
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const langBtn = document.getElementById(`lang-${lang}`);
    if (langBtn) langBtn.classList.add('active');
}

// ============ AUTHENTICATION ============
let currentUser = null;

async function handleLogin(event) {
    event.preventDefault();
    
    const emailOrUsername = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Check if input is email or username
    const isEmail = emailOrUsername.includes('@');
    const loginData = isEmail 
        ? { email: emailOrUsername, password }
        : { username: emailOrUsername, password };
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            closeLoginModal();
            document.getElementById('loginForm').reset();
            updateNavbar();
            showFormMsg('loginMsg', 'Login successful!', 'success');
            setTimeout(() => {
                showFormMsg('loginMsg', '', 'info');
            }, 700);
        } else {
            showFormMsg('loginMsg', data.error || 'Invalid credentials!', 'error');
        }
    } catch (error) {
        showFormMsg('loginMsg', 'Connection error. Make sure server is running!', 'error');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;
    
    document.getElementById('usernameMsg').textContent = '';
    document.getElementById('emailMsg').textContent = '';
    document.getElementById('passwordMsg').textContent = '';
    
    if (password !== confirm) {
        document.getElementById('passwordMsg').textContent = 'Passwords don\'t match!';
        document.getElementById('passwordMsg').classList.add('msg-error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeRegisterModal();
            document.getElementById('registerForm').reset();
            showLoginModal();
            setTimeout(() => {
                showFormMsg('loginMsg', 'Account created! Please login.', 'success');
            }, 300);
        } else {
            if (data.error.includes('email')) {
                document.getElementById('emailMsg').textContent = data.error;
                document.getElementById('emailMsg').classList.add('msg-error');
            } else if (data.error.includes('username')) {
                document.getElementById('usernameMsg').textContent = data.error;
                document.getElementById('usernameMsg').classList.add('msg-error');
            } else {
                alert(data.error);
            }
        }
    } catch (error) {
        alert('Connection error. Make sure server is running!');
    }
}

// ============ PRODUCT SUBMISSION ============
function updateSubcategories() {
    const category = document.getElementById('websiteCategory').value;
    const subSelect = document.getElementById('productSubcategory');
    subSelect.innerHTML = '<option value="">Select subcategory</option>';
    
    if (category === 'spoofers') {
        subSelect.innerHTML += '<option value="permanent">Permanent</option><option value="temporary">Temporary</option>';
    } else if (category === 'tweaks') {
        subSelect.innerHTML += '<option value="optimize">PC Optimize</option>';
    } else if (category === 'cheats') {
        subSelect.innerHTML += '<option value="external">External</option><option value="internal">Internal</option>';
    }
}

function addPricingItem() {
    const container = document.getElementById('pricingContainer');
    const item = document.createElement('div');
    item.className = 'pricing-item';
    item.innerHTML = `
        <input type="text" class="pricing-duration" placeholder="e.g., 1 Day, 1 Week">
        <input type="text" class="pricing-price" placeholder="e.g., $10, $25">
        <button type="button" class="remove-pricing-btn" onclick="removePricingItem(this)">×</button>
    `;
    container.appendChild(item);
}

function removePricingItem(btn) {
    btn.parentElement.remove();
}

async function handleSubmitWebsite(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showFormMsg('submitWebsiteMsg', 'Please login first.', 'error');
        return;
    }
    
    const pricingItems = Array.from(document.querySelectorAll('.pricing-item')).map(item => {
        const duration = item.querySelector('.pricing-duration').value;
        const price = item.querySelector('.pricing-price').value;
        return duration && price ? { duration, price } : null;
    }).filter(Boolean);
    
    const productData = {
        userId: currentUser.id,
        name: document.getElementById('websiteName').value,
        category: document.getElementById('websiteCategory').value,
        subcategory: document.getElementById('productSubcategory').value,
        productType: document.getElementById('productType').value,
        game: document.getElementById('productGame').value,
        protection: document.getElementById('productProtection').value,
        store: document.getElementById('productStore').value,
        detectionStatus: document.getElementById('productDetectionStatus').value,
        description: document.getElementById('websiteDescription').value,
        rating: parseFloat(document.getElementById('productRating').value) || 0,
        dateFrom: document.getElementById('dateFrom').value,
        dateTo: document.getElementById('dateTo').value,
        pricing: pricingItems
    };
    
    try {
        let response;
        let isEdit = editingProductId !== null;
        
        if (isEdit) {
            // Update existing product
            response = await fetch(`${API_BASE}/products/${editingProductId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        } else {
            // Submit new product
            response = await fetch(`${API_BASE}/products/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        }
        
        const data = await response.json();
        
        if (data.success) {
            showFormMsg('submitWebsiteMsg', isEdit ? 'Product updated! Pending admin review.' : 'Product submitted successfully!', 'success');
            document.getElementById('submitWebsiteForm').reset();
            document.getElementById('pricingContainer').innerHTML = `
                <div class="pricing-item">
                    <input type="text" class="pricing-duration" placeholder="e.g., 1 Day, 1 Week">
                    <input type="text" class="pricing-price" placeholder="e.g., $10, $25">
                    <button type="button" class="remove-pricing-btn" onclick="removePricingItem(this)">×</button>
                </div>
            `;
            editingProductId = null;
            // Reset form title
            const formTitle = document.getElementById('submitFormTitle');
            const formDesc = document.getElementById('submitFormDesc');
            if (formTitle) {
                formTitle.setAttribute('data-en', 'Submit Your Product');
                formTitle.textContent = formTitle.getAttribute('data-en');
            }
            if (formDesc) {
                formDesc.setAttribute('data-en', 'Submit your product with all details');
                formDesc.textContent = formDesc.getAttribute('data-en');
            }
            loadUserSubmissions();
        } else {
            showFormMsg('submitWebsiteMsg', data.error || (isEdit ? 'Update failed!' : 'Submission failed!'), 'error');
        }
    } catch (error) {
        showFormMsg('submitWebsiteMsg', 'Connection error. Make sure server is running!', 'error');
    }
}

// ============ USER DASHBOARD ============
function showUserDashboard() {
    if (!currentUser) {
        showLoginModal();
        return;
    }
    
    // Redirect to user dashboard page
    window.location.href = 'user-dashboard.html';
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateNavbar();
    
    // If on dashboard page, redirect to home
    if (window.location.pathname.includes('user-dashboard.html')) {
        window.location.href = 'index.html';
    } else {
        // Reload to reset state
        setTimeout(() => location.reload(), 100);
    }
}

function closeUserDashboard() {
    // Not needed anymore - dashboard is on separate page
}

function showDashboardSection(section) {
    document.querySelectorAll('.dashboard-section').forEach(s => {
        s.classList.remove('active');
    });
    document.getElementById(section + '-section').classList.add('active');
    
    document.querySelectorAll('.dashboard-menu a').forEach(a => {
        a.classList.remove('menu-active');
    });
    
    // Update menu active state if called from menu
    if (event && event.target) {
        event.target.classList.add('menu-active');
    } else {
        // If called from button, find and activate corresponding menu item
        const menuItem = document.querySelector(`.dashboard-menu a[onclick*="${section}"]`);
        if (menuItem) {
            menuItem.classList.add('menu-active');
        }
    }
    
    if (section === 'my-submissions') {
        loadUserSubmissions();
    }
    
    return false;
}

async function loadUserProfile() {
    if (!currentUser) return;
    
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
    `;
}

async function loadUserSubmissions() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE}/products?userId=${currentUser.id}`);
        const products = await response.json();
        
        const container = document.getElementById('userSubmissionsList');
        container.innerHTML = '';
        
        if (products.length === 0) {
            container.innerHTML = '<p style="color: #999; text-align: center;">No submissions yet</p>';
            return;
        }
        
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'submission-card';
            const statusClass = `status-${product.status}`;
            const detectionClass = `status-${product.detectionStatus}`;
            
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <h4 style="color: #b10000; margin-bottom: 10px;">${product.name}</h4>
                        <p><strong>Category:</strong> ${product.category} ${product.subcategory ? '- ' + product.subcategory : ''}</p>
                        ${product.game ? `<p><strong>Game:</strong> ${product.game}</p>` : ''}
                        ${product.store ? `<p><strong>Store:</strong> ${product.store}</p>` : ''}
                    </div>
                    <div style="text-align: right;">
                        <span class="submission-status ${statusClass}">${product.status}</span>
                        <div class="detection-badge ${detectionClass}" style="margin-top: 5px; display: inline-block;">${product.detectionStatus}</div>
                    </div>
                </div>
                ${product.rating > 0 ? `<p><strong>Rating:</strong> ⭐ ${product.rating}/10</p>` : ''}
                ${product.pricing && product.pricing.length > 0 ? `
                    <p><strong>Pricing:</strong> ${product.pricing.map(p => `${p.duration}: ${p.price}`).join(', ')}</p>
                ` : ''}
                <p style="font-size: 12px; color: #888; margin-top: 10px;">Submitted: ${product.submittedDate}</p>
                <div class="product-actions" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #333; display: flex; gap: 10px; flex-wrap: wrap;">
                    ${product.status === 'approved' ? `
                        <button class="edit-product-btn" onclick="editProduct(${product.id})" data-en="Edit" data-ar="تعديل" data-tr="Düzenle">Edit</button>
                        <button class="delete-product-btn" onclick="requestDeleteProduct(${product.id})" data-en="Request Delete" data-ar="طلب حذف" data-tr="Silme İste">Request Delete</button>
                    ` : product.status === 'pending' ? `
                        <button class="edit-product-btn" onclick="editProduct(${product.id})" disabled data-en="Edit (Pending Review)" data-ar="تعديل (قيد المراجعة)" data-tr="Düzenle (İncelemede)">Edit (Pending Review)</button>
                    ` : `
                        <button class="edit-product-btn" onclick="editProduct(${product.id})" disabled data-en="Edit (Rejected)" data-ar="تعديل (مرفوض)" data-tr="Düzenle (Reddedildi)">Edit (Rejected)</button>
                    `}
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading submissions:', error);
    }
}

// ============ ADMIN PANEL ============
function generateAndShowAdminCode() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('adminAccessCode', code);
    localStorage.setItem('adminAccessCodeExpiry', (Date.now() + 5 * 60 * 1000).toString());
    console.log('%c⚠️ ADMIN CODE: ' + code + ' (expires in 5 minutes)', 'background:#222;color:#ffcc00;padding:4px 8px;font-weight:bold');
    document.getElementById('adminAccessModal').style.display = 'block';
}

async function handleAdminAccess(event) {
    event.preventDefault();
    
    const code = document.getElementById('adminAccessCode').value;
    const savedCode = localStorage.getItem('adminAccessCode');
    const expiry = parseInt(localStorage.getItem('adminAccessCodeExpiry') || '0', 10);
    
    if (expiry && Date.now() > expiry) {
        alert('Admin code expired. Please generate a new code.');
        return;
    }
    
    if (code === 'ZxCvBn' || code === savedCode) {
        localStorage.setItem('adminLoggedIn', 'true');
        closeAdminAccessModal();
        showAdminPanel();
    } else {
        alert('Invalid admin code!');
    }
}

function closeAdminAccessModal() {
    document.getElementById('adminAccessModal').style.display = 'none';
}

function showAdminPanel() {
    // Check if we're on admin.html or index.html
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.classList.add('active');
        loadAdminData();
    } else {
        // Redirect to admin.html
        window.location.href = 'admin.html';
    }
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
    
    if (section === 'pending') loadPendingProducts();
    else if (section === 'approved') loadApprovedProducts();
    else if (section === 'rejected') loadRejectedProducts();
    else if (section === 'users') loadAdminUsers();
    else if (section === 'stats') loadAdminStats();
    
    return false;
}

async function loadAdminData() {
    loadPendingProducts();
    loadApprovedProducts();
    loadRejectedProducts();
    loadAdminUsers();
    loadAdminStats();
}

async function loadPendingProducts() {
    try {
        const response = await fetch(`${API_BASE}/products?status=pending`);
        const products = await response.json();
        
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
                    <value>${product.username || 'Unknown'}</value>
                </div>
                <div class="review-info">
                    <label>Category:</label>
                    <value>${product.category} - ${product.subcategory || ''}</value>
                </div>
                ${product.game ? `<div class="review-info"><label>Game:</label><value>${product.game}</value></div>` : ''}
                ${product.protection ? `<div class="review-info"><label>Protection:</label><value>${product.protection}</value></div>` : ''}
                ${product.store ? `<div class="review-info"><label>Store:</label><value>${product.store}</value></div>` : ''}
                <div class="review-info">
                    <label>Detection Status:</label>
                    <value><span class="detection-badge status-${product.detectionStatus}">${product.detectionStatus}</span></value>
                </div>
                <div class="review-actions">
                    <button class="review-btn approve-btn" onclick="approveProduct(${product.id})">Approve</button>
                    <button class="review-btn reject-btn" onclick="rejectProduct(${product.id})">Reject</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading pending products:', error);
    }
}

async function loadApprovedProducts() {
    try {
        const response = await fetch(`${API_BASE}/products?status=approved`);
        const products = await response.json();
        
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
                    <value>${product.category} - ${product.subcategory || ''}</value>
                </div>
                <div class="review-info">
                    <label>Detection Status:</label>
                    <value>
                        <select class="status-select" onchange="updateProductStatus(${product.id}, this.value)">
                            <option value="testing" ${product.detectionStatus === 'testing' ? 'selected' : ''}>Testing (Yellow)</option>
                            <option value="undiscovered" ${product.detectionStatus === 'undiscovered' ? 'selected' : ''}>Undiscovered (Green)</option>
                            <option value="discovered" ${product.detectionStatus === 'discovered' ? 'selected' : ''}>Discovered (Red)</option>
                        </select>
                    </value>
                </div>
                ${product.game ? `<div class="review-info"><label>Game:</label><value>${product.game}</value></div>` : ''}
                ${product.store ? `<div class="review-info"><label>Store:</label><value>${product.store}</value></div>` : ''}
                ${product.pricing && product.pricing.length > 0 ? `
                    <div class="review-info">
                        <label>Pricing:</label>
                        <value>${product.pricing.map(p => `${p.duration}: ${p.price}`).join(', ')}</value>
                    </div>
                ` : ''}
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading approved products:', error);
    }
}

async function loadRejectedProducts() {
    try {
        const response = await fetch(`${API_BASE}/products?status=rejected`);
        const products = await response.json();
        
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
    } catch (error) {
        console.error('Error loading rejected products:', error);
    }
}

async function approveProduct(productId) {
    if (confirm('Approve this product?')) {
        try {
            const response = await fetch(`${API_BASE}/admin/approve/${productId}`, {
                method: 'POST'
            });
            const data = await response.json();
            if (data.success) {
                loadAdminData();
            }
        } catch (error) {
            alert('Error approving product');
        }
    }
}

async function rejectProduct(productId) {
    if (confirm('Reject this product?')) {
        try {
            const response = await fetch(`${API_BASE}/admin/reject/${productId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: '' })
            });
            const data = await response.json();
            if (data.success) {
                loadAdminData();
            }
        } catch (error) {
            alert('Error rejecting product');
        }
    }
}

async function updateProductStatus(productId, status) {
    try {
        const response = await fetch(`${API_BASE}/admin/update-status/${productId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ detectionStatus: status })
        });
        const data = await response.json();
        if (data.success) {
            loadApprovedProducts();
        }
    } catch (error) {
        alert('Error updating status');
    }
}

async function loadAdminUsers() {
    try {
        const response = await fetch(`${API_BASE}/admin/users`);
        const users = await response.json();
        
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.joinDate}</td>
                <td>${user.submissionCount || 0}</td>
                <td><button class="review-btn reject-btn" onclick="deleteUser(${user.id})">Delete</button></td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function loadAdminStats() {
    try {
        const response = await fetch(`${API_BASE}/admin/stats`);
        const stats = await response.json();
        
        document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
        document.getElementById('totalPending').textContent = stats.pending || 0;
        document.getElementById('totalApproved').textContent = stats.approved || 0;
        document.getElementById('totalRejected').textContent = stats.rejected || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function deleteUser(userId) {
    if (confirm('Delete user?')) {
        alert('User deletion not implemented in API yet');
    }
}

// ============ PRODUCT EDITING ============
let editingProductId = null;

async function editProduct(productId) {
    if (!currentUser) {
        alert('Please login first');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`);
        const product = await response.json();
        
        // Check if user owns the product
        if (product.userId !== currentUser.id) {
            alert('You can only edit your own products');
            return;
        }
        
        editingProductId = productId;
        
        // Update form title
        const formTitle = document.getElementById('submitFormTitle');
        const formDesc = document.getElementById('submitFormDesc');
        if (formTitle) formTitle.textContent = 'Edit Product';
        if (formDesc) formDesc.textContent = 'Edit your product details. Changes require admin review.';
        
        // Fill form with product data
        document.getElementById('websiteName').value = product.name;
        document.getElementById('websiteCategory').value = product.category;
        updateSubcategories();
        setTimeout(() => {
            document.getElementById('productSubcategory').value = product.subcategory || '';
            document.getElementById('productType').value = product.productType || '';
            document.getElementById('productGame').value = product.game || '';
            document.getElementById('productProtection').value = product.protection || '';
            document.getElementById('productStore').value = product.store || '';
            document.getElementById('productDetectionStatus').value = product.detectionStatus || 'testing';
            document.getElementById('websiteDescription').value = product.description || '';
            document.getElementById('productRating').value = product.rating || 0;
            document.getElementById('dateFrom').value = product.dateFrom || '';
            document.getElementById('dateTo').value = product.dateTo || '';
            
            // Fill pricing
            const pricingContainer = document.getElementById('pricingContainer');
            pricingContainer.innerHTML = '';
            if (product.pricing && product.pricing.length > 0) {
                product.pricing.forEach(p => {
                    const item = document.createElement('div');
                    item.className = 'pricing-item';
                    item.innerHTML = `
                        <input type="text" class="pricing-duration" value="${p.duration}" placeholder="e.g., 1 Day, 1 Week">
                        <input type="text" class="pricing-price" value="${p.price}" placeholder="e.g., $10, $25">
                        <button type="button" class="remove-pricing-btn" onclick="removePricingItem(this)">×</button>
                    `;
                    pricingContainer.appendChild(item);
                });
            } else {
                addPricingItem();
            }
        }, 100);
        
        // Show dashboard and submissions section
        showUserDashboard();
        showDashboardSection('submissions');
        
        // Scroll to form
        setTimeout(() => {
            document.getElementById('submitWebsiteForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
        
    } catch (error) {
        console.error('Error loading product:', error);
        alert('Error loading product');
    }
}

async function requestDeleteProduct(productId) {
    if (!currentUser) {
        alert('Please login first');
        return;
    }
    
    if (!confirm('Request deletion of this product? It will be reviewed by admin.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/products/${productId}/delete-request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Deletion request submitted. Pending admin review.');
            loadUserSubmissions();
        } else {
            alert(data.error || 'Error requesting deletion');
        }
    } catch (error) {
        console.error('Error requesting deletion:', error);
        alert('Error requesting deletion');
    }
}

// ============ NAVIGATION ============
function updateNavbar() {
    const userDropdown = document.getElementById('userDropdown');
    const userBtn = document.getElementById('userNavBtn');
    const submitBtn = document.getElementById('submitNowBtn');
    const browseDropdown = document.getElementById('browseDropdown');
    const loginBtn = document.getElementById('loginNavBtn');
    const registerBtn = document.getElementById('registerNavBtn');
    
    if (currentUser) {
        // Show user dropdown
        if (userDropdown) {
            userDropdown.style.display = 'block';
        }
        if (userBtn) {
            userBtn.style.display = 'inline-block';
            userBtn.textContent = currentUser.username;
        }
        // Show submit button
        if (submitBtn) {
            submitBtn.style.display = 'inline-block';
        }
        // Hide browse dropdown
        if (browseDropdown) {
            browseDropdown.style.display = 'none';
        }
        // Hide login/register
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
    } else {
        // Hide user dropdown
        if (userDropdown) {
            userDropdown.style.display = 'none';
        }
        if (userBtn) userBtn.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'none';
        // Show browse dropdown
        if (browseDropdown) {
            browseDropdown.style.display = 'block';
        }
        // Show login/register
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (registerBtn) registerBtn.style.display = 'inline-block';
    }
}

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

// ============ CATEGORY DISPLAY ============
async function showCategory(category, subcategory) {
    // Hide home section, show category section
    document.getElementById('homeSection').classList.add('hidden');
    document.getElementById('categorySection').style.display = 'block';
    document.getElementById('productSection').style.display = 'none';
    
    const categoryNames = {
        spoofers: { permanent: 'Permanent Spoofers', temporary: 'Temporary Spoofers' },
        cheats: { external: 'External Cheats', internal: 'Internal Cheats' },
        tweaks: { optimize: 'PC Optimize' }
    };
    
    document.getElementById('categoryTitle').textContent = categoryNames[category]?.[subcategory] || `${category} - ${subcategory}`;
    
    try {
        const response = await fetch(`${API_BASE}/products?status=approved&category=${category}`);
        const allProducts = await response.json();
        
        // Filter by subcategory
        const products = allProducts.filter(p => p.subcategory === subcategory);
        
        const grid = document.getElementById('categoriesGrid');
        grid.innerHTML = '';
        
        if (products.length === 0) {
            grid.innerHTML = '<p style="color: #999; grid-column: 1/-1; text-align: center; padding: 40px;">No products available in this category yet.</p>';
            return;
        }
        
        // Sort products by rating (best to worst)
        products.sort((a, b) => {
            const ratingA = a.rating || 0;
            const ratingB = b.rating || 0;
            return ratingB - ratingA; // Descending order
        });
        
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.onclick = () => {
                window.location.href = `product.html?id=${product.id}`;
            };
            
            const statusColors = {
                testing: '#ffaa00',
                undiscovered: '#00ff88',
                discovered: '#ff5555'
            };
            const statusColor = statusColors[product.detectionStatus] || '#ffaa00';
            
            card.innerHTML = `
                <h3>${product.name}</h3>
                ${product.game ? `<p style="color: #b10000; font-weight: bold; margin: 5px 0;">🎮 ${product.game}</p>` : ''}
                ${product.protection ? `<p style="color: #888; font-size: 14px; margin: 5px 0;">🛡️ ${product.protection}</p>` : ''}
                ${product.store ? `<p style="color: #b10000; font-size: 16px; font-weight: bold; margin: 10px 0; padding: 8px; background: rgba(177, 0, 0, 0.15); border-radius: 6px; border: 1px solid #b10000;">🏪 ${product.store}</p>` : ''}
                <div class="detection-status" style="background: ${statusColor}; margin: 10px 0;">
                    ${product.detectionStatus}
                </div>
                ${product.rating > 0 ? `<div class="product-rating"><span class="rating-stars">⭐ ${product.rating}/10</span></div>` : ''}
                ${product.pricing && product.pricing.length > 0 ? `
                    <div style="margin-top: 10px;">
                        <strong style="color: #b10000; font-size: 12px;">Prices:</strong>
                        <p style="color: #e60000; font-size: 14px; margin-top: 5px;">
                            ${product.pricing.slice(0, 2).map(p => `${p.duration}: ${p.price}`).join(' | ')}
                        </p>
                    </div>
                ` : ''}
                <p style="color: #999; font-size: 12px; margin-top: 10px;">Click to view details</p>
            `;
            
            grid.appendChild(card);
        });
        
        window.scrollTo(0, 0);
    } catch (error) {
        console.error('Error loading category:', error);
        document.getElementById('categoriesGrid').innerHTML = '<p style="color: #ff6666; text-align: center;">Error loading products. Make sure server is running.</p>';
    }
}

async function showProductDetails(productId) {
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`);
        const product = await response.json();
        
        document.getElementById('homeSection').classList.add('hidden');
        document.getElementById('categorySection').style.display = 'none';
        document.getElementById('productSection').style.display = 'block';
        
        const statusColors = {
            testing: '#ffaa00',
            undiscovered: '#00ff88',
            discovered: '#ff5555'
        };
        const statusColor = statusColors[product.detectionStatus] || '#ffaa00';
        
        const details = document.getElementById('productDetails');
        details.innerHTML = `
            <div class="product-card">
                <div class="product-header-info">
                    <div>
                        <h1 class="product-title">${product.name}</h1>
                        ${product.rating > 0 ? `<div class="product-rating"><span class="rating-stars">⭐ ${product.rating}/10</span></div>` : ''}
                    </div>
                    <div class="detection-status" style="background: ${statusColor};">
                        ${product.detectionStatus}
                    </div>
                </div>
                
                <div class="product-meta">
                    <div class="meta-item">
                        <div class="meta-label">CATEGORY</div>
                        <div class="meta-value">${product.category}</div>
                    </div>
                    ${product.subcategory ? `
                    <div class="meta-item">
                        <div class="meta-label">SUBCATEGORY</div>
                        <div class="meta-value">${product.subcategory}</div>
                    </div>
                    ` : ''}
                    ${product.game ? `
                    <div class="meta-item">
                        <div class="meta-label">GAME</div>
                        <div class="meta-value">${product.game}</div>
                    </div>
                    ` : ''}
                    ${product.protection ? `
                    <div class="meta-item">
                        <div class="meta-label">PROTECTION</div>
                        <div class="meta-value">${product.protection}</div>
                    </div>
                    ` : ''}
                    ${product.store ? `
                    <div class="meta-item">
                        <div class="meta-label">STORE</div>
                        <div class="meta-value">${product.store}</div>
                    </div>
                    ` : ''}
                </div>
                
                ${product.description ? `
                <div class="product-description">
                    <strong>Description:</strong><br><br>
                    ${product.description}
                </div>
                ` : ''}
                
                ${product.pricing && product.pricing.length > 0 ? `
                <div>
                    <strong style="color: #b10000; display: block; margin-bottom: 10px;">PRICING:</strong>
                    <div class="product-prices">
                        ${product.pricing.map(p => `<div class="price-item">${p.duration}<br>${p.price}</div>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${product.dateFrom && product.dateTo ? `
                <div style="margin-top: 20px; padding: 15px; background: rgba(177, 0, 0, 0.1); border-radius: 8px;">
                    <strong style="color: #b10000;">Valid Period:</strong>
                    <p style="color: #ccc; margin-top: 5px;">From: ${product.dateFrom} To: ${product.dateTo}</p>
                </div>
                ` : ''}
            </div>
        `;
        
        window.scrollTo(0, 0);
    } catch (error) {
        console.error('Error loading product:', error);
        alert('Error loading product details');
    }
}

function goBackCategory() {
    document.getElementById('productSection').style.display = 'none';
    document.getElementById('categorySection').style.display = 'block';
    window.scrollTo(0, 0);
}

function goHome() {
    document.getElementById('homeSection').classList.remove('hidden');
    document.getElementById('categorySection').style.display = 'none';
    document.getElementById('productSection').style.display = 'none';
    window.scrollTo(0, 0);
}

// ============ BEST PRODUCTS ============
async function loadBestProducts() {
    try {
        const response = await fetch(`${API_BASE}/products?status=approved`);
        const products = await response.json();
        
        const grid = document.getElementById('bestProductsGrid');
        grid.innerHTML = '';
        
        // Get best Cheat
        const cheats = products.filter(p => p.category === 'cheats');
        const bestCheat = getBestProduct(cheats);
        
        // Get best Spoofer
        const spoofers = products.filter(p => p.category === 'spoofers');
        const bestSpoofer = getBestProduct(spoofers);
        
        if (bestCheat) {
            const card = createBestProductCard(bestCheat, 'cheats');
            grid.appendChild(card);
        }
        
        if (bestSpoofer) {
            const card = createBestProductCard(bestSpoofer, 'spoofers');
            grid.appendChild(card);
        }
        
        if (grid.innerHTML === '') {
            grid.innerHTML = '<p style="color: #999; text-align: center; grid-column: 1/-1; padding: 40px;">No products available yet. Submit products to see the best ones!</p>';
        }
    } catch (error) {
        console.error('Error loading best products:', error);
    }
}

function getBestProduct(products) {
    if (products.length === 0) return null;
    
    // Score products based on: Rating (40%), Price (30%), Safety (30%)
    const scored = products.map(product => {
        let score = 0;
        
        // Rating score (0-40 points)
        const rating = product.rating || 0;
        score += (rating / 10) * 40;
        
        // Price score (0-30 points) - lower price = higher score
        let priceScore = 30;
        if (product.pricing && product.pricing.length > 0) {
            const prices = product.pricing.map(p => {
                const priceStr = p.price.replace(/[^0-9.]/g, '');
                return parseFloat(priceStr) || 999999;
            });
            const minPrice = Math.min(...prices);
            // Normalize: $0-50 = 30pts, $50-100 = 20pts, $100-200 = 10pts, $200+ = 5pts
            if (minPrice <= 50) priceScore = 30;
            else if (minPrice <= 100) priceScore = 20;
            else if (minPrice <= 200) priceScore = 10;
            else priceScore = 5;
        }
        score += priceScore;
        
        // Safety score (0-30 points)
        const safetyScores = {
            'undiscovered': 30,
            'testing': 15,
            'discovered': 5
        };
        score += safetyScores[product.detectionStatus] || 10;
        
        return { product, score };
    });
    
    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);
    
    return scored[0].product;
}

function createBestProductCard(product, category) {
    const card = document.createElement('div');
    card.className = 'best-product-card';
    card.onclick = () => {
        window.location.href = `product.html?id=${product.id}`;
    };
    
    const statusColors = {
        testing: '#ffaa00',
        undiscovered: '#00ff88',
        discovered: '#ff5555'
    };
    const statusColor = statusColors[product.detectionStatus] || '#ffaa00';
    
    const categoryNames = {
        cheats: { en: 'Best Cheat', ar: 'أفضل هاك', tr: 'En İyi Hile' },
        spoofers: { en: 'Best Spoofer', ar: 'أفضل سبوفر', tr: 'En İyi Spoofer' }
    };
    
    const categoryName = categoryNames[category] || { en: 'Best Product', ar: 'أفضل منتج', tr: 'En İyi Ürün' };
    
    const minPrice = product.pricing && product.pricing.length > 0
        ? product.pricing.reduce((min, p) => {
            const price = parseFloat(p.price.replace(/[^0-9.]/g, '')) || 999999;
            return price < min ? price : min;
        }, 999999)
        : null;
    
    card.innerHTML = `
        <div class="best-product-badge">
            <span class="badge-text" data-en="${categoryName.en}" data-ar="${categoryName.ar}" data-tr="${categoryName.tr}">${categoryName.en}</span>
        </div>
        <h3>${product.name}</h3>
        ${product.game ? `<p class="best-product-game">🎮 ${product.game}</p>` : ''}
        ${product.store ? `<p class="best-product-store">🏪 ${product.store}</p>` : ''}
        
        <div class="best-product-stats">
            <div class="stat-item">
                <div class="stat-icon">⚡</div>
                <div class="stat-content">
                    <div class="stat-label" data-en="Performance" data-ar="الأداء" data-tr="Performans">Performance</div>
                    <div class="stat-value">${product.rating || 0}/10</div>
                </div>
            </div>
            <div class="stat-item">
                <div class="stat-icon">💰</div>
                <div class="stat-content">
                    <div class="stat-label" data-en="Price" data-ar="السعر" data-tr="Fiyat">Price</div>
                    <div class="stat-value">${minPrice ? '$' + minPrice : 'N/A'}</div>
                </div>
            </div>
            <div class="stat-item">
                <div class="stat-icon">🛡️</div>
                <div class="stat-content">
                    <div class="stat-label" data-en="Safety" data-ar="الأمان" data-tr="Güvenlik">Safety</div>
                    <div class="stat-value" style="color: ${statusColor};">${product.detectionStatus}</div>
                </div>
            </div>
        </div>
        
        <div class="detection-status" style="background: ${statusColor}; margin-top: 15px;">
            ${product.detectionStatus}
        </div>
        
        ${product.pricing && product.pricing.length > 0 ? `
            <div class="best-product-pricing">
                <strong style="color: #b10000; font-size: 14px; display: block; margin-top: 15px;">Pricing:</strong>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
                    ${product.pricing.slice(0, 3).map(p => `
                        <span style="background: rgba(177, 0, 0, 0.2); padding: 5px 10px; border-radius: 5px; font-size: 12px; border: 1px solid #b10000;">
                            ${p.duration}: ${p.price}
                        </span>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        <button class="view-product-btn" data-en="View Details" data-ar="عرض التفاصيل" data-tr="Detayları Görüntüle">View Details</button>
    `;
    
    return card;
}

// ============ TOP STORES ============
async function loadTopStores() {
    try {
        const response = await fetch(`${API_BASE}/products?status=approved`);
        const products = await response.json();
        
        // Group by category and get top stores
        const categories = ['spoofers', 'cheats', 'tweaks'];
        const grid = document.getElementById('topStoresGrid');
        grid.innerHTML = '';
        
        categories.forEach(category => {
            const categoryProducts = products.filter(p => p.category === category);
            if (categoryProducts.length === 0) return;
            
            // Get unique stores and count
            const storeCounts = {};
            categoryProducts.forEach(p => {
                if (p.store) {
                    storeCounts[p.store] = (storeCounts[p.store] || 0) + 1;
                }
            });
            
            // Get top 3 stores
            const topStores = Object.entries(storeCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([store]) => store);
            
            if (topStores.length === 0) return;
            
            const categoryCard = document.createElement('div');
            categoryCard.className = 'store-category-card';
            categoryCard.innerHTML = `
                <h3 style="color: #b10000; margin-bottom: 15px; text-transform: uppercase;">${category}</h3>
                <div class="stores-list">
                    ${topStores.map(store => {
                        const storeProducts = categoryProducts.filter(p => p.store === store);
                        const avgRating = storeProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / storeProducts.length;
                        return `
                            <div class="store-item">
                                <div class="store-name">🏪 ${store}</div>
                                <div class="store-stats">
                                    <span>${storeProducts.length} products</span>
                                    ${avgRating > 0 ? `<span>⭐ ${avgRating.toFixed(1)}/10</span>` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            grid.appendChild(categoryCard);
        });
        
        if (grid.innerHTML === '') {
            grid.innerHTML = '<p style="color: #999; text-align: center; grid-column: 1/-1; padding: 40px;">No stores available yet. Submit products to see top stores!</p>';
        }
    } catch (error) {
        console.error('Error loading top stores:', error);
    }
}

// ============ INITIALIZATION ============
window.addEventListener('load', function() {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
    
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    
    updateNavbar();
    loadTopStores();
    loadBestProducts();
    
    const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
    if (isAdmin) {
        showAdminPanel();
    }
    
    const logo = document.querySelector('.nav-logo');
    if (logo) {
        logo.addEventListener('click', function(e) {
            if (e.ctrlKey && e.shiftKey) {
                generateAndShowAdminCode();
            }
        });
    }
});

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

