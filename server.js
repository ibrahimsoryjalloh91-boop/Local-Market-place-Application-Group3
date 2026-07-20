const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const dataPath = path.join(__dirname, 'data.json');

function readData() {
  if (!fs.existsSync(dataPath)) {
    return { users: [], products: [] };
  }

  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Local marketplace API is running' });
});

app.post('/api/register', (req, res) => {
  try {
    const data = readData();
    const { name, email, password, role = 'seller', location = 'Community' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const exists = (data.users || []).some((user) => user.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const newUser = {
      id: Date.now(),
      name,
      email: email.toLowerCase(),
      password,
      role,
      location,
      joinedAt: new Date().toISOString(),
    };

    data.users.push(newUser);
    saveData(data);

    res.status(201).json({
      success: true,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, location: newUser.location },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', (req, res) => {
  try {
    const data = readData();
    const { email, password } = req.body;

    const user = (data.users || []).find(
      (entry) => entry.email.toLowerCase() === String(email).toLowerCase() && entry.password === password
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role, name: user.name, location: user.location },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products', (req, res) => {
  try {
    const data = readData();
    const { search = '', category = 'All' } = req.query;
    const products = (data.products || []).filter((product) => {
      const matchesSearch = `${product.title} ${product.description} ${product.vendorName}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory = category === 'All' || product.category === category;
      return matchesSearch && matchesCategory;
    });

    res.json(products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const data = readData();
    const { title, description, price, category, location, type = 'product', vendorEmail, vendorName } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({ error: 'Title, description, price and category are required' });
    }

    const newProduct = {
      id: Date.now(),
      title,
      description,
      price,
      category,
      location: location || 'Community hub',
      type,
      vendorEmail: vendorEmail || 'community@marketplace.sl',
      vendorName: vendorName || 'Community Seller',
      createdAt: new Date().toISOString(),
    };

    data.products.push(newProduct);
    saveData(data);

    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/vendor/:email', (req, res) => {
  try {
    const data = readData();
    const vendorProducts = (data.products || []).filter((product) => product.vendorEmail === req.params.email);
    res.json(vendorProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/community-summary', (req, res) => {
  try {
    const data = readData();
    const summaries = {
      users: (data.users || []).length,
      listings: (data.products || []).length,
      categories: [...new Set((data.products || []).map((product) => product.category))],
    };

    res.json(summaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get(/.*/, (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Route not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = { app, readData, saveData };