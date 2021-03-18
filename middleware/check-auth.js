const HttpError = require("../models/http-error");
const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    // authorzation:'Bearer TOKEN' so spliting it by white space
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            throw new Error('Authentication Failed');
        }
        const decodedToken = jwt.verify(token, 'supersecret_dont_share');

        // jwt.verify() returns a string or an object instead of boolean
        // infact it returns a payload encoded into the header
        // at this point user is verified and able to reach any routes which req authentication
        // so shift on next middleware!
        req.userData = { userId: decodedToken.userId };
        next();
    } catch (err) {
        const error = new HttpError("Authentication Failed", 403);
        return next(error);
    };



    // return next(error) sures that if error is there then no next() miidle ware should be executed
    // and error will be thrown from that point

};