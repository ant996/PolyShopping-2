exports.isUser = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('danger', 'Connectez-vous.');
        res.redirect('/users/login');
    }
}

