var mongoose = require('mongoose');
var bcrypt = require('bcrypt')
var Schema = mongoose.Schema

var schema = Schema({

    accountname: String,
    firstname: String,
    lastname: String,
    email :String,
    password: String,
    enabled : String,
    cv:String,
    role: { type: String, enum: ['admin', 'restricted'], required: true , default: 'restricted'}
});
schema.statics.hashPassword = function hashPassword(password){
    return bcrypt.hashSync(password,10);

}
schema.methods.isValid = function (hashedpassword){
    return bcrypt.compareSync(hashedpassword,this.password)
}
module.exports = mongoose.model('User',schema);