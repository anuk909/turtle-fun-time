const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3003;

// CORS configuration
const corsOptions = {
  origin: ['https://monumental-jelly-633c89.netlify.app', 'http://localhost:3000'],
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  preflightContinue: false
};

// Enable CORS pre-flight requests for all routes
app.options('*', cors(corsOptions));

// Create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req[header] :res[header]'));

// Ensure CORS headers are set for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Error handling middleware for CORS issues
app.use((err, req, res, next) => {
  // Set CORS headers for all error responses
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (err.name === 'CORSError') {
    console.error('CORS Error:', err.message);
    res.status(403).json({ error: 'CORS error', message: 'Origin not allowed' });
  } else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON:', err.message);
    res.status(400).json({ error: 'Invalid JSON', message: 'Bad request' });
  } else {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error', message: 'An unexpected error occurred' });
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
app.post('/auth/register', (req, res) => {
  console.log('Received registration request:', req.body);
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, password, email], function(err) {
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
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (row) {
      res.json({ success: true, userId: row.id });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
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
