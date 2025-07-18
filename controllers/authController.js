const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');
const Email = require('./../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
})
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)

const cookieOptions =  {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000/*COVERT TO MILLISECONDS*/),
        httpOnly: true //prevents cross site scripting
        }

if(process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true
}
    res.cookie('jwt', token, cookieOptions);

    //remove the password from the output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.signUp = catchAsync( async (req, res, next) => {
    const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
});
    const url = `${req.protocol}://${req.get('host')}/me`
    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, res);

});


exports.logIn = catchAsync( async (req, res, next) => {
    const { email, password } = req.body;

    if(!email || !password) {
       return next(new AppError('Please provide email and password', 400));
    }

    //check if there is user with that credentials
    const user = await User.findOne({ email }).select('+password')


    if(!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect email or password', 401));
    }
    createSendToken(user, 200, res);
})

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 + 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    })
}

exports.protect = catchAsync( async (req, res, next) => {
    //1) GET TOKEN AND CHECK IF ITS THERE/EXISTS
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.jwt) {
        token = req.cookies.jwt
    }
    if(!token) {
        return next(new AppError('Please login to get access', 401));
    }
    //2) VERIFY THE TOKEN
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET) 
    //3) CHECK IF USER STILL EXISTS
    const currentUser = await User.findById(decoded.id);
    if(!currentUser) {
        return next(new AppError('The token user belonging to the token no longer exist', 401));
    }
    //4) CHECK IF USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED
    if(currentUser.changedPasswordAfter(decoded.iat))
    return next(new AppError('User recently changed password! Please login again', 401));
    
    //grant access to protected route
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles is  an array ['admin', 'leadguide' etc] only roles passed in this array can access the route
        if(!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
    next()
    }
}

exports.forgotPassword = catchAsync( async (req, res, next) => {
    //1) get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if(!user) {
        return next(new AppError('There is no user with this email adress', 404));
    }

    //generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //send it to users email
    // const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const resetURL = `${req.protocol}://${req.get('host')}/resetpassword/${resetToken}`;
    const tokenURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

    // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to
    //                 ${resetURL}. \n If you didnt forget password ignore this.`
try{
    // await sendEmail({
    //     email: user.email,
    //     subject: 'Your reset token expires in 10 minutes',
    //     message
    // });
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
        status: 'success',
        message: 'Token sent to email'
    });
} catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Couldnt send token to email, try again later', 500));
}
});

exports.resetPassword = catchAsync( async (req, res, next) => {
    //get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({ 
        passwordResetToken: hashedToken, 
        passwordResetExpires: {$gt: Date.now()}
    });
    //if token has not expired, and there is a user, set the new password
    if(!user) {
        return next(new AppError('Token is invalid or has expired', 400))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    //update changedPassword At property for the user
    //log the user in, send JWT
    createSendToken(user, 200, res);
})

exports.updatePassword = catchAsync( async (req, res, next) => {
    //get the user from the collection
    const user = await User.findById(req.user.id).select('+password');

    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) 
        return next(new AppError('Incorrect current password', 401));
    //if so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //log user in (send JWT)
    createSendToken(user, 200, res);
})

//Only for rendered pages, no errors
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) VERIFY THE TOKEN
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      // 2) CHECK IF USER STILL EXISTS
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) return next();
      // 3) CHECK IF USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED
      if (currentUser.changedPasswordAfter(decoded.iat)) return next();
      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
    } catch (err) {
      // If error verifying token, just continue without user
    }
  }
  next();
});