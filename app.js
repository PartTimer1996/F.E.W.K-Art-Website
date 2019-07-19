const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express()
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/wikiDB', {useNewUrlParser: true});


//Schema and model already created using Robo3t to create the collection and documents
/*
const wikiSchema =
    { title: String,
        content: String }


const Article = mongoose.model('Article',
    wikiSchema);
*/



app.get('/', function (req, res)
{

    res.render("home")
    /* Article.find({}, function (err, foundArticle) {
         if(!err){
             if(foundArticle){
                 res.send(foundArticle)
             }else{
                 res.send('No Article Found!')
             }
         }
     });*/
})

app.get('/Gallery', function (req, res)
{

    res.render("Gallery")
    /* Article.find({}, function (err, foundArticle) {
         if(!err){
             if(foundArticle){
                 res.send(foundArticle)
             }else{
                 res.send('No Article Found!')
             }
         }
     });*/
})

app.listen(port, () => console.log(`REST app listening on port ${port}!`))