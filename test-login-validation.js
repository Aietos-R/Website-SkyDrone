const axios = require('axios');

async function testLoginWithValidation() {
  try {
    console.log('Testing login with detailed validation...');
    
    // Test login with proper form encoding
    const formData = new URLSearchParams();
    formData.append('username', 'student1');
    formData.append('password', '123456');
    
    console.log('Form data:', formData.toString());
    
    const loginResponse = await axios.post('http://localhost:3002/login', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      },
      maxRedirects: 0,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      }
    });
    
    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', loginResponse.headers);
    
    if (loginResponse.status === 302) {
      console.log('Redirect location:', loginResponse.headers.location);
      
      // Get the session cookie
      const cookie = loginResponse.headers['set-cookie'];
      console.log('Session cookie:', cookie);
      
      if (loginResponse.headers.location === '/login') {
        console.log('ERROR: Login failed - redirected back to login page');
        
        // Try to get the error message by following the redirect
        const redirectResponse = await axios.get('http://localhost:3002/login', {
          headers: {
            'Cookie': cookie ? cookie[0] : ''
          }
        });
        
        // Look for error messages in the response
        if (redirectResponse.data.includes('error_msg')) {
          console.log('Found error message in response');
          
          // Extract error message (this is a simple approach)
          const errorMatch = redirectResponse.data.match(/error_msg[^]*?>([^<]+)</);
          if (errorMatch) {
            console.log('Error message:', errorMatch[1].trim());
          }
        }
      } else {
        console.log('SUCCESS: Login redirected to:', loginResponse.headers.location);
      }
    } else {
      console.log('Login response status:', loginResponse.status);
      console.log('Login response data snippet:', loginResponse.data.substring(0, 300));
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data.substring(0, 300));
    }
  }
}

testLoginWithValidation();