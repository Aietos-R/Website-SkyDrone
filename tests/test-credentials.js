const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function testCredentials() {
  try {
    // Test database connection and credentials
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'kuliner_db'
    });
    
    console.log('Testing database connection...');
    const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', ['student1']);
    
    if (rows.length === 0) {
      console.log('ERROR: User student1 not found in database');
      return;
    }
    
    const user = rows[0];
    console.log('Found user:', user.full_name, 'Role:', user.role);
    console.log('Stored password hash:', user.password);
    
    // Test password comparison
    const isMatch = await bcrypt.compare('123456', user.password);
    console.log('Password match for "123456":', isMatch);
    
    // Test with wrong password
    const isWrong = await bcrypt.compare('wrongpass', user.password);
    console.log('Password match for "wrongpass":', isWrong);
    
    await connection.end();
    
  } catch (error) {
    console.error('Database error:', error.message);
  }
}

testCredentials();
