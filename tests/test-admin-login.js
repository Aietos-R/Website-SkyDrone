const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    // Test login with admin credentials
    const formData = new URLSearchParams();
    formData.append('username', 'admin');
    formData.append('password', 'password'); // Try "password" instead
    
    const loginResponse = await axios.post('http://localhost:3002/login', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0'
      },
      maxRedirects: 0,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      }
    });
    
    console.log('Admin login response status:', loginResponse.status);
    console.log('Admin login redirect location:', loginResponse.headers.location);
    
    if (loginResponse.headers.location !== '/login') {
      console.log('SUCCESS: Admin login redirected to:', loginResponse.headers.location);
      
      // Test the session
      const cookie = loginResponse.headers['set-cookie'];
      if (cookie) {
        const orderResponse = await axios.get('http://localhost:3002' + loginResponse.headers.location, {
          headers: {
            'Cookie': cookie[0]
          }
        });
        
        console.log('Admin dashboard status:', orderResponse.status);
        console.log('Contains admin info:', orderResponse.data.includes('admin') || orderResponse.data.includes('Admin'));
      }
    } else {
      console.log('Admin login also failed');
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testAdminLogin();
