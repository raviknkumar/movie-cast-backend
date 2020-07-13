const moment = require('moment');

const getCurrentTime = () => {
    return moment().format('hh:mm a');
};

module.exports = {
    getCurrentTime
}