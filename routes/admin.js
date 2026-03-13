const express = require('express');
const router = express.Router();
const { isAuthenticated, isLecturer, isAdmin } = require('../middleware/auth');
const DashboardController = require('../controllers/DashboardController');
const MenuController = require('../controllers/MenuController');
const ReportController = require('../controllers/ReportController');
const upload = require('../middleware/upload');
const { menuValidation } = require('../middleware/validators');
const AdminOnlineOrderController = require('../controllers/AdminOnlineOrderController');
const AdminReservationController = require('../controllers/AdminReservationController');

router.use(isAuthenticated);

router.get('/', isLecturer, DashboardController.index);

router.get('/menu', isLecturer, MenuController.index);
router.get('/menu/create', isLecturer, MenuController.createForm);
router.post('/menu', isLecturer, upload.single('image'), menuValidation, MenuController.store);
router.get('/menu/edit/:id', isLecturer, MenuController.editForm);
router.post('/menu/update/:id', isLecturer, upload.single('image'), menuValidation, MenuController.update);
router.delete('/menu/delete/:id', isLecturer, MenuController.destroy);
router.post('/menu/delete/:id', isLecturer, MenuController.destroy);

router.get('/reports', isLecturer, ReportController.index);

// Online Orders approval (Admin only)
router.get('/online-orders', isAdmin, AdminOnlineOrderController.index);
router.post('/online-orders/:id/approve', isAdmin, AdminOnlineOrderController.approve);
router.post('/online-orders/:id/reject', isAdmin, AdminOnlineOrderController.reject);
router.post('/online-orders/:id/status', isAdmin, AdminOnlineOrderController.updateStatus);

// Reservations management
router.get('/reservations', isAdmin, AdminReservationController.index);
router.post('/reservations/:id/status', isAdmin, AdminReservationController.updateStatus);

module.exports = router;

