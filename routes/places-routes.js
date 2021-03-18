const express = require("express");
const { check } = require('express-validator');
const HttpError = require("../models/http-error");
const router = express.Router();
const fileUpload = require('../middleware/file-upload');
const placesControllers = require("../controllers/places-controllers");
const checkAuth = require("../middleware/check-auth");

router.get("/:placeId", placesControllers.getPlaceById);
router.get("/user/:userId", placesControllers.getPlacesByUserId);

//check is exprress validator for field title the string shouldn't be empty so check('title).not.isEmpty()
router.use(checkAuth);
// requests without valid tokens will not be reched below routes

router.post(
    "/",
    fileUpload.single('image'),
    [
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5 }),
        check('address').not().isEmpty()
    ],
    placesControllers.createPlace
);

router.patch(
    '/:pid',
    [
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5 })
    ],
    placesControllers.updatePlace
);
router.delete('/:pid', placesControllers.deletePlace);
module.exports = router;