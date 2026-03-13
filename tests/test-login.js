const axios = require('axios');

async function testLogin() {
  try {
    // Test login with proper form encoding
    const formData = new URLSearchParams();
    formData.append('username', 'student1');
    formData.append('password', '123456');
    
    console.log('Sending login request...');
    
    const loginResponse = await axios.post('http://localhost:3002/login', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0'
      },
      maxRedirects: 5, // Follow redirects
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept redirects
      }
    });
    
    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', loginResponse.headers);
    console.log('Login response data snippet:', loginResponse.data.substring(0, 200));
    
    // Get session cookie if available
    const cookie = loginResponse.headers['set-cookie'];
    console.log('Session cookie:', cookie);
    
    // Test accessing customer order page
    if (cookie) {
      const orderResponse = await axios.get('http://localhost:3002/customer/order', {
        headers: {
          'Cookie': cookie[0]
        }
      });
      
      console.log('Order page status:', orderResponse.status);
      console.log('Order page includes user info:', orderResponse.data.includes('student1'));
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testLogin();
