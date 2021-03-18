const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const User = require("../models/user");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// const DUMMY_USERS = [
//     {
//         id: 'u1',
//         name: 'Parth Patel',
//         email: 'test123@gmail.com',
//         password: 'testers'
//     }
// ];

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, 'email name places image');
        console.log(users);
    } catch (err) {
        const error = new HttpError(
            'Fetching users failed, please try again later!',
            500
        );
        return next(error);
        console.log(users);
    }
    //  const users=User.find({},'-password'); both syntax are same but -password excludes password from user.find and {},'email name' will return only email and name not the password!

    res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // console.log(errors);
        return next(new HttpError('Invalid Inputs passed!please Check your data', 422));
    }
    const { name, email, password } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError(
            'Signing Up failed! Please try again later.',
            500
        );
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError(
            'User existing already! Please login instead.',
            422
        );
        return next(error);
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError("Couln't create user , please try again", 500);
        return next(error);
    }
    // hash .bcrypt also return a promise so we would have to await
    // 12 is no .of salting rounds
    const createdUser = new User({
        name,
        email,
        image: req.file.path,
        password: hashedPassword,
        places: []
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError(
            'Signing up failed, please try again.',
            500
        );
        return next(error);
    }
    let token;
    try {
        token = jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            'supersecret_dont_share',
            // supersecret_dont_share is a private key for hashing
            { expiresIn: '1h' }
            // expiresIn is a token expiring time
        );
    } catch (err) {
        const error = new HttpError('signing up failed,please try again later', 500);
        return next(error);
    }
    // jwt.sign() return a string
    res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });
    // getters:true removes _ from _id
};
const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // console.log(errors);
        throw new HttpError('Invalid Inputs passed!please Check your data', 422);
    }
    const { email, password } = req.body;
    let existingUser;

    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError(
            'Logging in failed! Please try again later.',
            500
        );
        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError(
            'Invalid credentials, could not log you in!',
            401
        );
        return next(error);
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        const error = new HttpError('could not log you in ,please check your credentials', 500);
        return next(error);
    }
    if (!isValidPassword) {
        const error = new HttpError(
            'Invalid credentials, could not log you in!(token error)',
            403
        );
        return next(error);
    }

    let token;
    try {
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            'supersecret_dont_share',
            { expiresIn: '1h' }
        );
    } catch (err) {
        const error = new HttpError('Logging in failed,please try again later', 500);
        return next(error);
    }
    // jwt.sign() return a string
    res.json({ userId: existingUser.id, email: existingUser.email, token: token });
    // res.json({ message: "Loged In", user: existingUser.toObject({ getters: true }) });
};

exports.getUsers = getUsers;
exports.login = login;
exports.signup = signup;