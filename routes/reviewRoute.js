const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const router = express.Router({ mergeParams: true }); //mergeparams allows you to use the url params from the merged route
//so if we have GET /tour/:tourId/reviews we can access tourId in the reviews router

router.use(authController.protect) //so no unauthenticated user can access these routes

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.restrictTo('user'),
        reviewController.setTourandUserId, 
        reviewController.createReview
    )

router
    .route('/:id')
    .get(reviewController.getReview)
    .delete(
        authController.restrictTo('user', 'admin'),
        reviewController.deleteReview)
    .patch(
        authController.restrictTo('user', 'admin'),
        reviewController.updateReview)

module.exports = router;