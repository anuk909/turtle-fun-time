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
  credentials: true,
  preflightContinue: false,
  exposedHeaders: ['Access-Control-Allow-Origin'],
  maxAge: 86400 // 24 hours in seconds
};

// Enable CORS pre-flight requests for all routes
app.options('*', cors(corsOptions));

// Create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Middleware
app.use(cors(corsOptions)); // Apply CORS middleware first
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', corsOptions.origin);
  res.header('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
  res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
  res.header('Access-Control-Allow-Credentials', corsOptions.credentials);
  next();
});
app.use(express.json());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req[header] :res[header]'));

// Error handling middleware
app.use((err, req, res, next) => {
  // Set CORS headers for all responses, including error responses
  const origin = req.headers.origin;
  if (corsOptions.origin.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
  res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
  res.header('Access-Control-Allow-Credentials', corsOptions.credentials);

  console.error('Error:', err.message);

  if (err.name === 'CORSError') {
    res.status(403).json({ error: 'CORS error', message: 'Origin not allowed' });
  } else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    res.status(400).json({ error: 'Invalid JSON', message: 'Bad request' });
  } else {
    res.status(500).json({ error: 'Internal server error', message: 'An unexpected error occurred' });
  }
});

// Middleware to set CORS headers for all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (corsOptions.origin.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
  res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
  res.header('Access-Control-Allow-Credentials', corsOptions.credentials);
  next();
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
app.post('/auth/register', async (req, res) => {
  console.log('Received registration request:', req.body);
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email], function(err) {
      if (err) {
        console.error('Error during user registration:', err);
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Username or email already exists' });
        }
        return res.status(500).json({ error: 'Internal server error' });
      }
      console.log('User registered successfully. User ID:', this.lastID);
      res.status(201).json({ id: this.lastID, message: 'User registered successfully' });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (row) {
        const match = await bcrypt.compare(password, row.password);
        if (match) {
          return res.json({ success: true, userId: row.id });
        }
      }
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
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
