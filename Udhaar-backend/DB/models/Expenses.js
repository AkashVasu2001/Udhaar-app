const mongoose = require('mongoose');
const expenseSchema = new mongoose.Schema({
    groupId : {type: mongoose.Schema.Types.ObjectId, ref:'Group'},
    friendId: {type:mongoose.Schema.Types.ObjectId, ref:'User'},
    lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  
    borrowerDetails: [{
        borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
        amountLent: { type: Number, required: true },
        paid:{type: Boolean, default: false}
    }],
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now }, 
    title: { type: String },

},{
    timestamps: true,
});
module.exports =  mongoose.model('Expense', expenseSchema);
