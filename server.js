// Load Node modules
var express = require('express');
const ejs = require('ejs');
const dotenv = require('dotenv');
const bodyParser = require("body-parser");
const user = require("./routes/user"); //new addition
const InitiateMongoServer = require("./config/db");

// Initiate Mongo Server
InitiateMongoServer();
//require env
dotenv.config({path:'./config/config.env'})
// Initialise Express
var app = express();
// Render static files
app.use(express.static('public'));
// Middleware
app.use(bodyParser.json());
/**
 * Router Middleware
 * Router - /user/*
 * Method - *
 */
app.use("/user", user);
// Set the view engine to ejs
app.set('view engine', 'ejs');
// Port website will run on
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`server is running on port: ${PORT}` ));

//tracks all activities
var listnames=[];
var i=0;
// *** GET Routes - display pages ***
// Root Route
app.get('/json', (req, res) => {
res.status(200).json({success: true, msg: "Show all users"});
});
app.get('/', function (req, res) {
    listnames[i] = ("Index page opened");
    i++;
    res.render('pages/index');
});

//signup

const users = []
app.get('/SignUp', function (req, res) {
    listnames[i] = ("Signup opened");
    i++;
    res.render('pages/SignUp');
});

app.post('/SignUp', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            username: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            re_password: hashedPassword
        })
        res.redirect('/')
    } catch {
        res.redirect('/SignUp')
    }
})


app.get('/StudentHome', function (req, res) {
    listnames[i]=("student logged in");
    i++;
    res.render('pages/StudentCoursesHomePages');
});
app.get('/InstructorHome', function (req, res) {
    listnames[i] = ("instructor logged in our app");
    i++;
    res.render('pages/InstructorCoursesHomePage');
});
// Route Route
app.get('/AdminView', function (req, res) {
    // Render index page
    res.render('pages/AdminView', {
        // EJS variable and server-side variable
        listnames: listnames
    });
});

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}