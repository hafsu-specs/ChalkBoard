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
//TODO: logout so two different sessions cannot be opened at once
app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			//TODO: check if the logged in user is an instructor or student
            if (results.length > 0) {
				request.session.username = username;
                if(results[0].type=="student"){
                    request.session.studentloggedin = true;
                    response.redirect('/StudentHome');
                }
                else if(results[0].type=="instructor"){
                    request.session.instructorloggedin = true;
                    response.redirect('/InstructorHome');
                }
                else if(results[0].type=="admin"){
                    request.session.Adminloggedin = true;
                    listnames[i++]=(request.session.username + ": Admin login successful");
                    response.redirect('/AdminView');
                }
                else {
                    response.send("Only users with student, instructor and Admin accounts are allowed to use this website");
                }
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

//student Sign up only
app.post('/StudentSignUp', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
    var email = request.body.email;
    var type = "student";
	if (username && password && email) {
		connection.query('INSERT INTO accounts (username, password, email, type) VALUES (?, ?, ?, ?)', [username, password, email, type], function(error, results, fields) {
			//TODO: handle if the user already exists
            listnames[i++]=("Student Signup successful!");
            listnames[i++]=("Created a new user: "+username);
			response.redirect('/');	
			response.end();
		});
	} else {
		response.send('User: '+user+" already exists: please login insted");
		response.redirect('/');
	}
});

//instructor signup only
app.post('/InstructorSignUp', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
    var email = request.body.email;
    var type = "instructor";
	if (username && password && email) {
		connection.query('INSERT INTO accounts (username, password, email, type) VALUES (?, ?, ?, ?)', [username, password, email, type], function(error, results, fields) {
			//TODO: handle if the user already exists
            listnames[i++]=("Instructor Signup successful!");
            listnames[i++]=("Created a new user: With username: "+username + "|  Email: "+ email);
			response.redirect('/');	
			response.end();
		});
	} else {
		response.send('User: '+user+" already exists: please login insted");
		response.redirect('/');
	}
});

// *** GET Routes - display pages ***

//landing page
app.get('/', function (req, res) {
    res.render('pages/index');
});

//signup
app.get('/InstructorSignUp', function (req, res) {
    listnames[i] = ("Instructor Signup opened");
    i++;
    res.render('pages/InstructorSignUp');
});
app.get('/StudentSignUp', function (req, res) {
    listnames[i] = ("Student Signup opened");
    i++;
    res.render('pages/StudentSignUp');
});

app.get('/temp', function (req, res) {
    listnames[i] = ("Temporary page with links to all views");
    i++;
    res.render('pages/temp');
});

//only students can access this view
app.get('/StudentProfile', function (request, response) {
    if (request.session.studentloggedin) {
        listnames[i]=(request.session.username + ": student profile");
        i++;
        response.render('pages/StudentProfile', {
            username: request.session.username
        });
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

//only students can access this page
app.get('/StudentHome', function(request, response) {
	if (request.session.studentloggedin) {
         listnames[i]=("Username:"+ request.session.username + "| student logged in");
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

//only instructors can access this page
app.get('/InstructorHome', function(request, response) {
	if (request.session.instructorloggedin) {
         listnames[i]=("Username:"+ request.session.username + "| Instructor logged in");
         i++;
         response.render('pages/InstructorCoursesHomePage');
        return;
	} else {
         listnames[i]=("instructor access denied: please login");
         i++;
         response.redirect('/');
	}
	response.end();
});

app.get('/InstructorProfile', function (request, response) {
    if (request.session.instructorloggedin) {
        listnames[i]=("Username:"+ request.session.username + "| Instructor profile");
        i++;
        response.render('pages/Profile', {
            username: request.session.username
        });
       return;
   } else {
        listnames[i]=("Instructor access denied: please login");
        i++;
        response.redirect('/');
   }
   response.end();
});

//TODO: think how to fix - everytime a new activity happens we have to reload the admin page 
//which means that the admin logged in will appear every time we reload the admin page
app.get('/AdminView', function(request, response) {
	if (request.session.Adminloggedin) {
         response.render('pages/AdminView', {
            // EJS variable and server-side variable
            listnames: listnames,
            i: "#"
        });
        return;
	} else {
         listnames[i++]=("Admin access denied: please login");
         response.redirect('/');
	}
	response.end();
});

//logout
// DELETE /api/auth/logout
// router.delete('/logout', (req, res) => {
//     if (req.session) {
//       req.session.destroy(err => {
//         if (err) {
//           res.status(400).send('Unable to log out')
//         } else {
//           res.send('Logout successful')
//         }
//       });
//     } else {
//       res.end()
//     }
//   })