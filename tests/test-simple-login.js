const axios = require('axios');
const qs = require('querystring');

async function testSimpleLogin() {
  try {
    // Create URL-encoded form data
    const formData = qs.stringify({
      username: 'admin',
      password: '123456'
    });

    console.log('Testing simple login with URL-encoded data...');
    console.log('Form data:', formData);

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
    console.log('Response headers:', response.headers);
    console.log('Redirect location:', response.headers.location);

    if (response.status === 302) {
      if (response.headers.location === '/admin') {
        console.log('✅ Login successful! Redirecting to /admin');
      } else if (response.headers.location === '/login') {
        console.log('❌ Login failed! Redirecting back to /login');
      } else {
        console.log('Redirecting to:', response.headers.location);
      }
    }

  } catch (error) {
    console.error('Login test error:', error.message);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
  }
}

testSimpleLogin();
