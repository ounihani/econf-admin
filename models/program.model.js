const mongoose = require('mongoose');

const programSchema = mongoose.Schema({

    cv: String,
    programname: String,
    email :String,
    description: String,
    depositor:String,
    com_scientifique:String,
    coordinator:String,
    conference:String,
    isValid:Boolean,
    mailsent:Boolean
    
});
const progModel = mongoose.model('programs',programSchema);
module.exports = progModel;