const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');


const router = express.Router();

router
    .post('/signup', authController.signUp)
    .post('/login', authController.logIn)
    .get('/logout', authController.logout)
    .post('/forgotpassword', authController.forgotPassword)
    .patch('/resetpassword/:token', authController.resetPassword)

router.use(authController.protect);//every route after this is protected because middlewares runs in sequence
router
    .patch(
        '/updatemypassword',
        authController.updatePassword
    )
    .patch(
        '/updateme',
        userController.uploadUserPhoto,
        userController.resizeUserPhoto,
        userController.updateMe
    )
    .delete(
        '/deleteme',
        userController.deleteMe
    )
    .get(
        '/me',
        userController.getMe, 
        userController.getUser
    )


router.use(authController.restrictTo('admin'))//this restricts all the following route to admins only

router
    .route('/')
    .get(userController.getAllUsers)

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)


module.exports = router;