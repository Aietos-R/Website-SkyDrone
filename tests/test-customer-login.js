const axios = require('axios');
const qs = require('querystring');

async function testCustomerLogin() {
  try {
    // Create URL-encoded form data
    const formData = qs.stringify({
      username: 'student1',
      password: '123456'
    });

    console.log('Testing customer login...');
    console.log('Username: student1');
    console.log('Password: 123456');

    // Test login
    const response = await axios.post('http://localhost:3001/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      maxRedirects: 0,
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept redirects
      }
    });

    console.log('Response status:', response.status);
    console.log('Redirect location:', response.headers.location);

    if (response.status === 302) {
      if (response.headers.location === '/customer/order') {
        console.log('✅ Customer login successful! Redirecting to /customer/order');
        
        // Extract session cookie
        const sessionCookie = response.headers['set-cookie'][0];
        console.log('Session cookie:', sessionCookie);
        
        return sessionCookie;
      } else {
        console.log('❌ Customer login failed! Redirecting to:', response.headers.location);
      }
    }

  } catch (error) {
    console.error('Customer login test error:', error.message);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
  }
}

testCustomerLogin();
