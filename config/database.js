const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kuliner_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    return;
  }
  console.log('✅ Database connected');
  connection.release();
});

module.exports = pool;

// Initialize tables for online orders if not exist
const initSql = `
CREATE TABLE IF NOT EXISTS online_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice VARCHAR(32) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  total INT NOT NULL,
  status ENUM('pending','approved','in_kitchen','ready','driver_picked','on_delivery','delivered','completed','rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS online_order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_id INT NOT NULL,
  name VARCHAR(128) NOT NULL,
  price INT NOT NULL,
  quantity INT NOT NULL,
  spicy_level INT DEFAULT 0,
  sambal_type VARCHAR(32),
  variant VARCHAR(32),
  FOREIGN KEY (order_id) REFERENCES online_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_id) REFERENCES menus(id)
);
`;

pool
  .promise()
  .query(initSql)
  .then(() =>
    pool
      .promise()
      .query(
        "ALTER TABLE online_orders MODIFY COLUMN status ENUM('pending','approved','in_kitchen','ready','driver_picked','on_delivery','delivered','completed','rejected') NOT NULL DEFAULT 'pending'"
      )
      .catch(() => {})
  )
  .catch(() => {});
