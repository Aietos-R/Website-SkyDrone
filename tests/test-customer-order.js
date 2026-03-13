const axios = require('axios');

async function testCustomerOrderPage() {
    try {
        console.log('Testing customer order page...');
        
        // Test customer login
        const loginResponse = await axios.post('http://localhost:3001/login', {
            username: 'customer1',
            password: '123456'
        });
        
        console.log('Customer login response:', loginResponse.data);
        
        if (loginResponse.data.success) {
            console.log('✅ Customer login successful');
            
            // Get session cookie
            const cookie = loginResponse.headers['set-cookie'][0];
            
            // Test customer order page access
            const orderResponse = await axios.get('http://localhost:3001/customer/order', {
                headers: {
                    'Cookie': cookie
                }
            });
            
            console.log('Order page status:', orderResponse.status);
            
            if (orderResponse.status === 200) {
                console.log('✅ Customer order page accessible');
                
                // Check for menu items and rating functionality
                const responseData = orderResponse.data;
                
                if (responseData.includes('quickView')) {
                    console.log('✅ Quick view functionality found');
                }
                
                if (responseData.includes('rateMenu')) {
                    console.log('✅ Rate menu functionality found');
                }
                
                if (responseData.includes('addToCart')) {
                    console.log('✅ Add to cart functionality found');
                }
                
                // Check for proper JSON escaping in rating functionality
                if (responseData.includes('rateMenu(\'<%- menu.id %>\', <%- i %>)')) {
                    console.log('✅ Proper JSON escaping found in rating function');
                } else if (responseData.includes('rateMenu(')) {
                    console.log('⚠️  Rating function found but check escaping');
                }
                
                // Check for quickView JSON escaping
                if (responseData.includes('quickView(<%- JSON.stringify(menu) %>)')) {
                    console.log('✅ Proper JSON escaping found in quickView function');
                } else if (responseData.includes('quickView(')) {
                    console.log('⚠️  QuickView function found but check escaping');
                }
                
                // Check for any JavaScript syntax errors
                if (responseData.includes('<%= JSON.stringify')) {
                    console.log('❌ Found unescaped EJS syntax - potential JavaScript error');
                } else {
                    console.log('✅ No unescaped EJS syntax found');
                }
                
                console.log('✅ Customer order page test completed successfully');
            } else {
                console.log('❌ Order page access failed:', orderResponse.status);
            }
        } else {
            console.log('❌ Customer login failed:', loginResponse.data.message);
        }
    } catch (error) {
        console.error('❌ Error testing customer order page:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data.substring(0, 200));
        }
    }
}

testCustomerOrderPage();
