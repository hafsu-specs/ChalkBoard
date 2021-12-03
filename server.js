// Load Node modules
var express = require('express');
const ejs = require('ejs');
// Initialise Express
var app = express();
// Render static files
app.use(express.static('public'));
// Set the view engine to ejs
app.set('view engine', 'ejs');
// Port website will run on
app.listen(8080);

//tracks all activities
var listnames=[];
// *** GET Routes - display pages ***
// Root Route
app.get('/', function (req, res) {
    listnames[0] = ("Index page opened");
    res.render('pages/index');
});
app.get('/SignUp', function (req, res) {
    listnames[1] = ("Signup opened");
    res.render('pages/SignUp');
});

app.get('/StudentHome', function (req, res) {
    listnames[2]=("student logged in");
    res.render('pages/StudentCoursesHomePages');
});
app.get('/InstructorHome', function (req, res) {
    listnames[3] = ("instructor logged in");
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