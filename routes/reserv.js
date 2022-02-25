var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var auth = require('../config/auth');
var isUser = auth.isUser;

// Get Product model
var Product = require('../models/product');
// Get Category model
var Category = require('../models/category');
// Get Category model
var Reserv = require('../models/reserv');

/*
 * GET all products
 */
router.get('/', function (req, res) {
//router.get('/', isUser, function (req, res) {

    Product.find(function (err, products) {
        if (err)
            console.log(err);

        res.render('edit_reserv', {
            title: 'Tous les produits',
            products: products
        });
    });

});

/*
 * GET edit product
 */
router.get('/edit-reserv/:id', function (req, res) {

    var errors;

    if (req.session.errors)
        errors = req.session.errors;
    req.session.errors = null;
    
    Reserv.find(function (err, reservation) {
        Category.find(function (err, categories) {
            Product.findById(req.params.id, function (err, p) {
                if (err) {
                    console.log(err);
                    res.redirect('/reserv');
                } else {
                    var galleryDir = 'public/product_images/' + p._id + '/gallery';
                    var galleryImages = null;

                    fs.readdir(galleryDir, function (err, files) {
                        if (err) {
                            console.log(err);
                        } else {
                            galleryImages = files;

                            res.render('edit_reserv', {
                                title: p.title,
                                errors: errors,
                                desc: p.desc,
                                categories: categories,
                                category: p.category.replace(/\s+/g, '-').toLowerCase(),
                                price: parseFloat(p.price).toFixed(2),
                                reservation: reservation,
                                reserv: p.reserv.replace(/\s+/g, '-').toLowerCase(),
                                image: p.image,
                                galleryImages: galleryImages,
                                id: p._id
                                });
                        }
                    });
                }
            }); 
        });
   });

});

/*
 * POST edit product
 */
router.post('/edit-reserv/:id', function (req, res) {

    if(!req.files){ imageFile ="";}
    if(req.files){ var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";}

    req.checkBody('reserv','reserv non valide').notEmpty();


    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var reserv = req.body.reserv;
    var pimage = req.body.pimage;
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/' + id);
    } else {
        Product.findOne({slug: slug, _id: {'$ne': id}}, function (err, p) {
            if (err)
                console.log(err);

            if (p) {
                req.flash('danger', 'Produit déjà exitant, choisir un nouveau titre');
                res.redirect('/admin/reserv/edit-reserv/' + id);
            } else {
                Product.findById(id, function (err, p) {
                    if (err)
                        console.log(err);

                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    p.reserv = reserv;
                    if (imageFile != "") {
                        p.image = imageFile;
                    }

                    p.save(function (err) {
                        if (err)
                            console.log(err);

                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                                    if (err)
                                        console.log(err);
                                });
                            }
                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile;

                            productImage.mv(path, function (err) {
                                return console.log(err);
                            });

                        }

                        req.flash('Succès', 'Produit mise en ligne');
                        res.redirect('/');
                    });

                });
            }
        });            
    }
//
});


// Exports
module.exports = router;


