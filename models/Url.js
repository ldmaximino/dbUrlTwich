const mongoose = require('mongoose');

const { Schema } = mongoose;

const urlSchema = new Schema({
    origin: {
        type: String,
        unique: true,
        required: true
    },
    shortUrl: {
        type: String,
        unique:true,
        required:true
    },
    user: {
        type: Schema.Types.ObjectID,
        ref: "User",
        required: true
    }
});

const Url = mongoose.model('Url', urlSchema); //en mongoDB se va a guardar la colección en lowercase y plural, o sea, "urls"

module.exports = Url;
