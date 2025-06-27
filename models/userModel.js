const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name'],
        unique: [true, 'User already exist']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: [true, 'Email already exist'],
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: { 
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Provide a password'],
        minlength: 8,
        select: false //this makes the password not to show up in anyoutput
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Confirm password'],
        validate: {
            //this only works on save and create
            validator: function(el) {
                return el === this.password;
            },
            message: 'Password are not the same'
        }
    },
    passwordChangedAT: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

userSchema.pre('save', async function(next) {
    //only runs if password is modified
    if(!this.isModified('password')) return next();
    //hash the password with a cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    //doesnt store the confirmed password to the database (deletes it)
    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAT) {
        const changedTimeStamp = parseInt(this.passwordChangedAT.getTime() / 1000, 10);

        return JWTTimestamp < changedTimeStamp;
    }

    return false;
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
                                .createHash('sha256')
                                .update(resetToken)
                                .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAT = Date.now() - 1000;
    next();

})

userSchema.pre(/^find/, function(next) {// /^find/ makes it search for all queries that begins with find
    this.find({ active: {$ne: false} });
    next();
})

const User = new mongoose.model('User', userSchema);

module.exports = User;