const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`) //this will be the filename
//     }
// })
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new AppError('Please upload only images', 400), false)
    }
}
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});
exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = catchAsync( async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`)

        next()
})


const filterObj = (Obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(Obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = Obj[el];
    })
    return newObj;
}

exports.getAllUsers = factory.getAll(User); 
exports.getUser = factory.getOne(User);
//Do not update password with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
 
exports.updateMe = catchAsync( async (req, res, next) => {
    //create an error if user tries to update password
    if(req.body.password || req.body.passwordConfirm) {
        return next(new AppError('this route is not for password updates', 400))
    }
    //update the user document
    const filteredBody = filterObj(req.body, 'name', 'email')
    if (req.file) filteredBody.photo = req.file.filename;
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
 })

exports.deleteMe = catchAsync( async (req, res, next)=> {
    await User.findByIdAndUpdate(req.user.id, {active: false})

    res.status(204).json({
        status: 'success',
        data: null
    })
 })

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}