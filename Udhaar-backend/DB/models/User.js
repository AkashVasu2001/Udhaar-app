const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {type:String, required: true},
    email:{type:String, required:true, unique:true},
    image:{type:String},
    friends:[{
        friendId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }}]
});

module.exports = mongoose.model('User', userSchema);