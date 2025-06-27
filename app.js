const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const viewRouter = require('./routes/viewRoutes');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoute');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//serving static files
app.use(express.static(path.join(__dirname, 'public')));

//MIDDLE WARE STACK
//implement cors
app.use(cors()); //for get and post (simpler request)
app.options('*', cors()) //for patch, delete, put which goes through the options request before the actual request

//set security http
app.use(helmet())
// //to allow loading the stripe external js script
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", "https://js.stripe.com"],
//       frameSrc: ["'self'", "https://js.stripe.com"],
//       connectSrc: ["'self'", "https://api.stripe.com"],
//       styleSrc: ["'self'", "https://js.stripe.com", "'unsafe-inline'"]
//     }
//   })
// );
// if (process.env.NODE_ENV === 'development') {
//   app.use(
//     helmet.contentSecurityPolicy({
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", "https://js.stripe.com"],
//         frameSrc: ["'self'", "https://js.stripe.com"],
//         connectSrc: ["'self'", "https://api.stripe.com", "ws:"],
//         styleSrc: ["'self'", "https://js.stripe.com", "'unsafe-inline'"]
//       }
//     })
//   );
// } else {
//   app.use(
//     helmet.contentSecurityPolicy({
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", "https://js.stripe.com"],
//         frameSrc: ["'self'", "https://js.stripe.com"],
//         connectSrc: ["'self'", "https://api.stripe.com"],
//         styleSrc: ["'self'", "https://js.stripe.com", "'unsafe-inline'"]
//       }
//     })
//   );
// }

//development logging
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//rate-limiting
const limiter = rateLimit({
    max: 100, //blocks ip after 100 requests
    windowMs: 60 * 60 * 1000, //block for 1hour
    message: 'Too many requests from this IP, please try again in an hour'
})
app.use('/api', limiter);//limiter works for all routes that staerts with api

//body-parser reading data into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser());

//data sanitization against no sql query injection
app.use(mongoSanitize());

//data sanitization against XSS (cross side scripting attack)
app.use(xss());

//to prevent parameter pollution
app.use(hpp({
    whitelist: [
        'duration', 
        'ratngsQuantity', 
        'ratingsAverage', 
        'maxGroupSize', 
        'difficulty', 
        'price'
    ]
}));

app.use(compression())

//test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})

//routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {

    // const err = new Error(`Page not found, ${req.originalUrl} does not exist on this server`);
    // err.status = 'fail';
    // err.statusCode = 404;

    next(new AppError(`Page not found, ${req.originalUrl} does not exist on this server`, 404));
})

app.use(globalErrorHandler);//handles all error

module.exports = app;
