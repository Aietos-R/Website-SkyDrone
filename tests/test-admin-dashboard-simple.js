const axios = require('axios');

async function testAdminDashboard() {
    try {
        console.log('Testing admin dashboard access...');
        
        // Test admin login
        const loginResponse = await axios.post('http://localhost:3001/auth/login', {
            username: 'admin',
            password: '123456'
        });
        
        console.log('Login response:', loginResponse.data);
        
        if (loginResponse.data.success) {
            console.log('✅ Admin login successful');
            
            // Get session cookie
            const cookie = loginResponse.headers['set-cookie'][0];
            console.log('Session cookie obtained');
            
            // Test dashboard access
            const dashboardResponse = await axios.get('http://localhost:3001/admin/', {
                headers: {
                    'Cookie': cookie
                },
                maxRedirects: 0,
                validateStatus: function (status) {
                    return status < 500; // Don't throw on 4xx responses
                }
            });
            
            console.log('Dashboard status:', dashboardResponse.status);
            
            if (dashboardResponse.status === 200) {
                console.log('✅ Admin dashboard accessible');
                
                // Check for chart data in the response
                const responseData = dashboardResponse.data;
                
                if (responseData.includes('chartData')) {
                    console.log('✅ Chart data found in dashboard');
                }
                
                // Check for any problematic EJS syntax
                if (responseData.includes('<%= JSON.stringify')) {
                    console.log('❌ Found unescaped EJS syntax - potential JavaScript error');
                } else {
                    console.log('✅ No unescaped EJS syntax found');
                }
                
                // Check for proper chart script setup
                if (responseData.includes('const labels = <%- JSON.stringify')) {
                    console.log('✅ Proper chart labels setup found');
                }
                
                if (responseData.includes('const data = <%- JSON.stringify')) {
                    console.log('✅ Proper chart data setup found');
                }
                
                console.log('✅ Admin dashboard test completed successfully');
            } else {
                console.log('❌ Dashboard access failed:', dashboardResponse.status);
                console.log('Response:', dashboardResponse.data.substring(0, 200));
            }
        } else {
            console.log('❌ Admin login failed:', loginResponse.data.message);
        }
    } catch (error) {
        console.error('❌ Error testing admin dashboard:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data.substring(0, 200));
        }
    }
}

testAdminDashboard();
