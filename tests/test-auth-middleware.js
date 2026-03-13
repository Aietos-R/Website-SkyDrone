const axios = require('axios');

async function testAuthMiddleware() {
    try {
        console.log('🔍 Testing authentication middleware...');
        
        // Test 1: Try to access customer order page without login
        console.log('1. Testing access to /customer/order without login...');
        
        const response = await axios.get('http://localhost:3001/customer/order', {
            maxRedirects: 0, // Don't follow redirects
            validateStatus: function (status) {
                return status < 500; // Don't throw on 3xx/4xx
            }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers location:', response.headers.location);
        
        if (response.status === 302 && response.headers.location === '/login') {
            console.log('✅ SUCCESS: Redirected to login page correctly!');
        } else if (response.status === 200) {
            console.log('❌ FAILED: Still able to access without login');
            // Check if it's showing login page or customer page
            if (response.data.includes('Login') || response.data.includes('login')) {
                console.log('✅ Actually showing login page - this is correct');
            } else {
                console.log('❌ Showing customer page - middleware not working');
            }
        } else {
            console.log('⚠️  Unexpected response:', response.status);
        }
        
        // Test 2: Try to access customer cart without login
        console.log('\n2. Testing access to /customer/cart without login...');
        
        const cartResponse = await axios.get('http://localhost:3001/customer/cart', {
            maxRedirects: 0,
            validateStatus: function (status) {
                return status < 500;
            }
        });
        
        console.log('Cart response status:', cartResponse.status);
        console.log('Cart redirect location:', cartResponse.headers.location);
        
        if (cartResponse.status === 302 && cartResponse.headers.location === '/login') {
            console.log('✅ SUCCESS: Cart page also redirects to login correctly!');
        } else {
            console.log('❌ Cart page not redirecting properly');
        }
        
    } catch (error) {
        console.log('❌ Error during test:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Redirect location:', error.response.headers.location);
        }
    }
}

testAuthMiddleware();
