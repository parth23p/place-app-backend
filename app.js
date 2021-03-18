const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require("mongoose");
const HttpError = require('./models/http-error');
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

const app = express();

//next is used to point next middleware in line
app.use(bodyparser.json());
app.use('/uploads/images', express.static(path.join('uploads', 'images')));
// path joins 'uploads','images' string as a path to find requested file
// by default middleware allows to execute programatically changes and  not allowing file read write permisions.
// but we want that our backend middleware return a file to forntend so we have to use route '/uploads/images' where our all files(images are located)
// and express.static exactly does that.it returns a requested file to frontend
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Reequested-With,Content-Type,Accept,Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');

    next();
});

app.use('/api/places', placesRoutes);
app.use("/api/users", usersRoutes);
app.use((req, res, next) => {
    const error = new HttpError("Could not firnd this route!", 404);
    throw error;
});

// general error handler middleware
app.use((error, req, res, next) => {
    //    if we have  file and we have an eror also then a file could not be stored on a disk (specially image file)
    // multer provides req.file functionality to check whether we have a file(image) to submit in a form or not
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        })
    }
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    // 500 code indicates omething went wrong to the server
    res.json({ message: error.message || "Something went wrong! An unknown error has occured" })
});

mongoose
    .connect(`mongodb+srv://academind123:academind123@cluster0.d9ujz.mongodb.net/mern?retryWrites=true&w=majority`)
    .then(() => {
        // mongodb+srv://${process.env.DB_USER}:${process.env.DB_ASSWORD}@cluster0.d9ujz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority
        // there is a process globally available in node js and env key gives u an aceess to environment variables into running proess
        app.listen(process.env.PORT || 5000, function (req, res) {
            console.log("listening on port 5000");
        });
    })
    .catch((err) => {
        console.log(err);
    });
