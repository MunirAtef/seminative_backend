require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const {mongodbConnect} = require('./src/features/connection.js');

const authRouter = require('./src/features/auth/authRoute');
const storeRouter = require('./src/features/store/storeRoute');

const authMiddleware = require('./src/utils/authMiddleware');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRouter);

app.use(authMiddleware);
app.use('/store', storeRouter);

mongodbConnect().then(_ => {
    console.log('Connected to mongodb server...');
}).catch(err => console.error(err));


module.exports = app;
