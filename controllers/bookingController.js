const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');

exports.getCheckOutSession = catchAsync ( async (req, res, next) => {
    //1) get the currently booked tour
    const tour = await Tour.findById(req.params.tourId)

    //2) create checkoutt session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        // success_url: `${req.protocol}://${req.get('host')}/booking-checkout?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        success_url:`${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: tour.price * 100,
              product_data: {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`${req.protocol}://${req.get('host')}/tours/${tour.imageCover}`]
              }
            },
            quantity: 1
          }
        ]
    })

    //3)send session to client as response
    res.status(200).json({
        status: 'success',
        session
    })
})

// exports.createBookingCheckout = catchAsync( async (req, res, next) => {
//     //insecure, anyone can make bookings without paying
//     const { tour, user, price } = req.query;

//     if(!tour && !user && !price) next()

//     await Booking.create({tour, user, price})

//     res.redirect('/my-tours')
// })

exports.updateBooking = catchAsync( async (req, res, next) => {
    const updatedBooking = await Booking.findOneAndUpdate({ user: req.user.id, tour: req.tour.id }, {
        new: true,
        runValidators: true
    })

    res.status(200).jsom({
        status: 'success',
        updatedBooking
    })
})

const createBookingCheckout = async session => {
  const tour = session.client_reference_id;
  const user = (await Tour.findOne({ email: session.customer_email })).id;
  const price = line_items[0].price_data.unit_amount / 100;
  await Booking.create({tour, user, price})
}

exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    let event;

  try{
    event = stripe.webhooks.constructEvent(
        req.body, 
        signature, 
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      return res.status(400).send(`Webook Error: ${err.message}`)
    }

  if(event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object)

  res.status(200).json({ recieved: true });
}