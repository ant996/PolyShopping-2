var mongoose = require('mongoose');

// Product Schema
var ReservSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    }   
});

var Reserv = module.exports = mongoose.model('Reserv', ReservSchema);

