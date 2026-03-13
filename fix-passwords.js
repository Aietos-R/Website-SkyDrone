const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function fixPasswords() {
  try {
    // Create connection
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kuliner_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Generate correct hash for "123456"
    const correctHash = await bcrypt.hash('123456', 10);
    console.log('Correct hash for "123456":', correctHash);

    // Update all users with the correct hash
    const updateQuery = 'UPDATE users SET password = ? WHERE username IN (?, ?, ?)';
    const [result] = await pool.execute(updateQuery, [correctHash, 'admin', 'lecturer1', 'student1']);
    
    console.log('Updated passwords for users:', result.affectedRows);

    // Verify the update
    const [users] = await pool.execute('SELECT username, password FROM users WHERE username IN (?, ?, ?)', ['admin', 'lecturer1', 'student1']);
    
    console.log('Updated users:');
    users.forEach(user => {
      console.log(`- ${user.username}: ${user.password}`);
    });

    // Test the hash
    const testResult = await bcrypt.compare('123456', correctHash);
    console.log('Hash verification test:', testResult);

    await pool.end();
    console.log('Password fix completed successfully!');

  } catch (error) {
    console.error('Error fixing passwords:', error);
  }
}

fixPasswords();