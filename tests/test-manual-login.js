const axios = require('axios');
const FormData = require('form-data');

async function testManualLogin() {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('username', 'admin');
    formData.append('password', '123456');

    console.log('Testing manual login with axios...');
    console.log('Username: admin');
    console.log('Password: 123456');

    // Test login
    const response = await axios.post('http://localhost:3001/login', formData, {
      headers: formData.getHeaders(),
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

testManualLogin();
