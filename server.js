const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../public'))); // ONLY KEEP THIS ONE

const dataPath = path.join(__dirname, 'data.json');

// SAFER readData
function readData() {
  if (!fs.existsSync(dataPath)) {
    console.log("data.json NOT FOUND at:", dataPath);
    return { users: [], products: [] }; // Added products
  }
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// LOGIN
app.post('/api/login', (req, res) => {
  try {
    const data = readData();
    const { email, password } = req.body;
    console.log("Login attempt:", email);
    
    const user = data.users.find(u => u.email === email && u.password === password);
    if(!user) return res.status(401).json({ error: 'Invalid email or password' });
    if(user.suspended) return res.status(403).json({ error: 'Account suspended' });

    res.json({ success: true, user: { email: user.email, role: user.role, name: user.name } });
  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ADD PRODUCT
app.post('/api/products', (req, res) => {
  try {
    const data = readData();
    if(!data.products) data.products = [];
    
    const newProduct = {
      id: Date.now(),
      ...req.body
    };
    data.products.push(newProduct);
    saveData(data);
    res.json({ message: 'Product added successfully!' });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL PRODUCTS - FOR MARKETPLACE
app.get('/api/products/all', (req, res) => {
  try {
    const data = readData();
    res.json(data.products || []);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// GET VENDOR PRODUCTS
app.get('/api/products/:email', (req, res) => {
  try {
    const data = readData();
    const vendorProducts = (data.products || []).filter(p => p.vendorEmail === req.params.email);
    res.json(vendorProducts);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));