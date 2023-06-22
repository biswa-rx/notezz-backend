const express  = require('express');
const morgan = require('morgan');
const createError = require('http-errors');
require('dotenv').config();
require('./helpers/init_mongodb');
const { verifyAccessToken } = require('./helpers/jwt_helper');
require('./helpers/inti_redis');

const authRoute = require('./Routes/Auth.route');

const app = express();
app.use(morgan('dev'));
app.use(express.json());

app.use('/auth',authRoute);

app.get('/', verifyAccessToken, async(req, res, next) => {
    // console.log(req.headers['authorization'])
    res.send("Hello from express.");
})

app.use(async(req, res, next) => {
    // const error = new Error("NOT_FOUND");
    // error.status = 404;
    // next(error);
    // next(createError(404,"NOT_FOUND"));
    next(createError.NotFound())
})

app.use((err,req,res,next)=> {
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    })
})

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});