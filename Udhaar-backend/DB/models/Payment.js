const mongoose = require('mongoose');

// Payment Schema
const paymentSchema = new mongoose.Schema({
    amountPaid: { 
        type: Number, 
        required: true 
    },
    paidBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    paidTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    groupId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Group',
        required: false // Optional: only required if the payment is group-related
    },
    friendId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Friends', 
        required: false // Optional: only required if the payment is friendship-related
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    description: { 
        type: String, 
        required: false // Optional: a description of the payment
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create and export the model for the Payment collection
module.exports = mongoose.model('Payment', paymentSchema);
