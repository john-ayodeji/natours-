const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Enter your review']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must have a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true});//each tour and user combo has to be unique

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
const Tour = require('./tourModel');
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating'}
      }
    }
  ])

  if(stats.length > 0 ) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating
    })
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    })
  }
}

reviewSchema.post('save', function(next) {
  this.constructor/*constructer is the model that uses this schema*/.calcAverageRatings(this.tour)
})

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
})

reviewSchema.post(/^findOneAnd/, async function() {
  //await this.findOne doesnt work here
  await this.r.constructor.calcAverageRatings(this.r.tour);
})

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;