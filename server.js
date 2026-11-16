require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const flash = require('connect-flash');
const path = require('path');
const moment = require('moment');
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');
const db = require('./config/database');
const poolPromise = db.promise();

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL Session Store Configuration
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kuliner_db',
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  name: 'htk.sid',
  secret: process.env.SESSION_SECRET || 'high-tech-skydrone-secret-2025',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  }
}));

// Flash messages
app.use(flash());

// Global variables
app.use((req, res, next) => {
  // Initialize cart if not exists
  if (!req.session.cart) {
    req.session.cart = [];
  }
  
  console.log('Session debug:', {
    sessionID: req.sessionID,
    cart: req.session.cart,
    user: req.session.user
  });
  
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = req.session.user || null;
  res.locals.moment = moment;
  next();
});

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  const user = req.session.user;
  if (user) {
    if (user.role === 'admin' || user.role === 'lecturer') {
      return res.redirect('/admin');
    }
    return res.redirect('/customer/order');
  }
  return res.render('home', { title: 'Ayam Geprek Arema System', page: 'home' });
});

// Debug: trace reserve submit hits
app.post('/customer/reserve', (req, res, next) => {
  console.log('DEBUG: POST /customer/reserve raw hit');
  next();
});

// Routes
app.use('/', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/transactions', require('./routes/transaction'));
app.use('/customer', require('./routes/customer'));

// SSE for reservations
const reservationEventClients = new Set();
app.locals.broadcastReservationEvent = (payload) => {
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  reservationEventClients.forEach((res) => {
    try { res.write(data); } catch (_) {}
  });
};

app.get('/events/reservations', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();
  res.write(': connected\n\n');

  reservationEventClients.add(res);

  const keepalive = setInterval(() => {
    try { res.write(': keepalive\n\n'); } catch (_) {}
  }, 25000);

  req.on('close', () => {
    clearInterval(keepalive);
    reservationEventClients.delete(res);
  });
});

// 404 Page
app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Page Not Found' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📁 Database: ${process.env.DB_NAME || 'kuliner_db'}`);
  (async () => {
    try {
      const hash = await bcrypt.hash('123456', 10);
      const users = [
        ['admin', 'Admin', 'admin'],
        ['lecturer1', 'Dosen 1', 'lecturer'],
        ['student1', 'Mahasiswa A', 'student']
      ];
      for (const [u, f, r] of users) {
        const [rows] = await poolPromise.query('SELECT id FROM users WHERE username=?', [u]);
        if (!rows.length) {
          await poolPromise.query('INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)', [u, hash, f, r]);
        } else {
          await poolPromise.query('UPDATE users SET password=? WHERE username=? AND password<>?', [hash, u, hash]);
        }
      }
    } catch {}
  })();
});
