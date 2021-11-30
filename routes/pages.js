var express = require('express');
var router = express.Router();

// Get Page model
var Page = require('../models/page');

/*
 * GET /
 */
router.get('/', function (req, res) {
    
    Page.findOne({slug: 'PolyShop'}, function (err, page) {
        if (err)
            console.log(err);

        res.render('index', {
            title: 'PolyShop',
            content: ''
        });
    });
    
});

// Exports
module.exports = router;


