const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const db = require('../config/database');

const pool = db.promise();

const renderLogin = (req, res) => {
  res.render('auth/login', { title: 'Login', page: 'login' });
};

const renderSignup = (req, res) => {
  res.render('auth/signup', { 
    title: 'Signup', 
    page: 'signup',
    old_full_name: req.flash('old_full_name')[0] || '',
    old_username: req.flash('old_username')[0] || ''
  });
};

const login = async (req, res) => {
  console.log('Login controller reached - body:', req.body);
  
  const errors = validationResult(req);
  console.log('Validation errors:', errors.array());
  
  if (!errors.isEmpty()) {
    req.flash('error_msg', errors.array()[0].msg);
    return res.redirect('/login');
  }

  const { username, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (!rows.length) {
      req.flash('error_msg', 'Username tidak ditemukan');
      return res.redirect('/login');
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      req.flash('error_msg', 'Password salah');
      return res.redirect('/login');
    }

    console.log('Login - Before setting session.user:', {
      sessionID: req.sessionID,
      session: req.session
    });

    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regenerate error:', err);
        req.flash('error_msg', 'Terjadi kesalahan sistem');
        return res.redirect('/login');
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
      };

      // Initialize cart in session
      if (!req.session.cart) {
        req.session.cart = [];
      }

      req.flash('success_msg', `Selamat datang ${user.full_name}`);

      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          req.flash('error_msg', 'Terjadi kesalahan sistem');
          return res.redirect('/login');
        }
        
        // Redirect berdasarkan role
        if (user.role === 'admin' || user.role === 'lecturer') {
          return res.redirect('/admin');
        }
        if (user.role === 'customer' || user.role === 'student') {
          return res.redirect('/customer/beranda');
        }
        
        return res.redirect('/');
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    req.flash('error_msg', 'Terjadi kesalahan saat login');
    res.redirect('/login');
  }
};

const signup = async (req, res) => {
  const { username, password, full_name, role } = req.body;

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length) {
      req.flash('error_msg', 'Username sudah digunakan');
      req.flash('old_username', username);
      req.flash('old_full_name', full_name);
      return res.redirect('/signup');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error_msg', errors.array()[0].msg);
      req.flash('old_username', username);
      req.flash('old_full_name', full_name);
      return res.redirect('/signup');
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      req.flash('error_msg', 'Password minimal 6 karakter dan harus mengandung kombinasi huruf dan angka!');
      req.flash('old_username', username);
      req.flash('old_full_name', full_name);
      return res.redirect('/signup');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const finalRole = role || 'customer'; 
    
    await pool.query(
      'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, full_name, finalRole]
    );

    // 5. Sukses: Berikan notifikasi dan tetap di halaman signup (tanpa auto-login)
    req.flash('success_msg', 'Registrasi berhasil! Silakan menuju halaman Login untuk masuk.');
    return res.redirect('/signup');

  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Terjadi kesalahan saat registrasi sistem.');
    req.flash('old_username', username);
    req.flash('old_full_name', full_name);
    res.redirect('/signup');
  }
};

const logout = (req, res) => {
  const sid = req.sessionID;
  req.session.destroy(() => {
    res.clearCookie('htk.sid', { path: '/' });
    res.redirect('/');
  });
};

module.exports = {
  renderLogin,
  renderSignup,
  login,
  signup,
  logout,
};