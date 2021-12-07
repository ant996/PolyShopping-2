var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// Get Product model
var Product = require('../models/product');

// Get Category model
var Category = require('../models/category');

// Get Category model
var Reserv = require('../models/reserv');


/*
 * GET products index
 */
router.get('/', function (req, res) {
    var count;

    Product.count(function (err, c) {
        count = c;
    });

    Product.find(function (err, products) {
        res.render('admin/products', {
            products: products,
            count: count
        });
    });
});

/*
 * GET add product
 */
router.get('/add-product', function (req, res) {

    var title = "";
    var desc = "";
    var price = "";
    var etat = 0;

    Reserv.find(function (err, reservation) {
        Category.find(function (err, categories) {
            res.render('admin/add_product', {
                title: title,
                desc: desc,
                etat: etat,
                categories: categories,
                reservation : reservation,
                price: price
            });
        });
    });

});

/*
 * POST add product
 */
router.post('/add-product', function (req, res) {

    if(!req.files){ imageFile ="" ; }
    if(req.files){ var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";}

    req.checkBody('title', 'Title non valide').notEmpty();
    req.checkBody('desc', 'Description non valide').notEmpty();
    req.checkBody('price', 'Prix non valide').isDecimal();
    req.checkBody('image', 'Image non valide').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var reserv = req.body.reserv;

    var errors = req.validationErrors();

    if (errors) {
        Reserv.find(function (err, reservation) {
        Category.find(function (err, categories) {
            res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                reservation: reservation,
                price: price
            });
        });});
    } else {
        Product.findOne({slug: slug}, function (err, product) {
            if (product) {
                req.flash('danger', 'Le nom du produit est déjà utilisé');
                Reserv.find(function (err, reservation) {
                Category.find(function (err, categories) {
                    res.render('admin/add_product', {
                        title: title,
                        desc: desc,
                        categories: categories,
                        reservation: reservation,
                        price: price
                    });
                });});
            } else {

                var price2 = parseFloat(price).toFixed(2);

                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    reserv:reserv,
                    image: imageFile
                });

                product.save(function (err) {
                    if (err)
                        return console.log(err);

                    mkdirp('public/product_images/' + product._id, function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery', function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
                        return console.log(err);
                    });

                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product._id + '/' + imageFile;

                        productImage.mv(path, function (err) {
                            return console.log(err);
                        });
                    }
                    req.flash('success', 'Produit enregistrer');
                    res.redirect('/');
                });
            }
        });
    }

});

/*
 * GET edit product
 */
router.get('/edit-product/:id', function (req, res) {

    var errors;

    if (req.session.errors)
        errors = req.session.errors;
    req.session.errors = null;
    
    Reserv.find(function (err, reservation) {
        Category.find(function (err, categories) {
            Product.findById(req.params.id, function (err, p) {
                if (err) {
                    console.log(err);
                    res.redirect('/admin/products');
                } else {
                    var galleryDir = 'public/product_images/' + p._id + '/gallery';
                    var galleryImages = null;

                    fs.readdir(galleryDir, function (err, files) {
                        if (err) {
                            console.log(err);
                        } else {
                            galleryImages = files;

                            res.render('admin/edit_product', {
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
router.post('/edit-product/:id', function (req, res) {

    if(!req.files){ imageFile ="" ; }
    if(req.files){ var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";}

    req.checkBody('title','Titre non valide').notEmpty();
    req.checkBody('desc', 'Descriptionnon valide').notEmpty();
    req.checkBody('price', 'Prix non valide').isDecimal();
    req.checkBody('reserv','reserv non valide').notEmpty();
    req.checkBody('Image', 'Image non valide').isImage(imageFile);

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
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        Product.findOne({slug: slug, _id: {'$ne': id}}, function (err, p) {
            if (err)
                console.log(err);

            if (p) {
                req.flash('danger', 'Produit déjà exitant, choisir un nouveau titre');
                res.redirect('/admin/products/edit-product/' + id);
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
                        res.redirect('/admin/products');
                    });

                });
            }
        });            
    }
//
});

/*
 * GET delete image
 */
router.get('/delete-image/:image', function (req, res) {

    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function (err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success', 'Image deleted!');
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    });
});

/*
 * GET delete product
 */
router.get('/delete-product/:id', function (req, res) {

    var id = req.params.id;
    var path = 'public/product_images/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            Product.findByIdAndRemove(id, function (err) {
                console.log(err);
            });
            
            req.flash('success', 'Product deleted!');
            res.redirect('/admin/products');
        }
    });

});

// Exports
module.exports = router;


