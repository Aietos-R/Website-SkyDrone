const bcrypt = require('bcryptjs');

async function verifyHash() {
  const hashFromDB = '$2a$10$N9qo8uLOickgx2ZMRZoMye3H3WJ5pXU1c8Z9QpJq.5vF5Jz6vT5W.';
  const password = '123456';
  
  console.log('Testing password:', password);
  console.log('Hash from database:', hashFromDB);
  
  // Test the comparison
  const isMatch = await bcrypt.compare(password, hashFromDB);
  console.log('Password matches?', isMatch);
  
  // Generate a new hash for the same password to compare
  const newHash = await bcrypt.hash(password, 10);
  console.log('New hash for same password:', newHash);
  
  // Test if the new hash matches
  const newHashMatch = await bcrypt.compare(password, newHash);
  console.log('New hash matches?', newHashMatch);
  
  // Let's try to generate a hash with the exact same salt and compare
  // Extract the salt from the hash
  const salt = hashFromDB.substring(0, 29); // $2a$10$N9qo8uLOickgx2ZMRZoMye
  console.log('Extracted salt:', salt);
  
  // Generate hash with same salt
  const hashWithSameSalt = await bcrypt.hash(password, salt);
  console.log('Hash with same salt:', hashWithSameSalt);
  
  const sameSaltMatch = await bcrypt.compare(password, hashWithSameSalt);
  console.log('Same salt hash matches?', sameSaltMatch);
}

verifyHash().catch(console.error);