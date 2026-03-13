const axios = require('axios');

async function testAdminDashboard() {
    try {
        // Test admin login
        const loginResponse = await axios.post('http://localhost:3001/auth/login', {
            username: 'admin',
            password: '123456'
        });
        
        if (loginResponse.data.success) {
            console.log('✅ Admin login successful');
            
            // Get session cookie
            const cookie = loginResponse.headers['set-cookie'][0];
            
            // Test dashboard access
            const dashboardResponse = await axios.get('http://localhost:3001/admin/', {
                headers: {
                    'Cookie': cookie
                }
            });
            
            if (dashboardResponse.status === 200) {
                console.log('✅ Admin dashboard accessible');
                
                // Check if chart data is present
                const responseData = dashboardResponse.data;
                if (responseData.includes('chartData') || responseData.includes('Chart')) {
                    console.log('✅ Chart components found in dashboard');
                } else {
                    console.log('⚠️  Chart components not clearly visible');
                }
                
                // Check for any JavaScript errors in the HTML
                if (responseData.includes('<%= JSON.stringify')) {
                    console.log('❌ Found unescaped EJS syntax - potential JavaScript error');
                } else {
                    console.log('✅ No unescaped EJS syntax found');
                }
                
                console.log('✅ Admin dashboard test completed successfully');
            } else {
                console.log('❌ Dashboard access failed:', dashboardResponse.status);
            }
        } else {
            console.log('❌ Admin login failed:', loginResponse.data.message);
        }
    } catch (error) {
        console.error('❌ Error testing admin dashboard:', error.message);
    }
}

testAdminDashboard();
