const multer = require('multer');
// const uuid = require('uuid');
const uniqueId = require('generate-unique-id');
const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};
const fileUpload = multer({
    limits: 500000,
    // limit of file to be uploaded with text+image is 500000 bytes
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/images');
        },
        filename: (req, file, cb) => {
            const ext = MIME_TYPE_MAP[file.mimetype];
            cb(null, uniqueId() + '.' + ext);
        }
    }),
    fileFilter: (req, file, cb) => {
        const isValid = !!MIME_TYPE_MAP[file.mimetype];
        // if file.mimetype returns other values then png,jpg,jpeg then then returtning value is undefined
        // so !! oprstot converts undefined or null to false
        let error = isValid ? null : new Error('Invalid Mime Type');
        cb(error, isValid);
    }
});



module.exports = fileUpload;