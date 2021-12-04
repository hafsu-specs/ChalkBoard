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
var i=0;
// *** GET Routes - display pages ***
// Root Route
app.get('/', function (req, res) {
    listnames[i] = ("Index page opened");
    i++;
    res.render('pages/index');
});
app.get('/SignUp', function (req, res) {
    listnames[i] = ("Signup opened");
    i++;
    res.render('pages/SignUp');
});

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