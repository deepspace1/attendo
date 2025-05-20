const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    rollNumber: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    barcodeId: {
        type: String,
        required: true,
        unique: true
    }
}, { 
    timestamps: true,
    _id: true // Ensure _id is enabled
});

// Drop any existing indexes
studentSchema.indexes().forEach(index => {
    studentSchema.index(index[0], { unique: false });
});

module.exports = mongoose.model('Student', studentSchema); 