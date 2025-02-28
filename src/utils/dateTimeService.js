const {Long} = require("mongodb");

const dateTimeService = {
    now: () => Long.fromNumber(Date.now()),
}

// I add createdAt = dateTimeService.now(), and I got this after inserting user to mongodb
// "createdAt": {
//         "low": 1289771722,
//         "high": 405,
//         "unsigned": false
//       }

module.exports = dateTimeService