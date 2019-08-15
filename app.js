//Import all the necessary packages
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const saltRounds =10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");
const flash = require('connect-flash');
const expressValidator = require('express-validator');
const MongoStore = require('connect-mongo')(session);

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: "my lil secret",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    cookie: {maxAge: 100 * 60 * 1000}
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("public"));
app.use(flash());
app.use(expressValidator());

app.use(function(req, res, next){
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
    });
    
const uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    "mongodb+srv://Admin:Edenhazard69!@cluster0-b6puq.mongodb.net/FEWKDB";

mongoose.connect(uristring, {useNewUrlParser: true}, function (err, res) {
    if (err) {
        console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log ('Succeeded connected to: ' + uristring);
    }
});

mongoose.set("useCreateIndex", true);


const itemSchema = new mongoose.Schema (
    {
        imagePath: {type: String, required:true},
        title: {type: String, required:true},
        description: {type: String, required:true},
        price: {type: Number, required:true}
    }
);

const Item = mongoose.model('Item', itemSchema);

// Seeding the new database collection
// const items = [
//     new Item({
//    imagePath: "https://i.etsystatic.com/20487395/r/il/bc1006/1987696279/il_794xN.1987696279_qrv1.jpg",
//     title: "Trump Toad!",
//     description: "Image of Trump as a toad man, just for you!!",
//     price: "1000"
// }),
//     new Item({
//         imagePath: "https://i.etsystatic.com/20487395/r/il/9c4490/1916130094/il_794xN.1916130094_qbx1.jpg",
//         title: "D O N A L D",
//         description: "Aye it's Donald the Duck",
//         price: "15"
//     }),
//     new Item({
//         imagePath: "https://www.etsy.com/uk/listing/715733747/criangle?ref=shop_home_active_5",
//         title: "Criangle",
//         description: "You too can have this Criangle imagery",
//         price: "7500"
//     }),
//     new Item({
//         imagePath: "https://www.etsy.com/uk/listing/715372063/g-o-o-f-y?ref=shop_home_active_9",
//         title: "GOOFY",
//         description: "Your very one Pooh bear!",
//         price: "10"
//     }),
// ];
//
//
// for(let i = 0; i < items.length; i ++)
// {
//     items[i].save();
// }



//Creation of Schema and Model to add to this database
const userSchema = new mongoose.Schema (
    {   forename: String,
        surname: String,
        username: String,
        password: String,
        googleId:  String,
        secret: String
    }
);


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);

//Seeding the user collection
//  const newUser = new User({
//      forename: "Ryan",
//      surname: "Duffy",
//      username: "rduffy16@qub.ac.uk",
//     password: "Edenhazard69"

//  });

//  newUser.save();


passport.use(User.createStrategy());

passport.serializeUser(function(user, done){
    done(null, user.id)
});

passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user);
    })
});

passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:5000/auth/google/FEWK-Art",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function(accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));

function isLoggedIn(req,res,next) {
     if (req.isAuthenticated()){
         return next();
     }
     res.redirect('/');
}

function isLoggedOut(req,res,next) {
    if (!req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

app.get("/auth/google",
    passport.authenticate("google", {scope : ['profile']}, function(){

    })
)

app.get('/auth/google/FEWK-Art',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect to secrets.
        res.redirect('/');
    });


// COME BACK TO - model this as a chained REST Application for each page!

const user = 'Ryan Duffy';

app.get('/',  function (req, res)
{
    if(req.isAuthenticated()) {
        res.render('home', {testOutput: req.user.username});
    }
    else {
        res.render('home', {testOutput: ''});
    }

});

app.get('/Gallery', function (req, res)
{
    res.render("Gallery")
});

app.get('/Store', function (req, res)
{
    Item.find({}, function(err, foundItems){
        if (!err) {
            if (foundItems.length === 0) {
                res.render("Store");
            } else {
                res.render("Store", {
                    onlineItems: foundItems //itemChunks
                });
            }
        }
        else{
            console.log(err);
            res.redirect("/");
        }
    })
});

app.get('/Contact_Me', function (req, res)
{
    res.render("Contact_Me")
});

app.get('/Login',isLoggedOut, function (req, res)
{
        res.render('Login');
});
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login', // see text
    failureFlash: true // optional, see text as well
  })
);

app.get('/logout',isLoggedIn, function (req, res) {
    req.logout();
    res.redirect("/");
})

app.get('/Register',isLoggedOut, function (req, res)
{ 
        res.render('Register', {title: 'Form Validation', success: req.session.success, errors: req.session.errors, duplicate: req.session.duplicate});
        req.session.errors = null;
    
});
app.post('/Register', function(req,res){
            req.check('forename', 'Provide a valid first name').isLength({min:2});
            req.check('surname', 'Provide a valid last name').isLength({min:2});
            req.check('username', 'Provide a valid email address').isEmail();
            req.check('password', 'Password must be longer than 6 characters').isLength({min:6});
            req.check('password', 'Password must match Confirm Password').equals(req.body.passwordConfirm);
            var errors = req.validationErrors();

            User.findOne({username: req.body.username}, function(err, foundUsers){
          
                if (!err) {
                if (foundUsers) {
                req.session.duplicate = true;
                errors = false;
                res.redirect('/Register');
                
             }
             else{
                 req.session.duplicate = false;
                 if (errors) {
                    req.session.errors = errors;
                    req.session.success = false;
                    res.redirect('/Register')
                  }else if (!errors){
                    req.session.success = true;
                    errors = {};
                User.register({forename: req.body.forename, surname: req.body.surname, username: req.body.username}, req.body.password, function(err, user) {
                        passport.authenticate("local")(req,res,function(){
                            res.redirect("/")
                  })
            })
            }
             } 
           }
        })
});

app.get("/userProfile", isLoggedIn,function(req,res){
    
        res.render('userProfile')
    
})


app.get("/submit", function(req,res){
    if(req.isAuthenticated()){
        res.render('submit');
    }else {
        res.redirect('/login')
    }
})

function Cart(oldCart) { 
    this.products = oldCart.products || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalCost = oldCart.totalCost || 0;

    this.add = function(product, id){
        let storedProduct = this.products[id];
        if(!storedProduct) {
            storedProduct = this.products[id] = {product: product, qty: 0, price: 0}
        }
        storedProduct.qty++;
        storedProduct.price = storedProduct.product.price * storedProduct.qty;
        this.totalQty++;
        this.totalCost += storedProduct.product.price;
}
    this.generateArray = function(){
        const arr = [];
        for (var id in this.products){ 
            arr.push(this.products[id]);
        }
        return arr;
    }
};

app.get("/add-to-cart/:id", function (req,res, next){
const productId = req.params.id; 
const cart = new Cart(req.session.cart ? req.session.cart : {});

Item.findById(productId, function(err, item){
    if (err){
        return res.redirect('/Store');
    }
    cart.add(item, item.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/Store')
});
});

app.get('/Shopping_Cart', function(req, res ,next){
if(!req.session.cart){
    return res.render('Shopping_Cart', {products: null});
}
let cart = new Cart(req.session.cart);
res.render('Shopping_Cart', {products: cart.generateArray(), totalPrice: cart.totalCost})
});


const port = process.env.PORT || 5000;

app.listen(process.env.PORT || 5000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});