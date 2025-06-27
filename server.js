const mongoose = require('mongoose');
const dotenv = require('dotenv');

//handles unhandled synchronous exceptions
process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('UNHANDLED EXCEPTIONS 💥 shutting down...');
        process.exit(1);
});

dotenv.config({ path: './config.env'});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log('DB connection successful');
})

const app = require('./app');
app.set('query parser', 'extended');

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
    console.log(`server started on port ${port}`);
});

//handles asynchronous unhandled promise rejections
process.on('unhandledRejection', err => {
    console.log(err.name);
    console.log('UNHANDLED REJECTION 💥 shutting down...')
    server.close(() =>{
        process.exit(1);
    })
});