const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { signupValidation, loginValidation } = require('../middleware/validators');

router.get('/login', AuthController.renderLogin);
router.post('/login', loginValidation, AuthController.login);

router.get('/signup', AuthController.renderSignup);
router.post('/signup', signupValidation, AuthController.signup);

router.get('/logout', AuthController.logout);
router.post('/logout', AuthController.logout);
router.post('/logout', AuthController.logout);

module.exports = router;

