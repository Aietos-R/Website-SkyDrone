const axios = require('axios');
const qs = require('querystring');

async function testAddToCart() {
  try {
    // First, login as customer to get session
    const loginFormData = qs.stringify({
      username: 'student1',
      password: '123456'
    });

    console.log('Step 1: Logging in as student1...');
    const loginResponse = await axios.post('http://localhost:3001/login', loginFormData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      maxRedirects: 0,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      }
    });

    if (loginResponse.status === 302 && loginResponse.headers.location === '/customer/order') {
      console.log('✅ Login successful!');
      
      // Extract session cookie
      const sessionCookie = loginResponse.headers['set-cookie'][0];
      console.log('Session cookie obtained');

      // Now test adding to cart
      console.log('Step 2: Testing add to cart...');
      
      const cartData = qs.stringify({
        menu_id: '1',
        quantity: '2',
        notes: 'Test order'
      });

      console.log('Cart data:', cartData);

      const cartResponse = await axios.post('http://localhost:3001/customer/order/add', cartData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': sessionCookie
        },
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });

      console.log('Add to cart response status:', cartResponse.status);
      console.log('Add to cart response data:', cartResponse.data);

      if (cartResponse.status === 200) {
        console.log('✅ Add to cart successful!');
        console.log('Cart contents:', cartResponse.data);
      } else {
        console.log('❌ Add to cart failed');
      }

    } else {
      console.log('❌ Login failed');
    }

  } catch (error) {
    console.error('Add to cart test error:', error.message);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
  }
}

testAddToCart();
