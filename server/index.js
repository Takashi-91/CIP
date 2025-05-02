require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");

// Gets client URL from environment variables
const CLIENT_URL = process.env.CLIENT_URL || "https://cip-green.vercel.app/";
console.log(`Client URL set to: ${CLIENT_URL}`);
const app = express();

// Basic middleware
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

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});


// Custom security middleware

// 1. MongoDB sanitization to prevent NoSQL injection
app.use((req, res, next) => {
  if (req.body) {
    const sanitizeObject = (obj) => {
      const result = {};
      
      Object.keys(obj).forEach(key => {
        // Remove keys that start with $ or contain a dot
        if (key.startsWith('$') || key.includes('.')) return;
        
        const value = obj[key];
        
        if (typeof value === 'object' && value !== null) {
          result[key] = sanitizeObject(value);
        } else {
          result[key] = value;
        }
      });
      
      return result;
    };
    
    req.body = sanitizeObject(req.body);
  }
  
  next();
});

// 2. XSS prevention
app.use((req, res, next) => {
  if (req.body) {
    const sanitizeObject = (obj) => {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key]
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      });
    };
    
    sanitizeObject(req.body);
  }
  
  next();
});

// 3. Simple rate limiting
const rateLimit = (maxRequests, timeWindowMs) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    
    // This cleans up old entries
    requests.forEach((timestamp, key) => {
      if (now - timestamp > timeWindowMs) {
        requests.delete(key);
      }
    });
    
    // This checks your current IP
    const requestTimes = requests.get(ip) || [];
    const recentRequests = requestTimes.filter(time => now - time < timeWindowMs);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({ msg: "Too many requests, please try again later" });
    }
    
    // Add current request
    recentRequests.push(now);
    requests.set(ip, recentRequests);
    
    next();
  };
};

// Applies a rate limiting to auth routes
const authLimiter = rateLimit(10, 15 * 60 * 1000);

// Input validation patterns
const emailPattern = /^[a-zA-Z0-9._+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{}|;:,.<>\/\\])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{}|;:,.<>\/\\]{10,}$/;
const namePattern = /^[A-Za-z\s]{2,40}$/;
const amountPattern = /^(?!0+\.?0*$)(\d{1,10}(\.\d{1,2})?)$/;
const currencyPattern = /^[A-Z]{3}$/;
const recipientPattern = /^[A-Za-z0-9\s,.'\-]{2,50}$/;

// Input sanitization helper
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret");
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
  try {
    let { name, email, password } = req.body;
    
    // Sanitize inputs
    name = sanitizeInput(name);
    email = sanitizeInput(email);
    
    if (!name || !email || !password) 
      return res.status(400).json({ msg: "All fields are required" });

    if (!namePattern.test(name)) 
      return res.status(400).json({ msg: "Invalid name format" });
    
    if (!emailPattern.test(email)) 
      return res.status(400).json({ msg: "Invalid email format" });
    
    if (!passwordPattern.test(password))
      return res.status(400).json({ msg: "Password must be at least 10 characters with uppercase, lowercase, number and special character" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ msg: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Login
app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    let { email, password } = req.body;
    
    // Sanitize email
    email = sanitizeInput(email);
    
    if (!email || !password)
      return res.status(400).json({ msg: "All fields are required" });

    if (!emailPattern.test(email))
      return res.status(400).json({ msg: "Invalid email format" });

    // Password pattern check is optional on login for user convenience
    // but we're still validate minimum length for security
    if (password.length < 8)
      return res.status(400).json({ msg: "Invalid password format" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Email Try Again" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid Password Try Again" });

    const payload = { user: { id: user._id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "default_jwt_secret", { expiresIn: "1h" });

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Create Payment
app.post("/api/payments/create", authMiddleware, async (req, res) => {
  try {
    let { amount, currency, recipient } = req.body;
    
    // Sanitize inputs
    recipient = sanitizeInput(recipient);
    currency = sanitizeInput(currency);
    
    if (!amount || !currency || !recipient)
      return res.status(400).json({ msg: "All fields are required" });

    // Convert amount to string for pattern testing
    const amountStr = amount.toString();
    
    if (!amountPattern.test(amountStr)) 
      return res.status(400).json({ msg: "Invalid amount format" });
    
    if (!currencyPattern.test(currency)) 
      return res.status(400).json({ msg: "Invalid currency format" });
    
    if (!recipientPattern.test(recipient)) 
      return res.status(400).json({ msg: "Invalid recipient format" });

    const payment = new Payment({
      userId: req.user.id,
      amount: parseFloat(amount),
      currency,
      recipient,
    });

    await payment.save();
    res.status(201).json({ msg: "Payment successful" });
  } catch (error) {
    console.error("Payment creation error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get Payment History
app.get("/api/payments/history", authMiddleware, async (req, res) => {
  try {
    const history = await Payment.find({ userId: req.user.id });
    res.json(history);
  } catch (error) {
    console.error("History error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Start Server
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/securePayments";

mongoose.connect(MONGO_URI)
  .then(() => {
    // Uses completely different port to avoid conflicts
    const server = app.listen(9000, () => {
      console.log("✅ Server running securely on port 9000");
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error('Port 9000 is already in use!');
        // Try another port
        const newServer = app.listen(0, () => {
          const port = newServer.address().port;
          console.log(`✅ Server running securely on random port ${port}`);
        });
      } else {
        console.error('Server error:', err);
      }
    });
  })
  .catch((err) => console.error("❌ DB Connection Error:", err));
