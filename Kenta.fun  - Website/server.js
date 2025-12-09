const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.static('.'));

// Initialize Database
const db = new sqlite3.Database('./kenta.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Database connected');
        initDatabase();
    }
});

function initDatabase() {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        joinDate TEXT NOT NULL,
        isAdmin INTEGER DEFAULT 0
    )`);

    // Products table with all detailed fields
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        productType TEXT,
        game TEXT,
        protection TEXT,
        store TEXT,
        status TEXT DEFAULT 'pending',
        detectionStatus TEXT DEFAULT 'testing',
        description TEXT,
        rating REAL DEFAULT 0,
        dateFrom TEXT,
        dateTo TEXT,
        submittedDate TEXT NOT NULL,
        approvedDate TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
    )`);

    // Pricing table for custom key durations
    db.run(`CREATE TABLE IF NOT EXISTS pricing (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER NOT NULL,
        duration TEXT NOT NULL,
        price TEXT NOT NULL,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
    )`);

    // Create default admin user
    const adminPassword = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO users (username, email, password, joinDate, isAdmin) 
            VALUES ('admin', 'admin@kenta.fun', ?, datetime('now'), 1)`, [adminPassword]);
}

// ============ AUTHENTICATION ============
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(`INSERT INTO users (username, email, password, joinDate) VALUES (?, ?, ?, datetime('now'))`,
        [username, email, hashedPassword],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Username or email already exists' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, userId: this.lastID });
        }
    );
});

app.post('/api/login', (req, res) => {
    const { email, username, password } = req.body;

    if (!password || (!email && !username)) {
        return res.status(400).json({ error: 'Email/Username and password required' });
    }

    // Try to find user by email or username
    const query = email 
        ? `SELECT * FROM users WHERE email = ?`
        : `SELECT * FROM users WHERE username = ?`;
    const identifier = email || username;

    db.get(query, [identifier], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (bcrypt.compareSync(password, user.password)) {
            const { password: _, ...userWithoutPassword } = user;
            res.json({ success: true, user: userWithoutPassword });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

// ============ PRODUCTS ============
app.post('/api/products/submit', (req, res) => {
    const { userId, name, category, subcategory, productType, game, protection, store, 
            detectionStatus, description, rating, dateFrom, dateTo, pricing } = req.body;

    if (!userId || !name || !category) {
        return res.status(400).json({ error: 'Required fields missing' });
    }

    db.run(`INSERT INTO products (userId, name, category, subcategory, productType, game, 
            protection, store, detectionStatus, description, rating, dateFrom, dateTo, submittedDate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [userId, name, category, subcategory, productType, game, protection, store, 
         detectionStatus || 'testing', description, rating || 0, dateFrom, dateTo],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const productId = this.lastID;

            // Insert pricing
            if (pricing && pricing.length > 0) {
                const stmt = db.prepare(`INSERT INTO pricing (productId, duration, price) VALUES (?, ?, ?)`);
                pricing.forEach(p => {
                    stmt.run([productId, p.duration, p.price]);
                });
                stmt.finalize();
            }

            res.json({ success: true, productId });
        }
    );
});

app.get('/api/products', (req, res) => {
    const { status, category, userId } = req.query;
    let query = `SELECT p.*, u.username, 
                 (SELECT GROUP_CONCAT(duration || ':' || price, ',') FROM pricing WHERE productId = p.id) as pricing
                 FROM products p
                 LEFT JOIN users u ON p.userId = u.id
                 WHERE 1=1`;
    const params = [];

    if (status) {
        query += ` AND p.status = ?`;
        params.push(status);
    }
    if (category) {
        query += ` AND p.category = ?`;
        params.push(category);
    }
    if (userId) {
        query += ` AND p.userId = ?`;
        params.push(userId);
    }

    query += ` ORDER BY p.submittedDate DESC`;

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Parse pricing
        const products = rows.map(row => {
            const product = { ...row };
            if (product.pricing) {
                product.pricing = product.pricing.split(',').map(p => {
                    const [duration, price] = p.split(':');
                    return { duration, price };
                });
            } else {
                product.pricing = [];
            }
            return product;
        });

        res.json(products);
    });
});

app.get('/api/products/:id', (req, res) => {
    const { id } = req.params;

    db.get(`SELECT p.*, u.username,
            (SELECT GROUP_CONCAT(duration || ':' || price, ',') FROM pricing WHERE productId = p.id) as pricing
            FROM products p
            LEFT JOIN users u ON p.userId = u.id
            WHERE p.id = ?`, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = { ...row };
        if (product.pricing) {
            product.pricing = product.pricing.split(',').map(p => {
                const [duration, price] = p.split(':');
                return { duration, price };
            });
        } else {
            product.pricing = [];
        }

        res.json(product);
    });
});

// Update product (requires review)
app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { userId, name, category, subcategory, productType, game, protection, store, 
            detectionStatus, description, rating, dateFrom, dateTo, pricing } = req.body;

    // Check if user owns the product
    db.get(`SELECT userId FROM products WHERE id = ?`, [id], (err, product) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        if (product.userId !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Update product and set status to pending for review
        db.run(`UPDATE products SET 
                name = ?, category = ?, subcategory = ?, productType = ?, game = ?, 
                protection = ?, store = ?, detectionStatus = ?, description = ?, 
                rating = ?, dateFrom = ?, dateTo = ?, status = 'pending'
                WHERE id = ?`,
            [name, category, subcategory, productType, game, protection, store, 
             detectionStatus, description, rating, dateFrom, dateTo, id],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // Delete old pricing
                db.run(`DELETE FROM pricing WHERE productId = ?`, [id], (err) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    // Insert new pricing
                    if (pricing && pricing.length > 0) {
                        const stmt = db.prepare(`INSERT INTO pricing (productId, duration, price) VALUES (?, ?, ?)`);
                        pricing.forEach(p => {
                            stmt.run([id, p.duration, p.price]);
                        });
                        stmt.finalize();
                    }

                    res.json({ success: true, message: 'Product updated. Pending admin review.' });
                });
            }
        );
    });
});

// Request product deletion
app.post('/api/products/:id/delete-request', (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    // Check if user owns the product
    db.get(`SELECT userId FROM products WHERE id = ?`, [id], (err, product) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        if (product.userId !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Set status to deletion_requested (or just delete if you want)
        db.run(`UPDATE products SET status = 'deletion_requested' WHERE id = ?`, [id], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, message: 'Deletion request submitted. Pending admin review.' });
        });
    });
});

// ============ ADMIN ============
app.post('/api/admin/approve/:id', (req, res) => {
    const { id } = req.params;

    db.run(`UPDATE products SET status = 'approved', approvedDate = datetime('now') WHERE id = ?`,
        [id], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true });
        }
    );
});

app.post('/api/admin/reject/:id', (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    db.run(`UPDATE products SET status = 'rejected' WHERE id = ?`, [id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

app.post('/api/admin/update-status/:id', (req, res) => {
    const { id } = req.params;
    const { detectionStatus } = req.body;

    if (!['testing', 'undiscovered', 'discovered'].includes(detectionStatus)) {
        return res.status(400).json({ error: 'Invalid detection status' });
    }

    db.run(`UPDATE products SET detectionStatus = ? WHERE id = ?`, [detectionStatus, id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

app.get('/api/admin/stats', (req, res) => {
    db.get(`SELECT 
            (SELECT COUNT(*) FROM users) as totalUsers,
            (SELECT COUNT(*) FROM products WHERE status = 'pending') as pending,
            (SELECT COUNT(*) FROM products WHERE status = 'approved') as approved,
            (SELECT COUNT(*) FROM products WHERE status = 'rejected') as rejected`,
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(row);
        }
    );
});

app.get('/api/admin/users', (req, res) => {
    db.all(`SELECT u.*, 
            (SELECT COUNT(*) FROM products WHERE userId = u.id) as submissionCount
            FROM users u ORDER BY u.joinDate DESC`,
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

