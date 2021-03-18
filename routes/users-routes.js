const express = require("express");
const HttpError = require("../models/http-error");
const router = express.Router();

const usersControllers = require("../controllers/user-controllers");
const { check } = require("express-validator");
const fileUpload = require('../middleware/file-upload');

router.get("/", usersControllers.getUsers);

router.post(
    "/signup",
    fileUpload.single('image'),
    // .single is method of multer
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail() //Test@test.com=>test@test.com
            .isEmail(),
        check('password').isLength({ min: 6 })
    ],
    usersControllers.signup);
router.post(
    "/login",
    [
        check('email').normalizeEmail() //Test@test.com=>test@test.com
            .isEmail(),
        check('password').isLength({ min: 6 })
    ],
    usersControllers.login);

module.exports = router;