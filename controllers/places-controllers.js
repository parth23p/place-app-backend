const fs = require('fs');
const HttpError = require("../models/http-error.js");
const mongoose = require("mongoose");
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../util/location');

const Place = require("../models/place");
const User = require("../models/user");

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.placeId;
    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError("Someting went wrong,couldn't find a place!", 500);
        return next(error);
    }

    // console.log("get request in places");
    if (!place) {
        const error = new HttpError("Could not find a place for the provided ID", 404);
        return next(error);
    }
    res.json({ place: place.toObject({ getters: true }) });
};
// const error =
// error.code = 404;
// throw error;

// res.status(404).json({ message: "couldn't find place or provided id!" });
// throw cancels function execution




const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.userId;
    // let places;
    let userWithPlaces;
    try {
        userWithPlaces = await User.findById(userId).populate('places');
    } catch (err) {
        const error = new HttpError(
            'Fetching places failed, Please try again later',
            500);
        return next(error);
    }

    if (!userWithPlaces || userWithPlaces.length === 0) {
        // const error = new Error("Could not find a place for the provided user id");
        // error.code = 404;
        return next(new HttpError("Could not find a place for the provided user id", 404));
        // res.status(404).json({ message: "couldn't find place or provided id!" });
        // next does not cancels execution of function so we have to return 
    }
    res.json({ places: userWithPlaces.places.map((place) => place.toObject({ getters: true })) });
    // because find return array so we have to map place=>place object
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    // validationResult checks validation on field required by in post parameter and return errors if there are errors
    if (!errors.isEmpty()) {
        console.log(errors);
        next(new HttpError('Invalid Inputs passed!please Check your data', 422));
    }
    const { title, description, address, creator } = req.body;
    // coordinates,
    //const title=req.body.title;
    // let coordinates;
    // try {
    //     coordinates = await getCoordsForAddress(address);
    // } catch (error) {
    //     return next(error);
    // }
    // console.log(coordinates);

    const createdPlace = new Place({
        title,
        // title, === title:title,
        description,

        address,
        // location: coordinates,
        image: req.file.path,
        creator
        // creator:req.userData.userId
    });
    let user;
    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError(
            'creating place failed, please try again!(user not exists)',
            500
        );
        return next(error);
    }

    if (!user) {
        const error = new HttpError('we could not find user for provided id', 404);
        return next(error);
    }
    console.log(user);

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        // user.places.push(createdPlace) pushesh place id into that particular user's places array. this is important!!!!
        await user.save({ session: sess });
        await sess.commitTransaction();
        // await createdPlace.save();
        //  only place created succesfully and user updated with that id will performed successfully else either of them got failed none of the both operation will be done!
    }
    catch (err) {
        const error = new HttpError(
            'creating place failed, please try again!',
            500
        );
        return next(error);
    }
    // DUMMY_PLACES.push(createdPlace);

    res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    // validationResult checks validation on field required by in post parameter and return errors if there are errors
    if (!errors.isEmpty()) {
        // console.log(errors);
        throw new HttpError('Invalid Inputs passed!please Check your data', 422);
    }
    const { title, description } = req.body;
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Somehing went wrong,could not update place',
            500
        );
        return next(error);
    }
    // const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };
    // const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
    if (place.creator.toString() !== req.userData.userId) {
        const error = new HttpError(
            'You are not allowed to edit the place!',
            401
        );
        return next(error);
    }
    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError(
            'Somehing went wrong,could not update place',
            500
        );
        return next(error);
    }
    // DUMMY_PLACES[placeIndex] = updatedPlace;
    res.status(200).json({ place: place.toObject({ getters: true }) });
    // send status code 201 if we created anything new after new thing has successfully created or added
    // for update  send status code 200 , because we didn't created anything new!
};

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, Could not delete place successfully!',
            500
        );
        return next(error);
    }
    const imagePath = place.image;

    if (!place) {
        const error = new HttpError('Could not find the place for this id', 404);
        return next(error);
    }
    if (place.creator.id !== req.userData.userId) {
        const error = new HttpError(
            'You are not allowed to delete the place!',
            401
        );
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({ session: sess });
        place.creator.places.pull(place);
        await place.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, Could not delete place successfully!',
            500
        );
        return next(error);

    }
    // if (!DUMMY_PLACES.find(p => p.pid === placeId)) {
    //     throw new HttpError('Could not find a place for a given ID!!!!!', 404);
    // }
    // DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id = !placeId);
    fs.unlink(imagePath, err => {
        console.log(err);
    });
    res.status(200).json({ message: "Deleted place successfully" });
    console.log("Deleted Successfully!");
};



exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
//cors:Cross origin resource sharing