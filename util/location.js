// const { default: axios } = require("axios");
// const HttpError = require("../models/http-error");

// API_KEY = "pk.eyJ1IjoicGFydGgyM3AiLCJhIjoiY2ttNXp6dDJvMGphcjJvcXMxeDJsc3ZqMiJ9.9aAbUpiLuDcdjUOU_Ie-Hw";

// const getCoordsForAddress = async (address) => {

//     // return {
//     //     lat:40.7484474,
//     //     lng:-73.9871516
//     //     };
//     const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?&access_token=pk.eyJ1IjoicGFydGgyM3AiLCJhIjoiY2ttNXp6dDJvMGphcjJvcXMxeDJsc3ZqMiJ9.9aAbUpiLuDcdjUOU_Ie-Hw`);
//     const data = response.data;
//     // encodeURIComponent(address)
//     // || data.status === 'ZERO_RESULTS'
//     if (!data) {
//         const error = new HttpError('Could not find location for the specific address.', 422);
//         throw error;
//     }
//     const coordinates = data.features[0].center[0];
//     // console.log(coordinates);
//     return coordinates;


// };
// module.exports = getCoordsForAddress;