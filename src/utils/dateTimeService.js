const {Long} = require("mongodb");

const dateTimeService = {
    now: () => Long.fromNumber(Date.now()),
}

module.exports = dateTimeService