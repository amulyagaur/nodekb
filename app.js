//Bring Express here
const express = require('express');
const app = express();
var router = express.Router();
const config = require('./config/database');
const passport = require('passport');
//Bring bodyParser here
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


//Set template engine
app.set('view engine', 'pug');

const port = 3020

//Define Static folder
app.use(express.static('public'));

//Express Session middleware
var session = require('express-session');
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

//Express messages middleware
var flash = require('connect-flash');
app.use(require('connect-flash')());
app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Express validator midlleware
var expressValidator = require('express-validator')
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

//Connecting to nodekb database
var mongoose = require('mongoose');
mongoose.connect(config.database, {
    useNewUrlParser: true
});
var db = mongoose.connection;

// if we're not connected yet
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
    console.log("Database Connected!")
});

//Bring the model here
let Article = require('./models/article');
let User = require('./models/user');
//General route for declaring global variable 'user'
app.get('*', function(req, res, next) {
    res.locals.user = req.user || null;
    next();
});
//Home route
app.get('/', function(req, res) {

    Article.find({}, function(err, article) {
        if (err)
            console.log(err);
        else {

            res.render('index', {
                title: 'Articles!',
                articles: article,
            });
        }
    });

});

//Use router
let articles = require('./routes/articles');
app.use('/articles', articles);

let users = require('./routes/users');
app.use('/users', users);

//Start server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
