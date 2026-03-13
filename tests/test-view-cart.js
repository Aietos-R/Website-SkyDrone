const axios = require('axios');
const qs = require('querystring');

async function testViewCart() {
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

      // Add an item to cart first
      console.log('Step 2: Adding item to cart...');
      const cartData = qs.stringify({
        menu_id: '2',
        quantity: '1',
        notes: 'Test order'
      });

      const addResponse = await axios.post('http://localhost:3001/customer/order/add', cartData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': sessionCookie
        }
      });

      console.log('Add to cart response:', addResponse.data);

      // Now view the cart
      console.log('Step 3: Viewing cart...');
      const cartViewResponse = await axios.get('http://localhost:3001/customer/cart', {
        headers: {
          'Cookie': sessionCookie
        }
      });

      console.log('Cart view status:', cartViewResponse.status);
      console.log('Cart view HTML contains cart data:', cartViewResponse.data.includes('Keranjang'));
      
      if (cartViewResponse.data.includes('Keranjang')) {
        console.log('✅ Cart view successful! Cart page is accessible');
      } else {
        console.log('❌ Cart view failed or cart is empty');
      }

    } else {
      console.log('❌ Login failed');
    }

  } catch (error) {
    console.error('View cart test error:', error.message);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data length:', error.response.data.length);
    }
  }
}

testViewCart();
