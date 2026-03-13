const { body } = require('express-validator');

const usernameValidator = body('username')
  .trim()
  .isLength({ min: 4 })
  .withMessage('Username minimal 4 karakter')
  .matches(/^[a-zA-Z0-9_]+$/)
  .withMessage('Username hanya boleh huruf, angka, dan underscore');

const passwordValidator = body('password')
  .isLength({ min: 6 })
  .withMessage('Password minimal 6 karakter')
  .matches(/[A-Z]/)
  .withMessage('Password harus mengandung huruf kapital')
  .matches(/[0-9]/)
  .withMessage('Password harus mengandung angka');

const signupValidation = [
  usernameValidator,
  passwordValidator,
  body('retype_password')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Konfirmasi password tidak cocok'),
  body('full_name').trim().notEmpty().withMessage('Nama lengkap wajib diisi'),
  body('role').optional().isIn(['admin', 'lecturer', 'student', 'customer']).withMessage('Role tidak valid'),
];

const loginValidation = [
  body('username')
    .trim()
    .isLength({ min: 4 })
    .withMessage('Username minimal 4 karakter')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username hanya boleh huruf, angka, dan underscore'),
  body('password').notEmpty().withMessage('Password wajib diisi')
];

const menuValidation = [
  body('name').trim().notEmpty().withMessage('Nama menu wajib diisi'),
  body('category')
    .isIn(['ayam', 'nasi', 'minuman', 'side_dish', 'paket'])
    .withMessage('Kategori tidak valid'),
  body('price').isInt({ min: 1000 }).withMessage('Harga minimal 1000'),
  body('description').trim().isLength({ min: 10 }).withMessage('Deskripsi minimal 10 karakter'),
  body('spicy_level').optional().isInt({ min: 0, max: 3 }).withMessage('Level pedas 0-3'),
];

const transactionValidation = [
  body('customer_name').trim().notEmpty().withMessage('Nama pelanggan wajib diisi'),
  body('payment_method').isIn(['cash', 'qris', 'debit']).withMessage('Metode pembayaran tidak valid'),
  body('items')
    .custom((items) => {
      if (!items || !Object.keys(items).length) {
        throw new Error('Minimal 1 item transaksi');
      }

      const invalid = Object.values(items).some((item) => {
        const qty = Number(item.quantity);
        return !item.menu_id || Number.isNaN(qty) || qty <= 0;
      });

      if (invalid) {
        throw new Error('Item transaksi tidak valid');
      }
      return true;
    }),
  body('total').isInt({ min: 1 }).withMessage('Total transaksi tidak valid'),
];

module.exports = {
  signupValidation,
  loginValidation,
  menuValidation,
  transactionValidation,
};

