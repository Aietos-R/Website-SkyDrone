const { validationResult } = require('express-validator');
const db = require('../config/database');

const pool = db.promise();

const generateInvoice = () => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  return `INV-${datePart}-${Math.floor(Math.random() * 900 + 100)}`;
};

const normalizeItems = (rawItems = {}) => {
  const collection = Array.isArray(rawItems) ? rawItems : Object.values(rawItems);
  return collection
    .map((item) => ({
      menu_id: Number(item.menu_id),
      quantity: Number(item.quantity),
    }))
    .filter((item) => item.menu_id && item.quantity > 0);
};

const TransactionController = {
  async list(req, res) {
    const { start_date, end_date, payment_method, keyword } = req.query;

    let filters = [];
    let params = [];

    if (start_date) {
      filters.push('DATE(t.transaction_date) >= ?');
      params.push(start_date);
    }

    if (end_date) {
      filters.push('DATE(t.transaction_date) <= ?');
      params.push(end_date);
    }

    if (payment_method) {
      filters.push('t.payment_method = ?');
      params.push(payment_method);
    }

    if (keyword) {
      filters.push('(t.invoice LIKE ? OR t.customer_name LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    try {
      const [transactions] = await pool.query(
        `
        SELECT t.*, u.full_name AS cashier
        FROM transactions t
        JOIN users u ON u.id = t.user_id
        ${whereClause}
        ORDER BY t.transaction_date DESC
      `,
        params
      );

      const transactionIds = transactions.map((t) => t.id);

      let detailsMap = {};
      if (transactionIds.length) {
        const [details] = await pool.query(
          `
          SELECT td.*, m.name AS menu_name
          FROM transaction_details td
          JOIN menus m ON m.id = td.menu_id
          WHERE td.transaction_id IN (?)
        `,
          [transactionIds]
        );

        details.forEach((detail) => {
          if (!detailsMap[detail.transaction_id]) {
            detailsMap[detail.transaction_id] = [];
          }
          detailsMap[detail.transaction_id].push(detail);
        });
      }

      const enriched = transactions.map((transaction) => ({
        ...transaction,
        items: detailsMap[transaction.id] || [],
      }));

      res.render('transactions/index', {
        title: 'Transactions',
        page: 'transaction',
        transactions: enriched,
        filters: { start_date, end_date, payment_method, keyword },
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Gagal memuat transaksi');
      res.redirect('/admin');
    }
  },

  async create(req, res) {
    try {
      const [menus] = await pool.query('SELECT id, name, price FROM menus WHERE is_available = TRUE ORDER BY name');
      const [popularMenus] = await pool.query(`
        SELECT m.id, m.name, m.price, IFNULL(SUM(td.quantity), 0) AS sold
        FROM menus m
        LEFT JOIN transaction_details td ON td.menu_id = m.id
        GROUP BY m.id
        ORDER BY sold DESC
        LIMIT 5
      `);

      res.render('admin/transaction/create', {
        title: 'New Transaction',
        page: 'transaction',
        menus,
        popularMenus,
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Gagal memuat form transaksi');
      res.redirect('/transactions');
    }
  },

  async store(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error_msg', errors.array()[0].msg);
      return res.redirect('/transactions/create');
    }

    const { customer_name, payment_method, items } = req.body;
    const normalizedItems = normalizeItems(items);

    if (!normalizedItems.length) {
      req.flash('error_msg', 'Minimal 1 item transaksi');
      return res.redirect('/transactions/create');
    }

    const menuIds = [...new Set(normalizedItems.map((item) => item.menu_id))];

    const invoice = generateInvoice();
    const connection = await pool.getConnection();

    try {
      const [menus] = await connection.query(
        `SELECT id, price, name, is_available FROM menus WHERE id IN (?)`,
        [menuIds]
      );

      if (menus.length !== menuIds.length) {
        req.flash('error_msg', 'Item menu tidak valid atau sudah dihapus');
        return res.redirect('/transactions/create');
      }

      const menuMap = menus.reduce((acc, menu) => {
        acc[menu.id] = menu;
        return acc;
      }, {});

      for (const item of normalizedItems) {
        if (!menuMap[item.menu_id].is_available) {
          req.flash('error_msg', `Menu ${menuMap[item.menu_id].name} sedang tidak tersedia`);
          return res.redirect('/transactions/create');
        }
      }

      const calculatedTotal = normalizedItems.reduce((sum, item) => {
        const menu = menuMap[item.menu_id];
        return sum + menu.price * item.quantity;
      }, 0);

      await connection.beginTransaction();

      const [transactionResult] = await connection.query(
        'INSERT INTO transactions (invoice, user_id, customer_name, total, payment_method) VALUES (?, ?, ?, ?, ?)',
        [invoice, req.session.user.id, customer_name, calculatedTotal, payment_method]
      );

      const transactionId = transactionResult.insertId;

      const detailValues = normalizedItems.map((item) => {
        const menu = menuMap[item.menu_id];
        return [transactionId, item.menu_id, item.quantity, menu.price];
      });

      await connection.query(
        'INSERT INTO transaction_details (transaction_id, menu_id, quantity, price) VALUES ?',
        [detailValues]
      );

      await connection.commit();

      req.flash('success_msg', `Transaksi ${invoice} berhasil disimpan`);
      res.redirect('/transactions');
    } catch (error) {
      await connection.rollback();
      console.error(error);
      req.flash('error_msg', 'Gagal menyimpan transaksi');
      res.redirect('/transactions');
    } finally {
      connection.release();
    }
  },

  async printInvoice(req, res) {
    try {
      const [[transaction]] = await pool.query(
        `
        SELECT t.*, u.full_name AS cashier
        FROM transactions t
        JOIN users u ON u.id = t.user_id
        WHERE t.id = ?
      `,
        [req.params.id]
      );

      if (!transaction) {
        req.flash('error_msg', 'Transaksi tidak ditemukan');
        return res.redirect('/transactions');
      }

      const [items] = await pool.query(
        `
        SELECT td.*, m.name AS menu_name
        FROM transaction_details td
        JOIN menus m ON m.id = td.menu_id
        WHERE td.transaction_id = ?
      `,
        [req.params.id]
      );

      res.render('transactions/print', {
        title: `Invoice ${transaction.invoice}`,
        transaction,
        items,
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Gagal menyiapkan invoice');
      res.redirect('/transactions');
    }
  },
};

module.exports = TransactionController;

