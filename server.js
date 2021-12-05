// Load Node modules
var express = require('express');
const ejs = require('ejs');
var path = require('path');
var mysql = require('mysql');
var session = require('express-session');
var bodyParser = require("body-parser");

// Initialise Express
var app = express();
// Render static files
app.use(express.static('public'));
// Middleware
app.use(bodyParser.json());

app.set('view engine', 'ejs');
// Port website will run on
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`server is running on port: ${PORT}` ));

//connect with the mysql database on linux
var connection = mysql.createConnection({
	host     : 'mars.cs.qc.cuny.edu',
	user     : 'agru2717',
	password : '23722717',
	database : 'agru2717'
});

//using express packages
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

//tracks all activities
var listnames=[];
var i=0;

//When the client enters their details in the login form and clicks the submit button, the form data will be sent to the server
// and with that data our login script will check in our MySQL accounts table to see if the details are correct
app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/StudentHome');
			} else {
                //response.send("incorrect username/or password");
                listnames[i]=("user redirected to home page: login failed");
                i++;
                response.redirect('/');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

// *** GET Routes - display pages ***

//landing page
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

app.get('/temp', function (req, res) {
    listnames[i] = ("Temporary page with links to all views");
    i++;
    res.render('pages/temp');
});

app.get('/StudentProfile', function (request, response) {
    if (request.session.loggedin) {
        listnames[i]=(request.session.username + " student profile");
        i++;
        response.render('pages/StudentProfile');
       return;
   } else {
        listnames[i]=("student access denied: please login");
        i++;
        response.redirect('/');
   }
   response.end();
});

app.get('/SignUp', function (req, res) {
    listnames[i] = ("Signup opened");
    i++;
    res.render('pages/SignUp');
});

app.get('/About', function (req, res) {
    listnames[i]=("Opened About page");
    i++;
    res.render('pages/About');
});

app.get('/StudentHome', function(request, response) {
	if (request.session.loggedin) {
         listnames[i]=(request.session.username + " student logged in");
         i++;
         response.render('pages/StudentCoursesHomePage');
        return;
	} else {
         listnames[i]=("student access denied: please login");
         i++;
         response.redirect('/');
	}
	response.end();
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