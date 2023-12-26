'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'CristoRey202211';

exports.createToken = function(user){
    var payload = {
        sub: user._id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        base:user.base,
        iat: moment().unix(),
        exp: moment().add(3,'hours').unix()
    }

    return jwt.encode(payload,secret);
}

exports.sign = function(user){
    var payload = {
        sub: user._id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        base:user.base,
        iat: moment().unix(),
        exp: moment().add(300,'minutes').unix()
    }

    return jwt.encode(payload,secret);
}
