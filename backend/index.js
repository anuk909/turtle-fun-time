const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3003;

// CORS configuration
const corsOptions = {
  origin: 'https://charming-gumption-994c31.netlify.app',
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

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
app.post('/register', (req, res) => {
  console.log('Received registration request:', req.body);
  const { username, password, email } = req.body;
  db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, password, email], function(err) {
    if (err) {
      console.error('Error during user registration:', err);
      res.status(400).json({ error: err.message });
      return;
    }
    console.log('User registered successfully. User ID:', this.lastID);
    res.json({ id: this.lastID });
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
    res.json({ id: this.lastID });
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
