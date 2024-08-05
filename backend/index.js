const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3003;

// CORS configuration
const corsOptions = {
  origin: ['https://monumental-jelly-633c89.netlify.app', 'http://localhost:3000'],
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  exposedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
  credentials: true,
  maxAge: 86400, // 24 hours in seconds
  preflightContinue: false
};

// Log CORS configuration
console.log('CORS configuration:', JSON.stringify(corsOptions, null, 2));

// Create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Middleware
// Apply CORS middleware first to handle preflight requests and set appropriate headers
// This is crucial for proper CORS functionality, especially for handling OPTIONS requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (corsOptions.origin.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', corsOptions.methods.join(','));
    res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', corsOptions.maxAge.toString());
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
  }
  next();
});

// Use the cors middleware with the updated options
app.use(cors({
  ...corsOptions,
  origin: (origin, callback) => {
    if (!origin || corsOptions.origin.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  next();
});

// Other middleware
app.use(express.json());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req[header] :res[header]'));

// CORS debugging middleware
app.use((req, res, next) => {
  console.log('CORS-enabled request received:', req.method, req.url);
  console.log('Origin:', req.get('Origin'));
  console.log('Access-Control-Request-Headers:', req.get('Access-Control-Request-Headers'));
  console.log('Access-Control-Request-Method:', req.get('Access-Control-Request-Method'));
  console.log('Request headers:', req.headers);
  res.on('finish', () => {
    console.log('Response headers:', res.getHeaders());
  });
  next();
});

console.log('Middleware setup complete');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'CORSError') {
    res.status(403).json({ error: 'CORS error', message: 'Origin not allowed' });
  } else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    res.status(400).json({ error: 'Invalid JSON', message: 'Bad request: Invalid JSON syntax' });
  } else if (err.name === 'ValidationError') {
    res.status(400).json({ error: 'Validation error', message: err.message });
  } else if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
  } else {
    res.status(500).json({ error: 'Internal server error', message: 'An unexpected error occurred', details: err.message });
  }
});

// SQLite database setup
const db = new sqlite3.Database('./eventmanager.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      email TEXT UNIQUE
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      date TEXT,
      description TEXT,
      location TEXT,
      creator_id INTEGER,
      FOREIGN KEY(creator_id) REFERENCES users(id)
    )`);
  }
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  auth: {
    user: 'your_email@example.com',
    pass: 'your_password'
  }
});

// Routes
app.post('/register', async (req, res) => {
  console.log('Received registration request:', { ...req.body, password: '[REDACTED]' });
  const { username, password, email } = req.body;

  // Enhanced input validation
  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Missing required fields', details: { username: !username, password: !password, email: !email } });
  }

  // Validate username (alphanumeric, 3-20 characters)
  const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({ error: 'Invalid username format', message: 'Username must be 3-20 alphanumeric characters' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format', message: 'Please provide a valid email address' });
  }

  // Validate password strength (at least 8 characters, including uppercase, lowercase, number)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: 'Weak password', message: 'Password must be at least 8 characters long and include uppercase, lowercase, and numbers' });
  }

  try {
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email], function(err) {
      if (err) {
        console.error('Error during user registration:', err.message);
        if (err.message.includes('UNIQUE constraint failed: users.username')) {
          return res.status(409).json({ error: 'Username already exists', message: 'Please choose a different username' });
        } else if (err.message.includes('UNIQUE constraint failed: users.email')) {
          return res.status(409).json({ error: 'Email already registered', message: 'This email is already associated with an account' });
        }
        return res.status(500).json({ error: 'Internal server error', message: 'An unexpected error occurred during registration' });
      }
      console.log('User registered successfully. User ID:', this.lastID);
      res.status(201).json({ id: this.lastID, message: 'User registered successfully' });
    });
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).json({ error: 'Internal server error', message: 'An unexpected error occurred during registration' });
  }
});

app.post('/login', async (req, res) => {
  console.log('Received login request:', { username: req.body.username });
  const { username, password } = req.body;

  if (!username || !password) {
    console.log('Login failed: Missing username or password');
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  try {
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
      if (err) {
        console.error('Database error during login:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
      if (row) {
        const match = await bcrypt.compare(password, row.password);
        if (match) {
          console.log('Login successful for user:', username);
          return res.json({ success: true, userId: row.id });
        }
      }
      console.log('Login failed: Invalid credentials for user:', username);
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    });
  } catch (error) {
    console.error('Unexpected error during login:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/events', (req, res) => {
  const { name, creatorId } = req.body;
  db.run('INSERT INTO events (name, creator_id) VALUES (?, ?)', [name, creatorId], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID });
  });
});

app.get('/events/:userId', (req, res) => {
  const userId = req.params.userId;
  db.all('SELECT * FROM events WHERE creator_id = ?', [userId], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/send-invitation', (req, res) => {
  const { to, eventName } = req.body;
  const mailOptions = {
    from: 'your_email@example.com',
    to: to,
    subject: `Invitation to ${eventName}`,
    text: `You have been invited to ${eventName}. Please RSVP.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json({ message: 'Invitation sent successfully' });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
