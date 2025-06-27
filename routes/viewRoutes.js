const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/booking-checkout', bookingController.createBookingCheckout, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewController.getSignupForm);
router.get('/forgotpassword', authController.isLoggedIn, viewController.getForgotPasswordForm);
router.get('/resetpassword/:token', authController.isLoggedIn, viewController.getPasswordresetForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours)

module.exports = router;