require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const {mongodbConnect} = require('./src/features/connection.js');
const axios = require('axios')

const authRouter = require('./src/features/auth/authRoute');
const mediaRouter = require('./src/features/media/mediaRoute');
const profileRouter = require('./src/features/profile/profileRoute');
const storeRouter = require('./src/features/store/storeRoute');
const publisherRouter = require('./src/features/publisher/publisherRoute');

const authMiddleware = require('./src/utils/authMiddleware');
const {appsCollection} = require("./src/features/connection");
const fs = require("node:fs");

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// for ping service
app.get('/ping', async (req, res) => {
    console.log('Received request at Main Server');
    res.send('Received at Main Server, forwarding after 30 sec...');
    setTimeout(async () => {
        console.log('Forwarding request from Main to Secondary');
        await axios.get('https://alarm-service-k9me.onrender.com/ping').catch(err => console.error('Error:', err.message));
    }, 180000);  // 3 minutes
});


app.use('/auth', authRouter);
app.use('/media', mediaRouter);
app.use('/profile', profileRouter);
app.use(authMiddleware);
app.use('/store', storeRouter);
app.use('/publisher', publisherRouter);

mongodbConnect().then(_ => {
    console.log('Connected to mongodb server...');
}).catch(err => console.error(err));


// function generateRandomCode(digitCount = 4) {
//     const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
//     const randomLetters = Array.from({length: 2}, () =>
//         letters.charAt(Math.floor(Math.random() * letters.length))
//     ).join('');
//
//     const randomDigits = Array.from({length: digitCount}, () =>
//         Math.floor(Math.random() * 10)
//     ).join('');
//
//     return `${randomLetters}-${randomDigits}`;
// }
//
// setTimeout(async () => {
//     // const version = generateRandomCode();
//
//     const appVersions = [
//         {id: '67becd0bed355017e8b5bd4a', version: 'VX-1509'},
//         {id: '67becd0bed355017e8b5bd47', version: 'MA-5471'},
//         {id: '67becd0bed355017e8b5bd46', version: 'LS-7623'},
//         {id: '67becd0bed355017e8b5bd48', version: 'SV-9554'},
//         {id: '67becd0bed355017e8b5bd49', version: 'IL-0637'}
//     ];
//
//     const srcPath = path.resolve(__dirname, './uploads/apps/base.zip');
//     console.log(srcPath);
//     console.log(fs.existsSync(srcPath));
//
//     for (const appVer of appVersions) {
//         const parent = path.resolve(__dirname, `./uploads/apps/${appVer.id}/${appVer.version}`);
//         console.log(parent);
//         if (!fs.existsSync(parent)) {
//             fs.mkdirSync(parent, {recursive: true});
//         }
//         // await fs.copyFile(srcPath, path.join(parent, 'base.snv'));
//     }
//
//
//     // const cursor = await appsCollection.find();
//     //
//     // for await (const doc of cursor) {
//     //     const randomCode = generateRandomCode();
//     //     await appsCollection.updateOne(
//     //         { _id: doc._id },
//     //         { $set: { lastVersion: randomCode } }
//     //     );
//     // }
//
//     // const result = await appsCollection.find({}, {
//     //     projection: {
//     //         _id: 1,
//     //         lastVersion: 1
//     //     }
//     // }).toArray();
//     //
//     // console.log(result.map(item => ({
//     //     id: item._id.toString(),
//     //     version: item.lastVersion,
//     // })));
//     // console.log({version});
// }, 500);


module.exports = app;
