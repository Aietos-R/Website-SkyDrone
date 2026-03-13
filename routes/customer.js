const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/CustomerController');
const { isCustomer } = require('../middleware/auth');

router.use(isCustomer);

router.get('/beranda', CustomerController.renderBeranda);
router.get('/restaurant/mcd', CustomerController.renderMcd);
router.get('/restaurant/arema', CustomerController.renderArema);
router.get('/restaurant', CustomerController.renderRestaurantList);
router.get('/order', CustomerController.menu);
router.post('/order/add', CustomerController.addToCart);
router.get('/cart', CustomerController.viewCart);
router.post('/cart/remove', CustomerController.removeFromCart);
router.post('/checkout', CustomerController.checkout);
router.post('/payment/complete', CustomerController.paymentComplete);
router.post('/payment/cancel', CustomerController.paymentCancel);
router.get('/orders', CustomerController.myOrders);
router.get('/profile', CustomerController.profileForm);
router.post('/profile', CustomerController.profileUpdate);
router.post('/profile/password', CustomerController.profileChangePassword);
router.get('/settings', CustomerController.settingsForm);
router.post('/settings', CustomerController.settingsUpdate);

router.get('/reserve', CustomerController.reserveForm);
router.post('/reserve', CustomerController.reserveSubmit);
router.get('/reservations', CustomerController.myReservations);
router.get('/reservations', CustomerController.myReservations);

module.exports = router;
