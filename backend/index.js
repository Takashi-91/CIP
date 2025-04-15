require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true })); // Frontend URL
app.use(helmet());

// Optional HTTPS redirect for production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

// Rate limiters
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: "Too many login/register attempts. Try later." });

app.use(globalLimiter);

// Regex patterns for input validation
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^[A-Za-z\d@$!%*?&]{6,}$/;
const namePattern = /^[A-Za-z\s]{2,50}$/;
const amountPattern = /^\d+(\.\d{1,2})?$/;

// MongoDB Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", userSchema);

const paymentSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  amount: Number,
  currency: String,
  recipient: String,
  date: { type: Date, default: Date.now },
});
const Payment = mongoose.model("Payment", paymentSchema);

// JWT middleware
function authMiddleware(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token, auth denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
}

// Routes

// Health check
app.get("/", (req, res) => {
  res.send("🌍 Secure Payments API is running");
});

// Register
app.post("/api/auth/register", authLimiter, async (req, res) => {
  const { name, email, password } = req.body;

  if (!namePattern.test(name)) return res.status(400).json({ msg: "Invalid name" });
  if (!emailPattern.test(email)) return res.status(400).json({ msg: "Invalid email" });
  if (!passwordPattern.test(password)) return res.status(400).json({ msg: "Weak password" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ msg: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();

  res.status(201).json({ msg: "User registered successfully" });
});

// Login
app.post("/api/auth/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!emailPattern.test(email) || !passwordPattern.test(password))
    return res.status(400).json({ msg: "Invalid credentials format" });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ msg: "Invalid credentials" });

  const payload = { user: { id: user._id } };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({ token });
});

// Create Payment
app.post("/api/payments/create", authMiddleware, async (req, res) => {
  const { amount, currency, recipient } = req.body;

  if (!amountPattern.test(amount.toString())) return res.status(400).json({ msg: "Invalid amount" });

  const payment = new Payment({
    userId: req.user.id,
    amount,
    currency,
    recipient,
  });

  await payment.save();
  res.status(201).json({ msg: "Payment successful" });
});

// Get Payment History
app.get("/api/payments/history", authMiddleware, async (req, res) => {
  const history = await Payment.find({ userId: req.user.id });
  res.json(history);
});

// Start Server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log("✅ Server running securely on port", process.env.PORT || 8000);
    });
  })
  .catch((err) => console.error("❌ DB Connection Error:", err));
