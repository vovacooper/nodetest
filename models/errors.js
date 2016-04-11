/**
 * Created by vovacooper on 02/03/2016.
 */
var util = require('util');

function ValidationError(msg) {
    Error.call(this);
    this.name = 'ValidationError';
    this.message = msg;
    Error.captureStackTrace(this, this.constructor);
}

util.inherits(ValidationError, Error);

exports.ValidationError = ValidationError;