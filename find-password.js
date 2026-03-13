const bcrypt = require('bcryptjs');

async function findPassword() {
  const hash = '$2a$10$N9qo8uLOickgx2ZMRZoMye3H3WJ5pXU1c8Z9QpJq.5vF5Jz6vT5W.';
  
  // Common passwords to try
  const passwords = [
    'password', 'admin', 'admin123', 'student', 'student1',
    '123456', '12345', '12345678', 'qwerty', 'abc123',
    'password123', 'admin1', 'geprek', 'ayam', 'arema',
    'ayamgeprek', 'geprekarema', 'high-tech', 'kuliner'
  ];
  
  console.log('Trying to find the correct password...');
  
  for (const password of passwords) {
    const match = await bcrypt.compare(password, hash);
    if (match) {
      console.log(`SUCCESS! The password is: "${password}"`);
      return;
    }
  }
  
  console.log('Password not found in common list. Let me try with the database hash pattern...');
  
  // The hash looks like it might be for "password" or similar
  // Let me check if it's actually for "password"
  const passwordHash = await bcrypt.hash('password', 10);
  console.log('Hash for "password":', passwordHash);
  
  // Check if the database hash matches any of our generated hashes
  const isPassword = await bcrypt.compare('password', hash);
  console.log('Is the hash for "password"?', isPassword);
}

findPassword();