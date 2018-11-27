var express = require('express');
var router = express.Router();

var Product = require('../models/product');
var Cart = require('../models/cart');
var Order = require('../models/order');
/* GET home page. */
router.get('/', function(req, res, next) {
    debugger;
    var successMsg = req.flash('success')[0];
    var products = Product.find(function(err, docs){

      var productChunks = [];
      var chunkSize = 3;
      for(var i=0; i<docs.length; i+= chunkSize){
        productChunks.push(docs.slice(i, i + chunkSize));

      }
      res.render('shop/index', { title: 'Shopping Cart!',
                                 products: productChunks,
                               successMsg : successMsg,
                              noMessages : !successMsg});

  });
});

router.get('/add-to-cart/:id', function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {}); // if cart exists, pass the cart, else empty object

  Product.findById(productId, function(err, product){
    if(err){
      return res.redirect('/');
    }

    cart.add(product, product.id);
    req.session.cart = cart;
    //console.log(req.session.cart);
    res.redirect('/');
  });

});

router.get('/reduce/:id', function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {}); // if cart exists, pass the cart, else empty object

  Product.findById(productId, function(err, product){
    if(err){
      return res.redirect('/');
    }

    cart.reduceByOne(productId);
    req.session.cart = cart;
    //console.log(req.session.cart);
    res.redirect('/shopping-cart');
  });

});

router.get('/remove/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function(req, res, next) {
    if(!req.session.cart){
      return res.render('shop/shopping-cart', {products : null});
    }

    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', {products : cart.generateArray(), totalPrice : cart.totalPrice});

});

router.get('/checkout', isLoggedIn, function(req, res, next) {
    if(!req.session.cart){
      return res.redirect('shop/shopping-cart');
    }

    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];

    res.render('shop/checkout', {total : cart.totalPrice,
                                 totalPrice : cart.totalPrice,
                                 errMsg : errMsg,
                                 noError : !errMsg
                                 });

});

router.post('/checkout', isLoggedIn, function(req, res, next){
  //console.log('reached');
  if(!req.session.cart){
    return res.redirect('shop/shopping-cart');
  }
  var cart = new Cart(req.session.cart);


  console.log(req.body.stripeToken);
  var stripe = require("stripe")("sk_test_UefRt0hNhAexSUwMI5Vvu6AL");
  stripe.charges.create({
    amount: cart.totalPrice * 100, // in cents
    currency: "usd",
    source: "tok_visa", //req.body.stripeToken, // obtained with Stripe.js - hidden input field
    description: "Test charge for Ismail"
  }, function(err, charge) {
    // asynchronously called
    if(err){ // if error
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }

    console.log({ user: req.user,
                  cart: cart,
                  address: req.body.address,
                  name: req.body.name,
                  paymentId: charge.id
                });

    var order = new Order({
            user: req.user,
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            paymentId: charge.id
        });
    order.save(function(err, result) {
        req.flash('success', 'Successfully bought product!');
        req.session.cart = null;
        res.redirect('/');
    });


  });

});

module.exports = router;

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  req.session.oldUrl = req.url; // Old URL
  res.redirect('/user/signin');
};

function notLoggedIn(req, res, next){
  if(!req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
};
