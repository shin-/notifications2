var _ = require('underscore');

function forEachCallback(length, callback) {
    var delayed = _.after(length, callback);
    delayed.res = [];
    return function(err, res) {
        if (err) {
            return callback(err);
        }
        delayed.res.push(res);
        delayed(err, delayed.res);
    }
}

function apiError(message, status) {
    err = new Error(message);
    err.status = status;
    return err;
}

module.exports = {
    forEachCallback: forEachCallback,
    apiError: apiError
};
