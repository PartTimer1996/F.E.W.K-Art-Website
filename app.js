//jshint esversion:6

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


const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "my lil secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


app.use(express.static("public"));


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

//Creation of Schema and Model to add to this database
const userSchema = new mongoose.Schema (
    {   username: String,
        password: String,
        googleId: String,
        secret: String
    }
);

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);

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
        callbackURL: "http://localhost:3000/auth/google/FEWK-Art",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function(accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));

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
    res.render("Store")
});

app.get('/Contact_Me', function (req, res)
{
    res.render("Contact_Me")
});

app.get('/Login', function (req, res)
{
    if(req.isAuthenticated()){
        res.redirect("/logout")
    }else {
        res.render('Login');
    }

});

app.get('/Register', function (req, res)
{
    if(req.isAuthenticated()){
        res.redirect("/")

    }else {
        res.render('Register');
    }

});

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect("/");
})

app.get("/submit", function(req,res){
    if(req.isAuthenticated()){
        res.render('submit');
    }else {
        res.redirect('/login')
    }
});

app.post('/Register', function(req,res){

    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err)
        {
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/")
            })
        }
    });
});

app.post('/login', function(req, res){

    const user = new User({
        username: req.body.username,
        password: req.body.password

    });

    req.login(user, function(err){
        if(err){
            console.log(err);
            res.redirect("/login");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/");
            });
        }
    });
});



app.listen(port, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});