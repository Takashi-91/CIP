require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");

const app = express();
app.use(express.json({ limit: '10kb' }));
app.use(helmet());

const allowedOrigins = [
  'https://cip-green.vercel.app',
  'http://localhost:5173'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Security middlewares
app.use((req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (key.startsWith('$') || key.includes('.')) delete obj[key];
      else if (typeof obj[key] === 'object') sanitize(obj[key]);
    }
  };
  if (req.body) sanitize(req.body);
  next();
});

app.use((req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key]
          .replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;').trim();
      } else if (typeof obj[key] === 'object') sanitize(obj[key]);
    }
  };
  if (req.body) sanitize(req.body);
  next();
});

// Rate limiter
const rateLimit = (max, windowMs) => {
  const requests = new Map();
  return (req, res, next) => {
    const ip = req.ip, now = Date.now();
    requests.forEach((times, ip) => {
      requests.set(ip, times.filter(t => now - t < windowMs));
    });
    const times = requests.get(ip) || [];
    if (times.length >= max) return res.status(429).json({ msg: "Too many requests" });
    times.push(now);
    requests.set(ip, times);
    next();
  };
};
const authLimiter = rateLimit(10, 15 * 60 * 1000);

// Regex Patterns
const emailPattern = /^[a-zA-Z0-9._+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{}|;:,.<>\/\\])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{}|;:,.<>\/\\]{10,}$/;
const namePattern = /^[A-Za-z\s]{2,40}$/;

// Helper
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.replace(/</g, '&lt;').replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
              .replace(/\//g, '&#x2F;').trim();
}

// MongoDB Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['employee', 'customer'], required: true },
  balance: { type: Number, default: 5000 },
  isFrozen: { type: Boolean, default: false },
});
const User = mongoose.model("User", userSchema);

const transactionSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  type: { type: String, enum: ['deposit', 'withdrawal', 'transfer'] },
  timestamp: { type: Date, default: Date.now },
});
const Transaction = mongoose.model("Transaction", transactionSchema);

// Middleware
function authMiddleware(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded.user;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
}

async function employeeOnly(req, res, next) {
  const user = await User.findById(req.user.id);
  if (!user || user.role !== "employee") return res.status(403).json({ msg: "Access denied" });
  next();
}

// Routes
app.get("/", (req, res) => res.send("🌍 Secure Banking API is live"));

// Register
app.post("/api/auth/register", authLimiter, async (req, res) => {
  let { name, email, password, role } = req.body;
  name = sanitizeInput(name);
  email = sanitizeInput(email);

  if (!name || !email || !password || !role) return res.status(400).json({ msg: "Missing fields" });
  if (!namePattern.test(name)) return res.status(400).json({ msg: "Invalid name" });
  if (!emailPattern.test(email)) return res.status(400).json({ msg: "Invalid email" });
  if (!passwordPattern.test(password)) return res.status(400).json({ msg: "Weak password" });
  if (!["employee", "customer"].includes(role)) return res.status(400).json({ msg: "Invalid role" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ msg: "Email already registered" });

  const hashed = await bcrypt.hash(password, 12);
  await User.create({ name, email, password: hashed, role });
  res.status(201).json({ msg: "Registered" });
});

// Login
app.post("/api/auth/login", authLimiter, async (req, res) => {
  let { email, password } = req.body;
  email = sanitizeInput(email);
  if (!email || !password) return res.status(400).json({ msg: "Missing fields" });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "Invalid email" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ msg: "Invalid password" });

const token = jwt.sign({ user: { id: user._id, role: user.role } }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
res.json({ token });
});

// Transfer Money
app.post("/api/transactions/transfer", authMiddleware, async (req, res) => {
  const { recipientEmail, amount } = req.body;
  const sender = await User.findById(req.user.id);
  const recipient = await User.findOne({ email: recipientEmail });

  if (!recipient || sender.isFrozen || sender.balance < amount) 
    return res.status(400).json({ msg: "Invalid transfer" });

  sender.balance -= amount;
  recipient.balance += amount;
  await sender.save(); await recipient.save();

  await Transaction.create({ sender: sender._id, recipient: recipient._id, amount, type: 'transfer' });
  res.json({ msg: "Transfer complete" });
});

// Withdraw
app.post("/api/transactions/withdraw", authMiddleware, async (req, res) => {
  const { amount } = req.body;
  const user = await User.findById(req.user.id);
  if (user.isFrozen || amount < 50000 || user.balance < amount)
    return res.status(400).json({ msg: "Invalid withdrawal" });

  user.balance -= amount;
  await user.save();
  await Transaction.create({ sender: user._id, amount, type: 'withdrawal' });

  res.json({ msg: "Withdrawal complete" });
});

// View Transactions
app.get("/api/transactions/history", authMiddleware, async (req, res) => {
  const txs = await Transaction.find({
    $or: [{ sender: req.user.id }, { recipient: req.user.id }]
  }).sort({ timestamp: -1 });
  res.json(txs);
});

// Freeze/Unfreeze (Employees)
// Changed to PATCH /api/employees/users/:id/freeze
app.patch("/api/employees/users/:id/freeze", authMiddleware, employeeOnly, async (req, res) => {
  const { id } = req.params;
  const { freeze } = req.body;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ msg: "Not found" });
  user.isFrozen = freeze;
  await user.save();
  res.json({ msg: `Account ${freeze ? "frozen" : "unfrozen"}` });
});

// Remove user (Employees)
app.delete("/api/employees/remove/:id", authMiddleware, employeeOnly, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ msg: "User removed" });
});

// Create user (Employees)
app.post("/api/employees/users", authMiddleware, employeeOnly, async (req, res) => {
  let { name, email, password, role } = req.body;
  name = sanitizeInput(name);
  email = sanitizeInput(email);

  if (!name || !email || !password || !role) return res.status(400).json({ msg: "Missing fields" });
  if (!namePattern.test(name)) return res.status(400).json({ msg: "Invalid name" });
  if (!emailPattern.test(email)) return res.status(400).json({ msg: "Invalid email" });
  if (!passwordPattern.test(password)) return res.status(400).json({ msg: "Weak password" });
  if (!["employee", "customer"].includes(role)) return res.status(400).json({ msg: "Invalid role" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ msg: "Email already registered" });

  const hashed = await bcrypt.hash(password, 12);
  await User.create({ name, email, password: hashed, role });
  res.status(201).json({ msg: "User created" });
});

// Get all users (Employees)
app.get("/api/employees/users", authMiddleware, employeeOnly, async (req, res) => {
  try {
    const users = await User.find({}, 'name email role isFrozen balance');
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch users" });
  }
});

// Edit user
app.put("/api/users/update", authMiddleware, async (req, res) => {
  const updates = {};
  if (req.body.name) updates.name = sanitizeInput(req.body.name);
  if (req.body.email && emailPattern.test(req.body.email)) updates.email = req.body.email;
  const updated = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
  res.json(updated);
});

// MongoDB and Server
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/bank", {})
  .then(() => {
    app.listen(9000, () => console.log("✅ Server running on port 9000"));
  })
  .catch(err => console.error("❌ DB connection failed", err));
