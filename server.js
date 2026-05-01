import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;
const JWT_SECRET = 'ultra_secure_supply_optima_secret_2025_reset';

// Middleware
app.use(cors());
app.use(express.json());

// Database Initialization
let db;
async function initializeDB() {
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Table Schemas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'Admin',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      stock_level INTEGER NOT NULL,
      reorder_point INTEGER NOT NULL,
      price REAL NOT NULL,
      supplier TEXT NOT NULL,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS shipments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER,
      quantity INTEGER DEFAULT 1,
      tracking_id TEXT UNIQUE NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      status TEXT NOT NULL,
      eta DATE NOT NULL,
      last_update DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS inventory_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      snapshot_date DATE NOT NULL,
      total_value REAL NOT NULL,
      product_count INTEGER NOT NULL,
      UNIQUE(user_id, snapshot_date),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  console.log('✔ Supply Chain Database Ready (Multi-User Isolated)');
}
initializeDB();

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

// --- CORE UTILITIES ---
async function trackEvent(userId, action) {
  try {
    // Log activity
    await db.run('INSERT INTO activity_log (user_id, action) VALUES (?, ?)', [userId, action]);
    
    // Update daily snapshot
    const stats = await db.get('SELECT SUM(stock_level * price) as val, COUNT(*) as count FROM products WHERE user_id = ?', [userId]);
    const today = new Date().toISOString().split('T')[0];
    
    await db.run(`
      INSERT INTO inventory_snapshots (user_id, snapshot_date, total_value, product_count)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, snapshot_date) DO UPDATE SET
      total_value = excluded.total_value,
      product_count = excluded.product_count
    `, [userId, today, stats.val || 0, stats.count || 0]);
  } catch (err) {
    console.error('TrackEvent Error:', err);
  }
}

// --- AUTH ENDPOINTS ---
app.post('/api/register', async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const result = await db.run('INSERT INTO users (fullName, email, password) VALUES (?, ?, ?)', [fullName, email, hashedPassword]);
    const newUserId = result.lastID;
    await trackEvent(newUserId, 'Account Registry: System Access Granted');
    res.status(201).json({ message: 'User registered', userId: newUserId });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.fullName }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- INVENTORY ENDPOINTS ---
app.get('/api/inventory', authenticateToken, async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products WHERE user_id = ?', [req.user.id]);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

app.post('/api/inventory', authenticateToken, async (req, res) => {
  const { name, category, stock_level, reorder_point, price, supplier } = req.body;
  try {
    const result = await db.run(
      'INSERT INTO products (user_id, name, category, stock_level, reorder_point, price, supplier) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, name, category, stock_level, reorder_point, price, supplier]
    );
    await trackEvent(req.user.id, `Stock Update: Added ${name}`);
    res.status(201).json({ id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: 'Insert failed' });
  }
});

app.put('/api/inventory/:id', authenticateToken, async (req, res) => {
  const { name, category, stock_level, reorder_point, price, supplier } = req.body;
  try {
    await db.run(
      'UPDATE products SET name=?, category=?, stock_level=?, reorder_point=?, price=?, supplier=?, last_updated=CURRENT_TIMESTAMP WHERE id=? AND user_id=?',
      [name, category, stock_level, reorder_point, price, supplier, req.params.id, req.user.id]
    );
    await trackEvent(req.user.id, `Stock Update: Modified ${name}`);
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

app.delete('/api/inventory/:id', authenticateToken, async (req, res) => {
  try {
    const product = await db.get('SELECT name FROM products WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    await db.run('DELETE FROM products WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    await trackEvent(req.user.id, `Stock Update: Removed ${product.name}`);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// --- LOGISTICS ENDPOINTS ---
app.get('/api/shipments', authenticateToken, async (req, res) => {
  try {
    const shipments = await db.all(`
      SELECT s.*, p.name as product_name 
      FROM shipments s 
      LEFT JOIN products p ON s.product_id = p.id 
      WHERE s.user_id = ?
    `, [req.user.id]);
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

app.post('/api/shipments', authenticateToken, async (req, res) => {
  const { tracking_id, origin, destination, status, eta, product_id, quantity } = req.body;
  try {
    // 1. Check & Decrement Stock
    const product = await db.get('SELECT name, stock_level FROM products WHERE id = ? AND user_id = ?', [product_id, req.user.id]);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stock_level < quantity) return res.status(400).json({ error: `Insufficient stock. Available: ${product.stock_level}` });

    await db.run('UPDATE products SET stock_level = stock_level - ? WHERE id = ?', [quantity, product_id]);

    // 2. Insert Shipment
    await db.run(
      'INSERT INTO shipments (user_id, product_id, quantity, tracking_id, origin, destination, status, eta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, product_id, quantity, tracking_id, origin, destination, status, eta]
    );

    await trackEvent(req.user.id, `Logistics: Dispatched ${quantity} units of ${product.name} to ${destination}`);
    res.status(201).json({ message: 'Shipment created and stock updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

// --- ANALYTICS & INTELLIGENCE ---
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.id;
    const totalValueData = await db.get('SELECT SUM(stock_level * price) as val FROM products WHERE user_id = ?', [uid]);
    const activeShipments = await db.get('SELECT COUNT(*) as count FROM shipments WHERE user_id = ? AND status != "Delivered"', [uid]);
    const lowStock = await db.get('SELECT COUNT(*) as count FROM products WHERE user_id = ? AND stock_level <= reorder_point', [uid]);
    
    // Growth Logic (Compared to yesterday)
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const prev = await db.get('SELECT total_value FROM inventory_snapshots WHERE user_id = ? AND snapshot_date = ?', [uid, yesterdayStr]);
    
    const currentVal = totalValueData.val || 0;
    const dispatchedToday = await db.get('SELECT SUM(s.quantity * p.price) as val FROM shipments s JOIN products p ON s.product_id = p.id WHERE s.user_id = ? AND date(s.last_update) = date("now")', [uid]);
    const dispatchedVal = dispatchedToday.val || 0;

    let growth = "+100%";
    if (prev && prev.total_value > 0) {
      const diff = ((currentVal - prev.total_value) / prev.total_value) * 100;
      growth = (diff >= 0 ? "+" : "") + diff.toFixed(1) + "%";
    } else if (dispatchedVal > 0 || currentVal > 0) {
      // For Day 1: Calculate the retention percentage relative to the peak handled value
      const peakValue = currentVal + dispatchedVal;
      if (peakValue > 0) {
        const retention = (currentVal / peakValue) * 100;
        growth = "+" + retention.toFixed(1) + "%";
      }
    } else {
      growth = "+0.0%";
    }

    res.json({
      inventoryValue: currentVal,
      activeShipments: activeShipments.count,
      lowStock: lowStock.count,
      forecastedGrowth: growth
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.id;
    // Get daily snapshots
    const snapshots = await db.all(`
      SELECT snapshot_date as date, total_value as value, product_count as count 
      FROM inventory_snapshots 
      WHERE user_id = ? 
      ORDER BY snapshot_date ASC LIMIT 30
    `, [uid]);

    // Get daily dispatches (sum of quantities from shipments created each day)
    const dispatches = await db.all(`
      SELECT date(last_update) as date, SUM(quantity) as count
      FROM shipments
      WHERE user_id = ?
      GROUP BY date(last_update)
      ORDER BY date ASC
    `, [uid]);

    // Merge data
    const merged = snapshots.map(s => {
      const dispatch = dispatches.find(d => d.date === s.date);
      return {
        ...s,
        dispatch_count: dispatch ? dispatch.count : 0
      };
    });

    // If no snapshots yet, use today's live data as the first point
    if (merged.length === 0) {
      const liveValue = await db.get('SELECT SUM(stock_level * price) as val FROM products WHERE user_id = ?', [uid]);
      const liveDispatch = await db.get('SELECT SUM(quantity) as count FROM shipments WHERE user_id = ? AND date(last_update) = date("now")', [uid]);
      merged.push({
        date: new Date().toISOString().split('T')[0],
        value: liveValue.val || 0,
        dispatch_count: liveDispatch.count || 0
      });
    }

    res.json(merged);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/activity', authenticateToken, async (req, res) => {
  try {
    const logs = await db.all('SELECT * FROM activity_log WHERE user_id = ? ORDER BY timestamp DESC LIMIT 100', [req.user.id]);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Smart Supply Chain API running on port ${PORT}`);
});
