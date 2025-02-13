const mongoose = require('mongoose');

const lentSchema = new mongoose.Schema({
    lenderId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    borrowers:[{
        borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
        groupId: {type: mongoose.Schema.Types.ObjectId, ref:'Group'},
        friendId: {type:mongoose.Schema.Types.ObjectId, ref:'User'},
        amountLent: { type: Number, required: true },
    }]
});


module.exports = mongoose.model('Lent', lentSchema);