const db = require('../config/database');

const pool = db.promise();

const generateInvoice = () => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  return `CUST-${datePart}-${Math.floor(Math.random() * 900 + 100)}`;
};

const CustomerController = {

  
  async renderBeranda(req, res) {
    try {
      const cart = Array.isArray(req.session.cart) ? req.session.cart : [];
      const cartCount = cart.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
      
      res.render('customer/beranda', {
        title: 'Beranda',
        page: 'home',
        user: req.session.user,
        cartCount: cartCount,
        layout: 'customer-start'
      });
    } catch (error) {
      console.error('Error muat beranda:', error);
      res.redirect('/login');
    }
  },

  //Pengiriman
  async renderSend(req, res) {
    try {
      const cart = Array.isArray(req.session.cart) ? req.session.cart : [];
      const cartCount = cart.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);

      res.render('customer/send', {
        title: 'Kirim Paket',
        page: 'send',
        user: req.session.user,
        cartCount: cartCount
      });
    } catch (error) {
      console.error('Error rendering send page:', error);
      res.redirect('/customer/beranda');
    }
  },

  // Fungsi Simpan Pengiriman Langsung (Alamat)
  async submitSendDirect(req, res) {
    try {
      const { receiver_name, receiver_phone, receiver_address, item_category, item_weight } = req.body;
      const userId = req.session.user.id;

      await pool.query(
        `INSERT INTO drone_deliveries (user_id, delivery_type, receiver_name, receiver_phone, receiver_address, item_category, item_weight) 
         VALUES (?, 'direct', ?, ?, ?, ?, ?)`,
        [userId, receiver_name, receiver_phone, receiver_address, item_category, item_weight]
      );

      req.flash('success_msg', 'Pengiriman diproses! Drone sedang menuju lokasi Anda.');
      res.redirect('/customer/orders'); // Arahkan ke halaman pesanan saya
    } catch (error) {
      console.error('Error send direct:', error);
      req.flash('error_msg', 'Gagal memproses pengiriman.');
      res.redirect('/customer/send');
    }
  },

  // Fungsi Simpan Pengiriman Loker Pintar (AJAX)
  async submitSendSetpoint(req, res) {
    try {
      const { setpoint_location, receiver_name, receiver_phone, item_category, item_weight, pickup_pin } = req.body;
      const userId = req.session.user.id;

      await pool.query(
        `INSERT INTO drone_deliveries (user_id, delivery_type, receiver_name, receiver_phone, setpoint_location, item_category, item_weight, pickup_pin) 
         VALUES (?, 'setpoint', ?, ?, ?, ?, ?, ?)`,
        [userId, receiver_name, receiver_phone, setpoint_location, item_category, item_weight, pickup_pin]
      );

      res.json({ success: true, message: 'Data berhasil disimpan' });
    } catch (error) {
      console.error('Error send setpoint:', error);
      res.status(500).json({ success: false, message: 'Gagal memproses data pengiriman' });
    }
  },
  
  async renderMcd(req, res) {
    try {
      const cart = Array.isArray(req.session.cart) ? req.session.cart : [];
      const cartCount = cart.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);

      res.render('customer/restaurant/mcd', {
        title: "McDonald's",
        page: 'restaurant',
        user: req.session.user,
        cartCount: cartCount
      });
    } catch (error) {
      console.error(error);
      res.redirect('/customer/beranda');
    }
  },

  async renderArema(req, res) {
    try {
      const [menus] = await pool.query('SELECT id, name, price, category, description, image FROM menus WHERE is_available = TRUE ORDER BY category, name');
      
      const enriched = menus.map((m) => ({ ...m }));
      const featuredCount = Math.min(8, enriched.length);
      for (let i = 0; i < featuredCount; i++) {
        const mod = i % 3;
        enriched[i].is_promo = mod === 0;
        enriched[i].is_new = mod === 1;
        enriched[i].is_bestseller = mod === 2;
      }
      
      const grouped = enriched.reduce((acc, m) => {
        if (!acc[m.category]) acc[m.category] = [];
        acc[m.category].push(m);
        return acc;
      }, {});

      const cart = Array.isArray(req.session.cart) ? req.session.cart : [];
      const cartCount = cart.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);

      res.render('customer/restaurant/arema', {
        title: "Ayam Geprek Arema",
        page: 'restaurant',
        user: req.session.user,
        cartCount: cartCount,
        categories: grouped
      });
    } catch (error) {
      console.error(error);
      res.redirect('/customer/beranda');
    }
  },

  async renderRestaurantList(req, res) {
    try {
      const cart = Array.isArray(req.session.cart) ? req.session.cart : [];
      const cartCount = cart.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);

      res.render('customer/restaurant', {
        title: 'Daftar Restoran',
        page: 'restaurant',
        user: req.session.user,
        cartCount: cartCount
      });
    } catch (error) {
      console.error(error);
      res.redirect('/customer/beranda');
    }
  },
  

  // belum di gunakan
  async menu(req, res) {
    try {
      const [menus] = await pool.query('SELECT id, name, price, category, description, image FROM menus WHERE is_available = TRUE ORDER BY category, name');

      const enriched = menus.map((m) => ({ ...m }));
      const featuredCount = Math.min(8, enriched.length);
      for (let i = 0; i < featuredCount; i++) {
        const mod = i % 3;
        enriched[i].is_promo = mod === 0;
        enriched[i].is_new = mod === 1;
        enriched[i].is_bestseller = mod === 2;
      }

      const grouped = enriched.reduce((acc, m) => {
        if (!acc[m.category]) acc[m.category] = [];
        acc[m.category].push(m);
        return acc;
      }, {});

      // Get cart count for navbar
      const cart = Array.isArray(req.session.cart) ? req.session.cart : [];
      const cartCount = cart.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
      const cartTotal = cart.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);

      res.render('customer/beranda', {
        title: 'Pesan Online',
        categories: grouped,
        cartCount,
        cartTotal,
        layout: 'customer-start',
        page: 'order',
        user: req.session.user
      });
    } catch (error) {
      res.status(500).render('404', { title: 'Terjadi kesalahan' });
    }
  },
  

  async profileForm(req, res) {
    const cart = Array.isArray(req.session.cart) ? req.session.cart : [];
    const cartCount = cart.length;
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        notify_whatsapp TINYINT(1) NOT NULL DEFAULT 1,
        default_spicy_level INT NOT NULL DEFAULT 0,
        default_sambal_type VARCHAR(50) NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    const [[dbUser]] = await pool.query('SELECT id, username, full_name, role, created_at, nomor_whatsapp FROM users WHERE id = ?', [req.session.user.id]);
    const [[settings]] = await pool.query('SELECT * FROM user_settings WHERE user_id = ?', [req.session.user.id]);
    res.render('customer/profile', {
      title: 'Profil Saya',
      user: { ...req.session.user, created_at: dbUser ? dbUser.created_at : null, nomor_whatsapp: dbUser ? dbUser.nomor_whatsapp : '' },
      cartCount,
      layout: 'customer-start',
      page: 'profile',
      settings: settings || { notify_whatsapp: 1, default_spicy_level: 0, default_sambal_type: null },
    });
  },

  async profileUpdate(req, res) {
    const { full_name, nomor_whatsapp } = req.body;

    console.log("Data form yang dikirim:", req.body);

    try {
      await pool.query('UPDATE users SET full_name = ?, nomor_whatsapp = ? WHERE id = ?', [full_name, nomor_whatsapp, req.session.user.id]);
      req.session.user.full_name = full_name;
      req.session.user.nomor_whatsapp = nomor_whatsapp;

      req.flash('success_msg', 'Profil berhasil diperbarui');
      res.redirect('/customer/profile');
    } catch (error) {
      console.error('Profile update error:', error);
      req.flash('error_msg', 'Gagal memperbarui profil');
      res.redirect('/customer/profile');
    }
  },

  async profileChangePassword(req, res) {
    const { current_password, new_password } = req.body;
    try {
      const [[user]] = await pool.query('SELECT password FROM users WHERE id = ?', [req.session.user.id]);
      const match = await require('bcryptjs').compare(current_password, user.password);
      if (!match) {
        req.flash('error_msg', 'Password saat ini salah');
        return res.redirect('/customer/profile');
      }
      const hashed = await require('bcryptjs').hash(new_password, 10);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.session.user.id]);
      req.flash('success_msg', 'Password berhasil diubah');
      res.redirect('/customer/profile');
    } catch (error) {
      console.error('Change password error:', error);
      req.flash('error_msg', 'Gagal mengubah password');
      res.redirect('/customer/profile');
    }
  },

  async settingsForm(req, res) {
    const cart = Array.isArray(req.session.cart) ? req.session.cart : [];
    const cartCount = cart.length;
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        notify_whatsapp TINYINT(1) NOT NULL DEFAULT 1,
        default_spicy_level INT NOT NULL DEFAULT 0,
        default_sambal_type VARCHAR(50) NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    const [[settings]] = await pool.query('SELECT * FROM user_settings WHERE user_id = ?', [req.session.user.id]);
    res.render('customer/settings', {
      title: 'Pengaturan',
      user: req.session.user,
      cartCount,
      layout: 'customer-start',
      page: 'settings',
      settings: settings || { notify_whatsapp: 1, default_spicy_level: 0, default_sambal_type: null },
    });
  },

  async settingsUpdate(req, res) {
    const { notify_whatsapp, default_spicy_level, default_sambal_type } = req.body;
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          notify_whatsapp TINYINT(1) NOT NULL DEFAULT 1,
          default_spicy_level INT NOT NULL DEFAULT 0,
          default_sambal_type VARCHAR(50) NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
      `);
      const [[existing]] = await pool.query('SELECT id FROM user_settings WHERE user_id = ?', [req.session.user.id]);
      const notify = notify_whatsapp ? 1 : 0;
      const spicy = Number(default_spicy_level) || 0;
      const sambal = default_sambal_type || null;
      if (existing) {
        await pool.query('UPDATE user_settings SET notify_whatsapp=?, default_spicy_level=?, default_sambal_type=? WHERE user_id=?', [notify, spicy, sambal, req.session.user.id]);
      } else {
        await pool.query('INSERT INTO user_settings (user_id, notify_whatsapp, default_spicy_level, default_sambal_type) VALUES (?, ?, ?, ?)', [req.session.user.id, notify, spicy, sambal]);
      }
      req.flash('success_msg', 'Pengaturan disimpan');
      res.redirect('/customer/settings');
    } catch (error) {
      console.error('Settings update error:', error);
      req.flash('error_msg', 'Gagal menyimpan pengaturan');
      res.redirect('/customer/settings');
    }
  },

  async myOrders(req, res) {
    try {
      const userId = req.session.user.id;
      const [orders] = await pool.query(
        `
        SELECT o.*
        FROM online_orders o
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
        `,
        [userId]
      );
      const statusMap = {
        pending: 'Menunggu persetujuan',
        approved: 'Disetujui',
        in_kitchen: 'Sedang dibuat',
        ready: 'Sudah jadi',
        driver_picked: 'Diangkut pengemudi',
        on_delivery: 'Diantar',
        delivered: 'Sampai',
        completed: 'Selesai',
        rejected: 'Ditolak',
      };

      for (let order of orders) {
        const [items] = await pool.query(
          `
          SELECT oi.*
          FROM online_order_items oi
          WHERE oi.order_id = ?
          `,
          [order.id]
        );
        order.items = items;
        if (order.status === 'rejected') {
          order.timeline = [
            { key: 'pending', label: 'Menunggu persetujuan', icon: 'clock' },
            { key: 'rejected', label: 'Ditolak', icon: 'times' },
          ];
        } else {
          order.timeline = [
            { key: 'pending', label: 'Menunggu persetujuan', icon: 'clock' },
            { key: 'approved', label: 'Disetujui', icon: 'check' },
            { key: 'in_kitchen', label: 'Sedang dibuat', icon: 'utensils' },
            { key: 'ready', label: 'Sudah jadi', icon: 'box' },
            { key: 'driver_picked', label: 'Diangkut pengemudi', icon: 'motorcycle' },
            { key: 'on_delivery', label: 'Diantar', icon: 'truck' },
            { key: 'delivered', label: 'Sampai', icon: 'home' },
            { key: 'completed', label: 'Selesai', icon: 'flag-checkered' },
          ];
        }
        order.status_label = statusMap[order.status] || order.status;
      }

      const [deliveries] = await pool.query(
        `SELECT * FROM drone_deliveries WHERE user_id = ? ORDER BY created_at DESC`, 
        [userId]
      );

      const cartCount = Array.isArray(req.session.cart)
        ? req.session.cart.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0)
        : 0;

      res.render('customer/my_orders', {
        title: 'Pesanan Saya',
        orders,
        deliveries, // ---> TAMBAHAN BARU: Lempar data drone ke EJS
        moment: require('moment'), // ---> TAMBAHAN BARU: Wajib ada agar format tanggal di EJS tidak error
        cartCount,
        layout: 'customer-start',
        page: 'orders',
        user: req.session.user,
      });
    } catch (error) {
      console.error('My Orders error:', error);
      req.flash('error_msg', 'Gagal memuat pesanan');
      res.redirect('/customer/orders');
    }
  },

  async addToCart(req, res) {
    const { menu_id, quantity, spicy_level, sambal_type, variant } = req.body;
    const id = Number(menu_id);
    const qty = Number(quantity) || 1;

    console.log('Add to cart request:', { menu_id, quantity, spicy_level, sambal_type, variant, id, qty });
    console.log('Session cart before:', req.session.cart);

    if (!id || qty < 1) {
      return req.xhr || req.headers.accept.indexOf('json') > -1 
        ? res.status(400).json({ success: false, message: 'Invalid request' })
        : res.redirect('/customer/order');
    }

    try {
      const [[menu]] = await pool.query('SELECT id, name, price, category FROM menus WHERE id = ? AND is_available = TRUE', [id]);
      if (!menu) {
        return req.xhr || req.headers.accept.indexOf('json') > -1 
          ? res.status(404).json({ success: false, message: 'Menu not found' })
          : res.redirect('/customer/cart');
      }

      const item = {
        menu_id: menu.id,
        name: menu.name,
        price: menu.price,
        quantity: qty,
        category: menu.category,
        options: {
          spicy_level: spicy_level ? Number(spicy_level) : 0,
          sambal_type: sambal_type || null,
          variant: variant || null,
        },
      };

      if (!req.session.cart) req.session.cart = [];
      req.session.cart.push(item);

      console.log('Session cart after:', req.session.cart);

      // Check if this is an AJAX request
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        const total = req.session.cart.reduce((sum, it) => sum + it.price * it.quantity, 0);
        return req.session.save(() => {
          res.json({ 
            success: true, 
            message: 'Item added to cart successfully',
            cartCount: req.session.cart.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0),
            total: total
          });
        });
      }

      req.session.save(() => {
        res.redirect('/customer/cart');
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
      res.redirect('/customer/cart');
    }
  },

  removeFromCart(req, res) {
    const { index } = req.body;
    const itemIndex = parseInt(index);
    console.log('Remove from cart request index:', itemIndex);
    
    if (isNaN(itemIndex) || itemIndex < 0) {
      return req.xhr || req.headers.accept.indexOf('json') > -1 
        ? res.status(400).json({ success: false, message: 'Invalid request' })
        : res.redirect('/customer/cart');
    }

    try {
      const cart = Array.isArray(req.session.cart) ? req.session.cart : [];
      console.log('Cart before remove:', cart);
      
      if (itemIndex >= cart.length) {
        return req.xhr || req.headers.accept.indexOf('json') > -1 
          ? res.status(404).json({ success: false, message: 'Item not found' })
          : res.redirect('/customer/cart');
      }

      // Remove the item
      const removedItem = cart.splice(itemIndex, 1)[0];
      console.log('Removed item:', removedItem);
      req.session.cart = cart;
      console.log('Cart after remove:', req.session.cart);

      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        const total = cart.reduce((sum, it) => sum + it.price * it.quantity, 0);
        return req.session.save(() => {
          res.json({
            success: true,
            message: 'Item removed successfully',
            cartCount: cart.length,
            total: total
          });
        });
      }

      req.session.save(() => {
        res.redirect('/customer/cart');
      });
    } catch (error) {
      console.error('Remove from cart error:', error);
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
      res.redirect('/customer/cart');
    }
  },

  viewCart(req, res) {
    const cart = Array.isArray(req.session.cart) ? req.session.cart : [];
    const total = cart.reduce((sum, it) => sum + it.price * it.quantity, 0);
    
    // Get cart count for navbar
    const cartCount = cart.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
    
    console.log('View cart - Session cart:', req.session.cart);
    console.log('View cart - Cart items:', cart);
    console.log('View cart - Total:', total);
    console.log('View cart - Cart count:', cartCount);
    
    res.render('customer/cart', {
      title: 'Keranjang',
      cart,
      total,
      cartCount,
      layout: 'customer-start',
      page: 'cart',
      user: req.session.user
    });
  },

  async checkout(req, res) {
    const cart = Array.isArray(req.session.cart) ? req.session.cart : [];
    if (!cart.length) return res.redirect('/customer/cart');

    const invoice = generateInvoice();
    const total = cart.reduce((sum, it) => sum + it.price * it.quantity, 0);

    try {
      console.log('Checkout start:', { user: req.session.user && req.session.user.id, cartCount: cart.length, total, invoice });
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const [orderResult] = await conn.query(
          'INSERT INTO online_orders (invoice, user_id, total, status) VALUES (?, ?, ?, ?)',
          [invoice, req.session.user.id, total, 'pending']
        );
        const orderId = orderResult.insertId;

        const values = cart.map((it) => [
          orderId,
          it.menu_id,
          it.name,
          it.price,
          it.quantity,
          it.options.spicy_level || 0,
          it.options.sambal_type || null,
          it.options.variant || null,
        ]);

        await conn.query(
          'INSERT INTO online_order_items (order_id, menu_id, name, price, quantity, spicy_level, sambal_type, variant) VALUES ?',
          [values]
        );

        await conn.commit();
        console.log('Checkout committed:', { orderId, itemCount: values.length });
      } catch (e) {
        await conn.rollback();
        console.error('Checkout rollback due to error:', e);
        throw e;
      } finally {
        conn.release();
      }

      req.session.checkoutSnapshot = { invoice, total, items: cart };
      req.session.cart = [];
      req.session.save(() => {
        res.render('customer/checkout', {
          title: 'Checkout',
          invoice,
          total,
          cart: req.session.checkoutSnapshot.items
        });
      });
    } catch (_) {
      console.error('Checkout failed:', _);
      req.flash('error_msg', 'Gagal menyimpan pesanan, coba lagi');
      res.redirect('/customer/cart');
    }
  },

  async paymentComplete(req, res) {
    try {
      const snap = req.session.checkoutSnapshot;
      if (!snap || !snap.items || !snap.items.length) {
        return res.status(400).json({ success: false, message: 'Tidak ada sesi pembayaran' });
      }
      const invoice = snap.invoice;
      const total = snap.total;
      const items = snap.items;
      const userId = req.session.user.id;
      const method = ['cash','qris','debit'].includes(req.body && req.body.payment_method) ? req.body.payment_method : 'qris';

      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const [trxRes] = await conn.query(
          'INSERT INTO transactions (invoice, user_id, customer_name, total, payment_method) VALUES (?, ?, ?, ?, ?)',
          [invoice, userId, req.session.user.full_name || req.session.user.username || 'Customer', total, method]
        );
        const trxId = trxRes.insertId;
        const detailValues = items.map((it) => [trxId, it.menu_id, it.quantity, it.price]);
        if (detailValues.length) {
          await conn.query(
            'INSERT INTO transaction_details (transaction_id, menu_id, quantity, price) VALUES ?',
            [detailValues]
          );
        }
        await conn.query('UPDATE online_orders SET status = ? WHERE invoice = ?', ['approved', invoice]);
        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }

      req.session.checkoutSnapshot = null;
      req.session.save(() => {
        res.json({ success: true, redirect: '/customer/orders' });
      });
    } catch (error) {
      console.error('paymentComplete error:', error);
      res.status(500).json({ success: false, message: 'Gagal menyelesaikan pembayaran' });
    }
  },

  async paymentCancel(req, res) {
    try {
      const snap = req.session.checkoutSnapshot;
      if (!snap) {
        return res.status(400).json({ success: false, message: 'Tidak ada sesi pembayaran' });
      }
      await pool.query('UPDATE online_orders SET status = ? WHERE invoice = ?', ['cancelled', snap.invoice]);
      req.session.checkoutSnapshot = null;
      req.session.save(() => {
        res.json({ success: true, redirect: '/customer/cart' });
      });
    } catch (error) {
      console.error('paymentCancel error:', error);
      res.status(500).json({ success: false, message: 'Gagal membatalkan pembayaran' });
    }
  },

  reserveForm(req, res) {
    const cart = Array.isArray(req.session.cart) ? req.session.cart : [];
    const cartCount = cart.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
    res.render('customer/reserve', {
      title: 'Reservasi Meja',
      cartCount,
      layout: 'customer-start',
      page: 'reserve',
      user: req.session.user,
    });
  },

  reserveSubmit(req, res) {
    console.log('ReserveSubmit body:', req.body);
    const { name, phone, date, time, party_size } = req.body;
    const size = Number(party_size) || 1;
    const userId = req.session.user ? req.session.user.id : null;

    function normalizeDate(raw) {
      if (!raw) return null;
      // Accept formats: YYYY-MM-DD or DD/MM/YYYY
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
      const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (m) {
        const d = m[1].padStart(2, '0');
        const mo = m[2].padStart(2, '0');
        const y = m[3];
        return `${y}-${mo}-${d}`;
      }
      return raw; // fallback
    }

    function normalizeTime(raw) {
      if (!raw) return null;
      // Accept formats: HH:MM, HH:MM:SS, or h:mm AM/PM
      let t = raw.trim();
      const ampm = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AP]M)$/i);
      if (ampm) {
        let h = parseInt(ampm[1], 10);
        const min = ampm[2];
        const sec = ampm[3] || '00';
        const ap = ampm[4].toUpperCase();
        if (ap === 'PM' && h < 12) h += 12;
        if (ap === 'AM' && h === 12) h = 0;
        return `${String(h).padStart(2,'0')}:${min}:${sec}`;
      }
      const hm = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (hm) {
        return `${hm[1].padStart(2,'0')}:${hm[2]}:${hm[3] || '00'}`;
      }
      return t; // fallback
    }

    const dateSql = normalizeDate(date);
    const timeSql = normalizeTime(time);

    (async () => {
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS reservations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            name VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            date DATE NOT NULL,
            time TIME NOT NULL,
            party_size INT NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'pending',
            reason VARCHAR(255) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB;
        `);

        const [result] = await pool.query(
          `INSERT INTO reservations (user_id, name, phone, date, time, party_size, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
          [userId, name, phone, dateSql, timeSql, size]
        );

        const [[reservation]] = await pool.query(`SELECT * FROM reservations WHERE id = ?`, [result.insertId]);
        console.log('ReserveSubmit success insert:', reservation);
        if (!req.session.reservations) req.session.reservations = [];
        req.session.reservations.unshift({ ...reservation });
        try { req.app.locals.broadcastReservationEvent({ type: 'new', reservation }); } catch (_) {}
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
          return req.session.save(() => res.json({ success: true, reservation }));
        }
        req.flash('success_msg', `Reservasi dikirim: ${reservation.date} ${reservation.time}, ${reservation.party_size} orang`);
        req.session.save(() => {
          res.redirect('/customer/reservations');
        });
      } catch (error) {
        const reservation = {
          id: Math.floor(Math.random() * 1000000),
          user_id: userId,
          name,
          phone,
          date: dateSql,
          time: timeSql,
          party_size: size,
          status: 'pending',
          created_at: new Date(),
        };
        if (!req.session.reservations) req.session.reservations = [];
        req.session.reservations.unshift(reservation);
        try { req.app.locals.broadcastReservationEvent({ type: 'new', reservation }); } catch (_) {}
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
          return req.session.save(() => res.json({ success: true, reservation, fallback: true }));
        }
        req.flash('success_msg', `Reservasi dikirim: ${reservation.date} ${reservation.time}, ${reservation.party_size} orang`);
        req.session.save(() => {
          res.redirect('/customer/reservations');
        });
      }
    })();
  },

  async myReservations(req, res) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS reservations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NULL,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          date DATE NOT NULL,
          time TIME NOT NULL,
          party_size INT NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          reason VARCHAR(255) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);

      const userId = req.session.user.id;
      const [rows] = await pool.query(
        `SELECT * FROM reservations WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
      );

      const sessionReservations = Array.isArray(req.session.reservations) ? req.session.reservations.filter(r => !r.user_id || r.user_id === userId) : [];
      const mapById = new Map();
      [...rows, ...sessionReservations].forEach(r => { mapById.set(String(r.id), r); });
      const merged = Array.from(mapById.values()).sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));

      const statusMap = {
        pending: 'Menunggu persetujuan',
        approved: 'Disetujui',
        rejected: 'Ditolak',
      };

      const reservations = merged.map((r) => ({
        ...r,
        status_label: statusMap[r.status] || r.status,
        timeline: [
          { key: 'pending', label: 'Diajukan', icon: 'paper-plane' },
          { key: 'approved', label: 'Disetujui', icon: 'check' },
          { key: 'rejected', label: 'Ditolak', icon: 'times' },
        ],
      }));

      const cartCount = Array.isArray(req.session.cart)
        ? req.session.cart.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0)
        : 0;
      res.render('customer/my_reservations', {
        title: 'Reservasi Saya',
        reservations,
        cartCount,
        layout: 'customer-start',
        page: 'reservations',
        user: req.session.user,
      });
    } catch (error) {
      console.error('My Reservations error:', error);
      req.flash('error_msg', 'Gagal memuat reservasi');
      res.redirect('/customer/reserve');
    }
  },

};

module.exports = CustomerController;
