// ============= LANGUAGE SYSTEM =============
const translations = {
    en: {},
    ar: {},
    tr: {}
};

let currentLanguage = 'en';

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    
    document.documentElement.lang = lang;
    if (lang === 'ar') {
        document.documentElement.dir = 'rtl';
    } else {
        document.documentElement.dir = 'ltr';
    }
    
    // Update all text elements with data attributes
    document.querySelectorAll('[data-en][data-ar][data-tr]').forEach(element => {
        element.textContent = element.getAttribute(`data-${lang}`);
    });
    
    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`lang-${lang}`).classList.add('active');
}

// Initialize language from localStorage
window.addEventListener('load', function() {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
});

// ============= LOCAL STORAGE MANAGEMENT =============
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getSubmissions() {
    return JSON.parse(localStorage.getItem('submissions')) || [];
}

function saveSubmissions(submissions) {
    localStorage.setItem('submissions', JSON.stringify(submissions));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser')) || null;
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Generate 6-digit verification code
function generateAdminCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============= LOGIN & REGISTER MODALS =============
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

// ============= LOGIN HANDLER =============
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
        showUserDashboard();
        alert('Login successful! Welcome ' + user.username);
    } else {
        alert('Invalid email or password!');
    }
}

// ============= REGISTER HANDLER =============
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
        document.getElementById('usernameMsg').textContent = 'Username must be at least 3 characters';
        isValid = false;
    }
    
    const users = getUsers();
    if (users.find(u => u.username === username)) {
        document.getElementById('usernameMsg').textContent = 'Username already exists!';
        isValid = false;
    }
    
    if (users.find(u => u.email === email)) {
        document.getElementById('emailMsg').textContent = 'Email already registered!';
        isValid = false;
    }
    
    if (password.length < 6) {
        document.getElementById('passwordMsg').textContent = 'Password must be at least 6 characters';
        isValid = false;
    }
    
    if (password !== confirm) {
        document.getElementById('passwordMsg').textContent = 'Passwords do not match!';
        isValid = false;
    }
    
    if (!isValid) return;
    
    const newUser = {
        id: Date.now(),
        username: username,
        email: email,
        password: password,
        joinDate: new Date().toLocaleDateString(),
        status: 'Active'
    };
    
    users.push(newUser);
    saveUsers(users);
    
    alert('Account created successfully! You can now login.');
    closeRegisterModal();
    document.getElementById('registerForm').reset();
    showLoginModal();
}

// ============= USER DASHBOARD =============
function showUserDashboard() {
    document.querySelector('nav').style.display = 'none';
    document.querySelector('header').style.display = 'none';
    document.querySelector('.welcome-section').style.display = 'none';
    document.querySelector('.sections-container').style.display = 'none';
    
    document.getElementById('userDashboard').classList.add('active');
    
    loadUserSubmissions();
    loadUserProfile();
}

function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        location.reload();
    }
}

function showDashboardSection(sectionName) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(sectionName + '-section').classList.add('active');
    
    document.querySelectorAll('.dashboard-menu a').forEach(link => {
        link.classList.remove('menu-active');
    });
    event.target.classList.add('menu-active');
    
    return false;
}

// ============= SUBMIT WEBSITE =============
function handleSubmitWebsite(event) {
    event.preventDefault();
    
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const submission = {
        id: Date.now(),
        userId: currentUser.id,
        username: currentUser.username,
        name: document.getElementById('websiteName').value,
        url: document.getElementById('websiteUrl').value,
        category: document.getElementById('websiteCategory').value,
        description: document.getElementById('websiteDescription').value,
        features: document.getElementById('websiteFeatures').value,
        price: document.getElementById('websitePrice').value,
        status: 'pending',
        submittedDate: new Date().toLocaleDateString(),
        rejectionReason: ''
    };
    
    const submissions = getSubmissions();
    submissions.push(submission);
    saveSubmissions(submissions);
    
    alert('Website submitted successfully! Wait for admin approval.');
    document.getElementById('submitWebsiteForm').reset();
    loadUserSubmissions();
}

function loadUserSubmissions() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const submissions = getSubmissions();
    const userSubmissions = submissions.filter(s => s.userId === currentUser.id);
    const container = document.getElementById('userSubmissionsList');
    
    container.innerHTML = '';
    
    if (userSubmissions.length === 0) {
        container.innerHTML = '<p style="color: #bbb; grid-column: 1/-1; text-align: center;">No submissions yet. Start by submitting your first website!</p>';
        return;
    }
    
    userSubmissions.forEach(submission => {
        const statusClass = `status-${submission.status}`;
        const card = document.createElement('div');
        card.className = 'submission-card';
        card.innerHTML = `
            <h4>${submission.name}</h4>
            <span class="submission-status ${statusClass}">${submission.status.toUpperCase()}</span>
            <p><strong>Category:</strong> ${submission.category}</p>
            <p><strong>URL:</strong> ${submission.url}</p>
            <p><strong>Description:</strong> ${submission.description}</p>
            <p><strong>Submitted:</strong> ${submission.submittedDate}</p>
            ${submission.rejectionReason ? `<p style="color: #ff6666;"><strong>Rejection Reason:</strong> ${submission.rejectionReason}</p>` : ''}
        `;
        container.appendChild(card);
    });
}

function loadUserProfile() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const submissions = getSubmissions();
    const userSubmissions = submissions.filter(s => s.userId === currentUser.id);
    
    const container = document.getElementById('userProfileInfo');
    container.innerHTML = `
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
            <div class="profile-info-label">Total Submissions:</div>
            <div class="profile-info-value">${userSubmissions.length}</div>
        </div>
        <div class="profile-info-item">
            <div class="profile-info-label">Approved:</div>
            <div class="profile-info-value" style="color: #00ff00;">${userSubmissions.filter(s => s.status === 'approved').length}</div>
        </div>
        <div class="profile-info-item">
            <div class="profile-info-label">Pending:</div>
            <div class="profile-info-value" style="color: #ffd700;">${userSubmissions.filter(s => s.status === 'pending').length}</div>
        </div>
        <div class="profile-info-item">
            <div class="profile-info-label">Rejected:</div>
            <div class="profile-info-value" style="color: #ff6666;">${userSubmissions.filter(s => s.status === 'rejected').length}</div>
        </div>
    `;
}

// ============= ADMIN VERIFICATION =============
function closeAdminVerificationModal() {
    document.getElementById('adminVerificationModal').style.display = 'none';
}

let adminVerificationCode = '';

function openAdminAccess() {
    adminVerificationCode = generateAdminCode();
    localStorage.setItem('adminCode', adminVerificationCode);
    localStorage.setItem('adminCodeTime', Date.now().toString());
    
    console.log('%c⚠️ ADMIN CODE: ' + adminVerificationCode, 'color: red; font-size: 16px; font-weight: bold;');
    
    document.getElementById('adminVerificationModal').style.display = 'block';
}

function handleAdminVerification(event) {
    event.preventDefault();
    
    const enteredCode = document.getElementById('adminCode').value;
    const storedCode = localStorage.getItem('adminCode');
    const codeTime = parseInt(localStorage.getItem('adminCodeTime'));
    const currentTime = Date.now();
    
    // Code expires after 5 minutes
    if (currentTime - codeTime > 5 * 60 * 1000) {
        alert('Code expired! Please try again.');
        closeAdminVerificationModal();
        return;
    }
    
    if (enteredCode === storedCode) {
        localStorage.setItem('adminLoggedIn', 'true');
        closeAdminVerificationModal();
        document.getElementById('adminVerificationForm').reset();
        showAdminPanel();
    } else {
        alert('Invalid code! Please try again.');
    }
}

// ============= ADMIN PANEL =============
function showAdminPanel() {
    document.querySelector('nav').style.display = 'none';
    document.querySelector('header').style.display = 'none';
    document.querySelector('.welcome-section').style.display = 'none';
    document.querySelector('.sections-container').style.display = 'none';
    
    document.getElementById('adminPanel').classList.add('active');
    
    loadPendingSubmissions();
    loadApprovedSubmissions();
    loadRejectedSubmissions();
    loadAdminUsers();
    loadAdminStatistics();
}

function logoutAdmin() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminLoggedIn');
        location.reload();
    }
}

function showAdminSection(sectionName) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(sectionName + '-section').classList.add('active');
    
    document.querySelectorAll('.admin-menu a').forEach(link => {
        link.classList.remove('menu-active');
    });
    event.target.classList.add('menu-active');
    
    return false;
}

// ============= LOAD PENDING SUBMISSIONS =============
function loadPendingSubmissions() {
    const submissions = getSubmissions();
    const pending = submissions.filter(s => s.status === 'pending');
    const container = document.getElementById('pendingSubmissionsList');
    
    container.innerHTML = '';
    
    if (pending.length === 0) {
        container.innerHTML = '<p style="color: #bbb; grid-column: 1/-1; text-align: center;">No pending submissions</p>';
        return;
    }
    
    pending.forEach(submission => {
        const card = document.createElement('div');
        card.className = 'submission-review-card';
        card.innerHTML = `
            <h3>${submission.name}</h3>
            <div class="review-info">
                <label>Submitted by:</label>
                <value>${submission.username}</value>
            </div>
            <div class="review-info">
                <label>Category:</label>
                <value>${submission.category}</value>
            </div>
            <div class="review-info">
                <label>URL:</label>
                <value><a href="${submission.url}" target="_blank" style="color: #b10000;">${submission.url}</a></value>
            </div>
            <div class="review-info">
                <label>Description:</label>
                <value>${submission.description}</value>
            </div>
            <div class="review-info">
                <label>Features:</label>
                <value>${submission.features || 'N/A'}</value>
            </div>
            <div class="review-info">
                <label>Price:</label>
                <value>${submission.price || 'Free'}</value>
            </div>
            <div class="review-info">
                <label>Submitted Date:</label>
                <value>${submission.submittedDate}</value>
            </div>
            <div class="review-actions">
                <button class="review-btn approve-btn" onclick="approveSubmission(${submission.id})">Approve</button>
                <button class="review-btn reject-btn" onclick="showRejectionReason(${submission.id})">Reject</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// ============= APPROVE SUBMISSION =============
function approveSubmission(submissionId) {
    if (confirm('Are you sure you want to approve this submission?')) {
        const submissions = getSubmissions();
        const submission = submissions.find(s => s.id === submissionId);
        if (submission) {
            submission.status = 'approved';
            saveSubmissions(submissions);
            loadPendingSubmissions();
            loadApprovedSubmissions();
            loadAdminStatistics();
            alert('Submission approved!');
        }
    }
}

// ============= REJECTION REASON =============
let rejectingSubmissionId = null;

function showRejectionReason(submissionId) {
    rejectingSubmissionId = submissionId;
    const modal = document.createElement('div');
    modal.className = 'rejection-reason-modal';
    modal.id = 'rejectionModal';
    modal.innerHTML = `
        <div class="rejection-reason-content">
            <span class="close" onclick="closeRejectionModal()">&times;</span>
            <h2>Rejection Reason</h2>
            <textarea id="rejectionReasonText" placeholder="Enter reason for rejection..."></textarea>
            <button class="form-button" onclick="confirmReject()">Confirm Rejection</button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function closeRejectionModal() {
    const modal = document.getElementById('rejectionModal');
    if (modal) modal.remove();
}

function confirmReject() {
    const reason = document.getElementById('rejectionReasonText').value;
    if (!reason.trim()) {
        alert('Please enter a rejection reason');
        return;
    }
    
    const submissions = getSubmissions();
    const submission = submissions.find(s => s.id === rejectingSubmissionId);
    if (submission) {
        submission.status = 'rejected';
        submission.rejectionReason = reason;
        saveSubmissions(submissions);
        loadPendingSubmissions();
        loadRejectedSubmissions();
        loadAdminStatistics();
        closeRejectionModal();
        alert('Submission rejected!');
    }
}

// ============= LOAD APPROVED SUBMISSIONS =============
function loadApprovedSubmissions() {
    const submissions = getSubmissions();
    const approved = submissions.filter(s => s.status === 'approved');
    const container = document.getElementById('approvedSubmissionsList');
    
    container.innerHTML = '';
    
    if (approved.length === 0) {
        container.innerHTML = '<p style="color: #bbb; grid-column: 1/-1; text-align: center;">No approved submissions</p>';
        return;
    }
    
    approved.forEach(submission => {
        const card = document.createElement('div');
        card.className = 'submission-review-card';
        card.innerHTML = `
            <h3 style="color: #00ff00;">${submission.name}</h3>
            <div class="review-info">
                <label>Submitted by:</label>
                <value>${submission.username}</value>
            </div>
            <div class="review-info">
                <label>Category:</label>
                <value>${submission.category}</value>
            </div>
            <div class="review-info">
                <label>URL:</label>
                <value><a href="${submission.url}" target="_blank" style="color: #00ff00;">${submission.url}</a></value>
            </div>
            <div class="review-info">
                <label>Approved Date:</label>
                <value>${submission.submittedDate}</value>
            </div>
        `;
        container.appendChild(card);
    });
}

// ============= LOAD REJECTED SUBMISSIONS =============
function loadRejectedSubmissions() {
    const submissions = getSubmissions();
    const rejected = submissions.filter(s => s.status === 'rejected');
    const container = document.getElementById('rejectedSubmissionsList');
    
    container.innerHTML = '';
    
    if (rejected.length === 0) {
        container.innerHTML = '<p style="color: #bbb; grid-column: 1/-1; text-align: center;">No rejected submissions</p>';
        return;
    }
    
    rejected.forEach(submission => {
        const card = document.createElement('div');
        card.className = 'submission-review-card';
        card.innerHTML = `
            <h3 style="color: #ff6666;">${submission.name}</h3>
            <div class="review-info">
                <label>Submitted by:</label>
                <value>${submission.username}</value>
            </div>
            <div class="review-info">
                <label>Category:</label>
                <value>${submission.category}</value>
            </div>
            <div class="review-info">
                <label>Rejection Reason:</label>
                <value style="color: #ff6666;">${submission.rejectionReason}</value>
            </div>
        `;
        container.appendChild(card);
    });
}

// ============= LOAD ADMIN USERS =============
function loadAdminUsers() {
    const users = getUsers();
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const submissions = getSubmissions().filter(s => s.userId === user.id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.joinDate}</td>
            <td>${submissions.length}</td>
            <td>
                <button class="review-btn reject-btn" onclick="deleteAdminUser(${user.id})" style="width: 100px;">Remove</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deleteAdminUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        let users = getUsers();
        users = users.filter(u => u.id !== userId);
        saveUsers(users);
        loadAdminUsers();
    }
}

// ============= LOAD ADMIN STATISTICS =============
function loadAdminStatistics() {
    const users = getUsers();
    const submissions = getSubmissions();
    
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalPending').textContent = submissions.filter(s => s.status === 'pending').length;
    document.getElementById('totalApproved').textContent = submissions.filter(s => s.status === 'approved').length;
    document.getElementById('totalRejected').textContent = submissions.filter(s => s.status === 'rejected').length;
}

// ============= CLOSE MODALS ON OUTSIDE CLICK =============
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const adminVerModal = document.getElementById('adminVerificationModal');
    
    if (event.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (event.target === registerModal) {
        registerModal.style.display = 'none';
    }
    if (event.target === adminVerModal) {
        adminVerModal.style.display = 'none';
    }
}

// ============= INITIALIZATION =============
window.addEventListener('load', function() {
    const currentUser = getCurrentUser();
    const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
    
    if (currentUser) {
        showUserDashboard();
    }
    
    if (isAdmin) {
        showAdminPanel();
    }
    
    // Admin access: Ctrl + Shift + Click on logo
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', function(e) {
            if (e.ctrlKey && e.shiftKey) {
                openAdminAccess();
            }
        });
    }
});