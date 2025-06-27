const path = require('path');
const Tour = require('../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

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
exports.uploadTourImages = upload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3 }
])
upload.array('images', 5)

exports.resizeTourImages = catchAsync( async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();

    req.body.imageCover = `user-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`)

    const timestamp = Date.now();
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `user-${req.params.id}-${timestamp}-${i + 1}.jpeg`;
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename);
      })
    );

    next()
})


//aliasing - making it easy to access queries using routes
//coming back later to fix this
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);


exports.getTourStats = catchAsync(async (req, res, next) => {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: {$gte: 4.5} }
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty' }, //groups result based on difficulty(or whatever you specify), you can set it has null if you dont want to group based on anything 
                    numTours: { $sum: 1 }, //for each document that passes through the pipeline, 1 is added
                    numRatings: { $sum: '$ratingsQuantity'}, //adds up all the ratings average
                    avgRating: { $avg: '$ratingsAverage' }, //finds the average of all the ratingsAverage
                    avgPrice: { $avg: '$price' }, //average price
                    minPrice: { $min: '$price'}, //minimum price
                    maxPrice: { $max: '$price'}, //maximum price
                }
            },
            {
                $sort: {
                    avgPrice: 1
                }
            }
        //     {
        //         $match: { _id: { $ne: 'EASY' }} //excludes documents that are easy
        //     }
        ])
        res.status(200).json({
            status: 'success',
            data: {
                stats
        }
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates' //seperates each start date like it is a seperate tour (eg, if one tour had three dates, it seperates the dates from one array to different tours)
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTourStarts: { $sum: 1}, //for each document in the month, it adds one
                    tours: { $push: '$name' } // to display all the namess of the tours
                }
            },
            {
                $addFields: { month: '$_id' } //adds the month to the group and use the value of _id in it
            },
            {
                $project: {
                    _id: 0// so the id does not display in the result
                }
            },
            {
                $sort: { numTourStarts: -1 }
            }
            // {
            //     $limit: 6 //same has limit in pagination
            // }
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        });
})

exports.getToursWithin = catchAsync( async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [ lat, lng ] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if(!lat || !lng) {
        next(new AppError('Please provide latitude and longitude in the format lat,lng', 400))
    }

    const tours = await Tour.find({ startLocation: { $geoWithin: {
        $centerSphere: [[lng, lat], radius]
    } }});

    // console.log(distance, lat, lng, unit);

    res.status(200).json({
        status: 'success',
        results: tours.length,
        response: {
            data: tours
        }
    })
})

exports.getDistances = catchAsync( async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [ lat, lng ] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if(!lat || !lng) {
        next(new AppError('Please provide latitude and longitude in the format lat,lng', 400))
    }

    distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier //multiplies the distance by this value
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        response: {
            data: distances
        }
    })
})