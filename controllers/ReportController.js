const db = require('../config/database');

const pool = db.promise();

const ReportController = {
  async index(req, res) {
    const { start_date, end_date, payment_method } = req.query;

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
      let itemsMap = {};

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
          if (!itemsMap[detail.transaction_id]) {
            itemsMap[detail.transaction_id] = [];
          }
          itemsMap[detail.transaction_id].push(detail);
        });
      }

      const enrichedTransactions = transactions.map((transaction) => ({
        ...transaction,
        items: itemsMap[transaction.id] || [],
      }));

      const [[summary]] = await pool.query(
        `
        SELECT 
          COUNT(*) AS total_transactions,
          IFNULL(SUM(total), 0) AS total_revenue,
          IFNULL(AVG(total), 0) AS average_transaction
        FROM transactions t
        ${whereClause}
      `,
        params
      );

      const [chartRows] = await pool.query(
        `
        SELECT DATE(transaction_date) AS date, SUM(total) AS revenue
        FROM transactions t
        ${whereClause || 'WHERE 1=1'}
        GROUP BY DATE(transaction_date)
        ORDER BY DATE(transaction_date)
        LIMIT 14
      `,
        params
      );

      const chartData = {
        labels: chartRows.map((row) => row.date),
        data: chartRows.map((row) => row.revenue),
      };

      res.render('admin/report', {
        title: 'Transaction Reports',
        page: 'report',
        transactions: enrichedTransactions,
        summary,
        chartData,
        startDate: start_date || '',
        endDate: end_date || '',
        paymentMethod: payment_method || '',
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Gagal memuat laporan');
      res.redirect('/admin');
    }
  },
};

module.exports = ReportController;

