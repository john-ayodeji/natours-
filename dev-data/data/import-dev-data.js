const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Tour = require('./../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

dotenv.config({ path: './config.env'});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log('DB connection successful');
});

//PATHS
const tourPath = path.join(__dirname, ('../data/tours.json'));
const userPath = path.join(__dirname, ('./users.json'));
const reviewPath = path.join(__dirname, ('./reviews.json'));

//READ JSON FILE
const tours = JSON.parse(fs.readFileSync(tourPath, 'utf-8'));
const users = JSON.parse(fs.readFileSync(userPath, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(reviewPath, 'utf-8'));

//IMPORT ALL DATA FROM JSON TO DATABASE
const importData = async () => {
    try{
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);
        console.log('Data successfully loaded');
        process.exit();
    } catch (err) {
        console.log(err);
    };
};

//DELETE ALL DATA FROM DB
const deleteData = async () => {
    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Database has been emptied');
        process.exit();
    } catch (err) {
        console.log(err);
    };
};

if(process.argv[2] === '--import'){ 
    importData()
} else if(process.argv[2] === '--delete') {
    deleteData()
}
