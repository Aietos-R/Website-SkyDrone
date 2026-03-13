const db = require('../config/database');

const pool = db.promise();

const DashboardController = {
  async index(req, res) {
    try {
      const [[menuStats]] = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM menus) AS total_menus,
          (SELECT COUNT(*) FROM transactions WHERE DATE(transaction_date) = CURDATE()) AS today_transactions,
          (SELECT IFNULL(SUM(total),0) FROM transactions WHERE MONTH(transaction_date) = MONTH(CURDATE())) AS month_revenue
      `);

      const [popularMenus] = await pool.query(`
        SELECT m.name, m.category, IFNULL(SUM(td.quantity), 0) AS sold
        FROM menus m
        LEFT JOIN transaction_details td ON td.menu_id = m.id
        GROUP BY m.id
        ORDER BY sold DESC
        LIMIT 4
      `);

      const [recentTransactions] = await pool.query(`
        SELECT t.*, u.full_name AS cashier
        FROM transactions t
        JOIN users u ON u.id = t.user_id
        ORDER BY t.transaction_date DESC
        LIMIT 5
      `);

      const [chartRows] = await pool.query(`
        SELECT DATE(transaction_date) AS date, SUM(total) AS revenue
        FROM transactions
        WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(transaction_date)
        ORDER BY DATE(transaction_date)
      `);

      const chartData = {
        labels: chartRows.map((row) => row.date),
        data: chartRows.map((row) => row.revenue),
      };

      const [[pendingCounts]] = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM online_orders WHERE status = 'pending') AS pending_online_orders,
          (SELECT COUNT(*) FROM reservations WHERE status = 'pending') AS pending_reservations
      `);

      res.render('admin/dashboard', {
        title: 'Dashboard',
        page: 'dashboard',
        menuStats,
        popularMenus,
        recentTransactions,
        chartData,
        pendingCounts,
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Gagal memuat data dashboard');
      res.redirect('/login');
    }
  },
};

module.exports = DashboardController;

