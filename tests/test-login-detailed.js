const axios = require('axios');

async function testLoginDetailed() {
  try {
    // First, get the login page to see the form
    console.log('Getting login page...');
    const loginPageResponse = await axios.get('http://localhost:3002/login');
    console.log('Login page status:', loginPageResponse.status);
    
    // Test login with proper form encoding
    console.log('\nSending login request...');
    const formData = new URLSearchParams();
    formData.append('username', 'student1');
    formData.append('password', '123456');
    
    const loginResponse = await axios.post('http://localhost:3002/login', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0'
      },
      maxRedirects: 0, // Don't follow redirects to see the initial response
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept redirects
      }
    });
    
    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', loginResponse.headers);
    
    // Check if it's a redirect
    if (loginResponse.status >= 300 && loginResponse.status < 400) {
      console.log('Redirect location:', loginResponse.headers.location);
      
      // Follow the redirect manually to see where it goes
      const redirectResponse = await axios.get('http://localhost:3002' + loginResponse.headers.location, {
        headers: {
          'Cookie': loginResponse.headers['set-cookie'][0]
        }
      });
      
      console.log('Redirect response status:', redirectResponse.status);
      console.log('Redirect response data snippet:', redirectResponse.data.substring(0, 300));
      console.log('Contains user info:', redirectResponse.data.includes('student1'));
    } else {
      console.log('Login response data snippet:', loginResponse.data.substring(0, 300));
      
      // Check for error messages
      if (loginResponse.data.includes('Username tidak ditemukan')) {
        console.log('ERROR: Username not found');
      } else if (loginResponse.data.includes('Password salah')) {
        console.log('ERROR: Wrong password');
      } else if (loginResponse.data.includes('error_msg')) {
        console.log('ERROR: General error message found');
      }
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testLoginDetailed();
