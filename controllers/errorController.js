const AppError = require('./../utils/appError');

const handleJWTError = () => new AppError('Invalid token, Please log in again',401)

const handleExpiredToken = () => new AppError('token expired, Please log in again',401)

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const value =  err.keyValue.name;
    console.log(value);
    const message = `Duplicate value ${value}, please input another value`
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Invalid Input Data. ${errors.join('.')}`;
    return new AppError(message, 400);
}

const sendErrorDev = (err, req, res) => {
    //API
    if(req && req.originalUrl && req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })   
    //rendered website
    } else {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message
        })
    }
}

const sendErrorProd = (err, req, res) => {
    // Ensure status and statusCode are always set
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if(req && req.originalUrl && req.originalUrl.startsWith('/api')) {
        //operational, trusted error: send message to client
        if(err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            })
        }
        //programming or other errors and we dont want to leak error details
        //1) log error
        console.error('`ERROR :', err);
        //send generic message
        return res.status(500).json({
            status: 'error',
            message: 'something went very wrong'
        })
    }
    //rendered website
    //operational, trusted error: send message to client
    if(err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message
        })
    }
    //programming or other errors and we dont want to leak error details
    //1) log error
    console.error('`ERROR :', err);
    //send generic message
    return res.status(500).render('error', {
        title: 'Something went wrong',
        msg: 'Please try again later'
    })
}


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'

    if(process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if(process.env.NODE_ENV === 'production') {
        let error = Object.create(err);
        if(error.name === 'CastError') error = handleCastErrorDB(error);
        if(error.code === 11000) error = handleDuplicateFieldsDB(error);
        if(error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if(error.name === 'JsonWebTokenError') error = handleJWTError();
        if(error.name === 'TokenExpiredError') error = handleExpiredToken();
        sendErrorProd(error, req, res);
    }
}