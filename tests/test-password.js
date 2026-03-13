const bcrypt = require('bcryptjs');

async function generateHash() {
  // Generate hash for "123456"
  const hash = await bcrypt.hash('123456', 10);
  console.log('Hash for "123456":', hash);
  
  // Test the hash from the database
  const isMatch = await bcrypt.compare('123456', '$2a$10$N9qo8uLOickgx2ZMRZoMye3H3WJ5pXU1c8Z9QpJq.5vF5Jz6vT5W.');
  console.log('Does database hash match "123456"?', isMatch);
  
  // Let's try some common passwords
  const commonPasswords = ['password', 'admin', 'student', '12345', '12345678', 'geprek'];
  
  for (const password of commonPasswords) {
    const match = await bcrypt.compare(password, '$2a$10$N9qo8uLOickgx2ZMRZoMye3H3WJ5pXU1c8Z9QpJq.5vF5Jz6vT5W.');
    if (match) {
      console.log(`Found! The password is: "${password}"`);
      break;
    }
  }
}

generateHash();
