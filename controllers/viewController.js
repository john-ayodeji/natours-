const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel')

exports.getOverview = catchAsync( async (req, res, next) => {
    //1)get tour data from collection
    //2)build templates
    //3)render the template using the tour data from the first time
    const tours = await Tour.find();

    res.status(200).render('overview', {
        title: 'Exiting tours for adventorous people',
        tours
    })
})

exports.getTour = catchAsync( async (req, res, next) => {
    //1) get data for the requested tour using the slug
    //2) build template
    //3) render template using the data from step 1
    const slug = req.params.slug;
    const tour = await Tour.findOne({slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if(!tour) {
        return next(new AppError('There is no tour with that name', 404))
    }
    console.log(tour);

    res.status(200).render('tour', {
        title: `${tour.name}`,
        tour
    })
})

exports.getForgotPasswordForm = (req, res) => {
    res.status(200).render('forgotpassword', {
        title: 'Forgot Password'
    })
}

exports.getPasswordresetForm = (req, res) => {
    res.status(200).render('newpassword', {
        title: 'Reset Password'
    })
}

exports.getSignupForm = (req, res) => {
    res.status(200).render('signup', {
        title: 'Sign up to Natours'
    })
}

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log in to your account'
    })
}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your Account'
    })
}

exports.getMyTours = catchAsync( async (req, res, next) => {
    //1) find all bookings
    const bookings = await Booking.find({ user: req.user.id })

    //2) find tours with the returned ids
    const tourIds = bookings.map(el => el.tour)
    const tours = await Tour.find({ _id: {$in: tourIds} })// to select all the tours that are in the tourIds of the booking

    res.status(200).render('bookings', {
        title: 'My bookings',
        tours
    })
})