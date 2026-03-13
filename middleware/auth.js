const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  req.flash('error_msg', 'Silakan login terlebih dahulu');
  res.redirect('/login');
};

const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  req.flash('error_msg', 'Akses ditolak. Hanya admin yang boleh mengakses');
  res.redirect('/login');
};

const isLecturer = (req, res, next) => {
  if (req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'lecturer')) {
    return next();
  }
  req.flash('error_msg', 'Akses terbatas untuk dosen dan admin');
  res.redirect('/login');
};

const isCustomer = (req, res, next) => {
  console.log('isCustomer path:', req.path);
  if (req.session.user && (req.session.user.role === 'customer' || req.session.user.role === 'student')) {
    console.log('isCustomer allowed for:', req.session.user.username);
    return next();
  }
  console.log('isCustomer denied. user:', req.session.user ? req.session.user.username : null);
  req.flash('error_msg', 'Akses dikhususkan untuk pelanggan');
  res.redirect('/login');
};

module.exports = { isAuthenticated, isAdmin, isLecturer, isCustomer };
