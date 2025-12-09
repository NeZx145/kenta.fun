// Local Storage Management
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getWebsites() {
    return JSON.parse(localStorage.getItem('websites')) || [];
}

function saveWebsites(websites) {
    localStorage.setItem('websites', JSON.stringify(websites));
}

function getSpoofers() {
    return JSON.parse(localStorage.getItem('spoofers')) || [];
}

function saveSpoofers(spoofers) {
    localStorage.setItem('spoofers', JSON.stringify(spoofers));
}

function getCheats() {
    return JSON.parse(localStorage.getItem('cheats')) || [];
}

function saveCheats(cheats) {
    localStorage.setItem('cheats', JSON.stringify(cheats));
}

// Login Modal Functions
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

// Login Handler
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert('Login successful! Welcome back, ' + user.username);
        closeLoginModal();
        document.getElementById('loginForm').reset();
        
        // Redirect to dashboard or home
        location.reload();
    } else {
        alert('Invalid email or password!');
    }
}

// Register Handler with Validation
function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;
    
    // Clear previous messages
    document.getElementById('usernameMsg').textContent = '';
    document.getElementById('emailMsg').textContent = '';
    document.getElementById('passwordMsg').textContent = '';
    
    let isValid = true;
    
    // Validation
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
    
    // Create new user
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

// Admin Functions
function showAdminModal() {
    document.getElementById('adminLoginModal').style.display = 'block';
}

function closeAdminModal() {
    document.getElementById('adminLoginModal').style.display = 'none';
}

function handleAdminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    // Simple admin credentials (in real app, use server-side authentication)
    if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('adminLoggedIn', 'true');
        closeAdminModal();
        document.getElementById('adminLoginForm').reset();
        showAdminPanel();
    } else {
        alert('Invalid admin credentials!');
    }
}

function showAdminPanel() {
    const mainContent = document.querySelector('body > *:not(.admin-panel)');
    document.getElementById('adminPanel').classList.add('active');
    
    // Hide other content
    document.querySelectorAll('nav, header, .welcome-section, .sections-container').forEach(el => {
        el.style.display = 'none';
    });
    
    loadUsers();
    loadWebsites();
    loadSpoofers();
    loadCheats();
    loadStatistics();
}

function logoutAdmin() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('currentUser');
    document.getElementById('adminPanel').classList.remove('active');
    
    // Show other content
    document.querySelectorAll('nav, header, .welcome-section, .sections-container').forEach(el => {
        el.style.display = '';
    });
    
    location.reload();
}

// Admin Section Navigation
function showAdminSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName + '-section').classList.add('active');
    
    // Update menu active state
    document.querySelectorAll('.admin-menu a').forEach(link => {
        link.classList.remove('menu-active');
    });
    event.target.classList.add('menu-active');
    
    return false;
}

// Load Users
function loadUsers() {
    const users = getUsers();
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.joinDate}</td>
            <td><span style="color: #00ff00;">Active</span></td>
            <td>
                <button class="item-btn delete-btn" onclick="deleteUser(${user.id})">Remove</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    document.getElementById('totalUsers').textContent = users.length;
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        let users = getUsers();
        users = users.filter(u => u.id !== userId);
        saveUsers(users);
        loadUsers();
    }
}

// Website Management
function showAddWebsiteForm() {
    document.getElementById('addWebsiteModal').style.display = 'block';
}

function closeAddWebsiteModal() {
    document.getElementById('addWebsiteModal').style.display = 'none';
}

function handleAddWebsite(event) {
    event.preventDefault();
    
    const name = event.target[0].value;
    const url = event.target[1].value;
    const description = event.target[2].value;
    
    const website = {
        id: Date.now(),
        name: name,
        url: url,
        description: description,
        dateAdded: new Date().toLocaleDateString()
    };
    
    const websites = getWebsites();
    websites.push(website);
    saveWebsites(websites);
    
    closeAddWebsiteModal();
    event.target.reset();
    loadWebsites();
}

function loadWebsites() {
    const websites = getWebsites();
    const container = document.getElementById('websitesList');
    container.innerHTML = '';
    
    websites.forEach(website => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <h4>${website.name}</h4>
            <p><strong>URL:</strong> ${website.url}</p>
            <p>${website.description}</p>
            <p style="font-size: 12px; color: #888;">Added: ${website.dateAdded}</p>
            <div class="item-actions">
                <button class="item-btn delete-btn" onclick="deleteWebsite(${website.id})">Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
    
    document.getElementById('totalWebsites').textContent = websites.length;
}

function deleteWebsite(websiteId) {
    if (confirm('Delete this website?')) {
        let websites = getWebsites();
        websites = websites.filter(w => w.id !== websiteId);
        saveWebsites(websites);
        loadWebsites();
    }
}

// Spoofers Management
function showAddSpoofersForm() {
    const name = prompt('Enter Spoofer Name:');
    if (!name) return;
    
    const price = prompt('Enter Price (e.g., $25):');
    if (!price) return;
    
    const description = prompt('Enter Description:');
    if (!description) return;
    
    const spoofer = {
        id: Date.now(),
        name: name,
        price: price,
        description: description,
        dateAdded: new Date().toLocaleDateString()
    };
    
    const spoofers = getSpoofers();
    spoofers.push(spoofer);
    saveSpoofers(spoofers);
    
    loadSpoofers();
}

function loadSpoofers() {
    const spoofers = getSpoofers();
    const container = document.getElementById('spoofersLists');
    container.innerHTML = '';
    
    spoofers.forEach(spoofer => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <h4>${spoofer.name}</h4>
            <p><strong>Price:</strong> ${spoofer.price}</p>
            <p>${spoofer.description}</p>
            <p style="font-size: 12px; color: #888;">Added: ${spoofer.dateAdded}</p>
            <div class="item-actions">
                <button class="item-btn delete-btn" onclick="deleteSpoofer(${spoofer.id})">Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
    
    document.getElementById('totalSpoofers').textContent = spoofers.length;
}

function deleteSpoofer(spooferId) {
    if (confirm('Delete this spoofer?')) {
        let spoofers = getSpoofers();
        spoofers = spoofers.filter(s => s.id !== spooferId);
        saveSpoofers(spoofers);
        loadSpoofers();
    }
}

// Cheats Management
function showAddCheatsForm() {
    const name = prompt('Enter Cheat Name:');
    if (!name) return;
    
    const game = prompt('Enter Game Name:');
    if (!game) return;
    
    const description = prompt('Enter Description:');
    if (!description) return;
    
    const cheat = {
        id: Date.now(),
        name: name,
        game: game,
        description: description,
        dateAdded: new Date().toLocaleDateString()
    };
    
    const cheats = getCheats();
    cheats.push(cheat);
    saveCheats(cheats);
    
    loadCheats();
}

function loadCheats() {
    const cheats = getCheats();
    const container = document.getElementById('cheatsList');
    container.innerHTML = '';
    
    cheats.forEach(cheat => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <h4>${cheat.name}</h4>
            <p><strong>Game:</strong> ${cheat.game}</p>
            <p>${cheat.description}</p>
            <p style="font-size: 12px; color: #888;">Added: ${cheat.dateAdded}</p>
            <div class="item-actions">
                <button class="item-btn delete-btn" onclick="deleteCheat(${cheat.id})">Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
    
    document.getElementById('totalCheats').textContent = cheats.length;
}

function deleteCheat(cheatId) {
    if (confirm('Delete this cheat?')) {
        let cheats = getCheats();
        cheats = cheats.filter(c => c.id !== cheatId);
        saveCheats(cheats);
        loadCheats();
    }
}

// Statistics
function loadStatistics() {
    document.getElementById('totalUsers').textContent = getUsers().length;
    document.getElementById('totalWebsites').textContent = getWebsites().length;
    document.getElementById('totalSpoofers').textContent = getSpoofers().length;
    document.getElementById('totalCheats').textContent = getCheats().length;
}

// Close modals when clicking outside
window.onclick = function(event) {
    let loginModal = document.getElementById('loginModal');
    let registerModal = document.getElementById('registerModal');
    let adminLoginModal = document.getElementById('adminLoginModal');
    let addWebsiteModal = document.getElementById('addWebsiteModal');
    
    if (event.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (event.target === registerModal) {
        registerModal.style.display = 'none';
    }
    if (event.target === adminLoginModal) {
        adminLoginModal.style.display = 'none';
    }
    if (event.target === addWebsiteModal) {
        addWebsiteModal.style.display = 'none';
    }
}

// Initialize - Check if admin is logged in
window.addEventListener('load', function() {
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showAdminPanel();
    }
    
    // Add hidden admin access button (hold Ctrl + Shift and click on KENTA logo)
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', function(e) {
            if (e.ctrlKey && e.shiftKey) {
                showAdminModal();
            }
        });
    }
});