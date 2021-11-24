const mongoose = require('mongoose');

const conferenceSchema = mongoose.Schema({

    shortname: String,
    label: String,
    description: String,
    scientificdomain :String,
    from: Date,
    to : Date,
    location : String,
    organizations: String,
    people:Number,
    event: String,
    confadmin: String,
    com_scientifique:String,
    coordinator:String,
    participants: [String] ,
    prog:{}

});
const conferenceModel = mongoose.model('conferences',conferenceSchema);
module.exports = conferenceModel;