const db = require('../config/database');

const pool = db.promise();

async function ensureOnlineOrderTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS online_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice VARCHAR(32) NOT NULL,
      user_id INT NOT NULL,
      total INT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS online_order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      menu_id INT NOT NULL,
      name VARCHAR(120) NOT NULL,
      price INT NOT NULL,
      quantity INT NOT NULL,
      spicy_level INT DEFAULT 0,
      sambal_type VARCHAR(50) NULL,
      variant VARCHAR(50) NULL,
      FOREIGN KEY (order_id) REFERENCES online_orders(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);
}

const AdminOnlineOrderController = {
  async index(req, res) {
    try {
      await ensureOnlineOrderTables();
      const [orders] = await pool.query(
        `
        SELECT o.*, u.full_name AS customer
        FROM online_orders o
        JOIN users u ON u.id = o.user_id
        ORDER BY o.created_at DESC
        `
      );

      // Fetch order items for each order
      for (let order of orders) {
        const [items] = await pool.query(
          `
          SELECT oi.*, m.image, m.category
          FROM online_order_items oi
          JOIN menus m ON m.id = oi.menu_id
          WHERE oi.order_id = ?
          `,
          [order.id]
        );
        order.items = items;
      }

      res.render('admin/online_orders/index', {
        title: 'Online Orders',
        page: 'online_orders',
        orders,
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Gagal memuat online orders');
      res.redirect('/admin');
    }
  },

  async approve(req, res) {
    try {
      await ensureOnlineOrderTables();
      // Get order details for notification
      const [orderDetails] = await pool.query(
        `
        SELECT o.*, u.full_name
        FROM online_orders o
        JOIN users u ON u.id = o.user_id
        WHERE o.id = ?
        `,
        [req.params.id]
      );

      if (orderDetails.length > 0) {
        const order = orderDetails[0];
        
        // TODO: Send WhatsApp notification
        console.log(`📱 WhatsApp notification placeholder: Pesanan ${order.invoice} untuk ${order.full_name} telah disetujui`);
        
        // TODO: Send SMS notification
        console.log(`📲 SMS notification placeholder: Pesanan ${order.invoice} telah disetujui. Total: Rp ${order.total.toLocaleString('id-ID')}`);
      }

      await pool.query('UPDATE online_orders SET status = ? WHERE id = ?', ['approved', req.params.id]);
      req.flash('success_msg', 'Pesanan disetujui - Notifikasi akan dikirim');
      res.redirect('/admin/online-orders');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Gagal menyetujui pesanan');
      res.redirect('/admin/online-orders');
    }
  },

  async reject(req, res) {
    try {
      await ensureOnlineOrderTables();
      // Get order details for notification
      const [orderDetails] = await pool.query(
        `
        SELECT o.*, u.full_name
        FROM online_orders o
        JOIN users u ON u.id = o.user_id
        WHERE o.id = ?
        `,
        [req.params.id]
      );

      if (orderDetails.length > 0) {
        const order = orderDetails[0];
        
        // TODO: Send WhatsApp notification
        console.log(`📱 WhatsApp notification placeholder: Maaf, pesanan ${order.invoice} untuk ${order.full_name} telah ditolak`);
        
        // TODO: Send SMS notification
        console.log(`📲 SMS notification placeholder: Maaf, pesanan ${order.invoice} telah ditolak. Silakan hubungi kami untuk informasi lebih lanjut.`);
      }

      await pool.query('UPDATE online_orders SET status = ? WHERE id = ?', ['rejected', req.params.id]);
      req.flash('success_msg', 'Pesanan ditolak - Notifikasi akan dikirim');
      res.redirect('/admin/online-orders');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Gagal menolak pesanan');
      res.redirect('/admin/online-orders');
    }
  },

  async updateStatus(req, res) {
    try {
      await ensureOnlineOrderTables();
      const { status } = req.body;
      const orderId = req.params.id;
      const allowed = ['approved','in_kitchen','ready','driver_picked','on_delivery','delivered','completed'];
      if (!allowed.includes(status)) {
        req.flash('error_msg', 'Status tidak valid');
        return res.redirect('/admin/online-orders');
      }

      await pool.query('UPDATE online_orders SET status = ? WHERE id = ?', [status, orderId]);
      req.flash('success_msg', `Status pesanan diperbarui menjadi: ${status}`);
      res.redirect('/admin/online-orders');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Gagal memperbarui status pesanan');
      res.redirect('/admin/online-orders');
    }
  },
};

module.exports = AdminOnlineOrderController;
