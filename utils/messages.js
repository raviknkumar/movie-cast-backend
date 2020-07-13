const moment = require('moment');

function formatMessage(username, text) {
  return {
    from:username,
    message:text,
    timestamp: moment().format('hh:mm a')
  };
}

module.exports = formatMessage;
