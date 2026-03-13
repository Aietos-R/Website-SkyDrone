const axios = require('axios');

async function testCart() {
    try {
        console.log('🔍 Testing cart functionality...');
        
        // 1. Login sebagai customer
        console.log('1. Logging in as customer...');
        const params = new URLSearchParams();
        params.append('username', 'student1');
        params.append('password', '123456');
        const loginRes = await axios.post('http://localhost:3001/login', params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, maxRedirects: 0, validateStatus: s => s < 500 });
        
        if (!(loginRes.status === 302 && loginRes.headers['set-cookie'])) {
            console.log('❌ Login failed: status', loginRes.status);
            return;
        }
        
        console.log('✅ Login redirect received');
        const cookie = loginRes.headers['set-cookie'][0];
        
        // 2. Cek session cart setelah login
        console.log('2. Checking session cart after login...');
        
        // 3. Tambah item ke keranjang
        console.log('3. Adding item to cart...');
        const addParams = new URLSearchParams();
        addParams.append('menu_id', '1');
        addParams.append('quantity', '2');
        const addCartRes = await axios.post('http://localhost:3001/customer/order/add', addParams, {
            headers: {
                'Cookie': cookie,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        console.log('Add cart response:', addCartRes.data);
        
        if (addCartRes.data.success) {
            console.log('✅ Item added to cart');
            console.log('Cart count:', addCartRes.data.cartCount);
        } else {
            console.log('❌ Failed to add item:', addCartRes.data.message);
        }
        
        // 4. Lihat keranjang
        console.log('4. Viewing cart...');
        const cartRes = await axios.get('http://localhost:3001/customer/cart', {
            headers: { 'Cookie': cookie }
        });
        
        console.log('Cart page status:', cartRes.status);
        if (cartRes.status === 200) {
            console.log('✅ Cart page accessible');
            // Cek jika ada item di keranjang
            if (cartRes.data.includes('Keranjang Masih Kosong')) {
                console.log('❌ Cart is still empty!');
            } else if (cartRes.data.includes('item') || cartRes.data.includes('menu')) {
                console.log('✅ Cart has items!');
            }
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
    }
}

testCart();
