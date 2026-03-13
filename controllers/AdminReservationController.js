const db = require('../config/database');

const pool = db.promise();

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      date DATE NOT NULL,
      time TIME NOT NULL,
      party_size INT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);
  await pool.query(`ALTER TABLE reservations ADD COLUMN reason VARCHAR(255) NULL`).catch(() => {});
}

const AdminReservationController = {
  async index(req, res) {
    try {
      await ensureTable();
      const [rows] = await pool.query(
        `SELECT * FROM reservations ORDER BY created_at DESC`
      );
      res.render('admin/reservations/index', {
        title: 'Reservations',
        page: 'reservations',
        reservations: rows,
      });
    } catch (error) {
      console.error('Admin reservations error:', error);
      req.flash('error_msg', 'Gagal memuat reservasi');
      res.redirect('/admin');
    }
  },

  async updateStatus(req, res) {
    try {
      await ensureTable();
      const { status, reason } = req.body;
      await pool.query(
        `UPDATE reservations SET status=?, reason=? WHERE id=?`,
        [status, reason || null, req.params.id]
      );
      req.flash('success_msg', 'Status reservasi diperbarui');
      res.redirect('/admin/reservations');
    } catch (error) {
      console.error('Update reservation status error:', error);
      req.flash('error_msg', 'Gagal memperbarui reservasi');
      res.redirect('/admin/reservations');
    }
  },
};

module.exports = AdminReservationController;
