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
var metadata = []

//When the client enters their details in the login form and clicks the submit button, the form data will be sent to the server
// and with that data our login script will check in our MySQL accounts table to see if the details are correct
//TODO: logout so two different sessions cannot be opened at once
app.post('/auth', function(request, response) {
	var username = request.body.email;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE email = ? AND password = ?', [username, password], function(error, results, fields) {
			//TODO: check if the logged in user is an instructor or student
            if (results.length > 0) {
				request.session.email = username;
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
                    listnames[i++]=(request.session.email + ": Admin login successful");
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
		response.send('Please enter a valid Username and Password!');
		response.end();
	}
});

//student Sign up only
app.post('/StudentSignUp', function(request, response) {
	var username = request.body.email;
	var password = request.body.password;
    var FirstName = request.body.FirstName;
	var LastName = request.body.LastName;
    var type = "student";
	if (username && password && FirstName, LastName) {
		connection.query('INSERT INTO accounts (password, email, FirstName, LastName, type) VALUES (?, ?, ?, ?, ?)', [password, username,FirstName, LastName, type], function(error, results, fields) {
			//TODO: handle if the user already exists
            listnames[i++]=("Student Signup successful!");
            listnames[i++]=("Created a new user: "+username);
			response.redirect('/');	
			response.end();
		});
	} else {
		response.send('User: '+username+" already exists: please login insted");
		response.redirect('/');
	}
});

//student Logout
app.post('/studentlogout', function(request, response) {
    request.session.studentloggedin = false;
    response.redirect('/');	
});

//instcutor Logout
app.post('/instructorlogout', function(request, response) {
    request.session.instructorloggedin = false;
    response.redirect('/');	
});

//admin logout
app.post('/adminlogout', function(request, response) {
    request.session.Adminloggedin = false;
    response.redirect('/');	
});



//instructor signup only
app.post('/InstructorSignUp', function(request, response) {
    var username = request.body.email;
	var password = request.body.password;
    var FirstName = request.body.FirstName;
	var LastName = request.body.LastName;
    var type = "instructor";
	if (username && password && FirstName, LastName) {
		connection.query('INSERT INTO accounts (password, email, FirstName, LastName, type) VALUES (?, ?, ?, ?, ?)', [password, username,FirstName, LastName, type], function(error, results, fields) {
			//TODO: handle if the user already exists
            listnames[i++]=("Instructor Signup successful!");
            listnames[i++]=("Created a new user: "+username);
			response.redirect('/');	
			response.end();
		});
	} else {
		response.send('User: '+username+" already exists: please login insted");
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
        listnames[i]=(request.session.email + ": student profile");
        i++;
        response.render('pages/StudentProfile', {
            username: request.session.email
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
         listnames[i]=("Username:"+ request.session.email + " | student logged in");
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

//only students should have access to the following pages
app.get('/GeometryCourse', function(request, response) {
    if (request.session.studentloggedin) {
        listnames[i]=("Username:"+ request.session.email + " | student opened Geometry Course");
        i++;
        response.render('pages/GeometryCourse');
        return;
    } else {
        listnames[i]=("student access denied: please login");
        i++;
        response.redirect('/');
    }
    response.end();
});
app.get('/GeologyCourse', function(request, response) {
    if (request.session.studentloggedin) {
        listnames[i]=("Username:"+ request.session.email + " | student opened Geology Course");
        i++;
        response.render('pages/GeologyCourse');
        return;
    } else {
        listnames[i]=("student access denied: please login");
        i++;
        response.redirect('/');
    }
    response.end();
});
app.get('/GeographyCourse', function(request, response) {
    if (request.session.studentloggedin) {
        listnames[i]=("Username:"+ request.session.email + " | student opened Geography Course");
        i++;
        response.render('pages/GeographyCourse');
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
         listnames[i]=("Username:"+ request.session.email + " | Instructor logged in");
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
//only Instructors should have access to the following pages
app.get('/InstructorGeography', function(request, response) {
    if (request.session.instructorloggedin) {
        listnames[i]=("Username:"+ request.session.email + " | Instructor opened Geography Course");
        i++;
        response.render('pages/GeographyCourse');
        return;
    } else {
        listnames[i]=("Instructor access denied: please login");
        i++;
        response.redirect('/');
    }
    response.end();
});
app.get('/InstructorGeology', function(request, response) {
    if (request.session.instructorloggedin) {
        listnames[i]=("Username:"+ request.session.email + " | Instructor opened Geology Course");
        i++;
        response.render('pages/GeologyCourse');
        return;
    } else {
        listnames[i]=("Instructor access denied: please login");
        i++;
        response.redirect('/');
    }
    response.end();
});
app.get('/InstructorGeometry', function(request, response) {
    if (request.session.instructorloggedin) {
        listnames[i]=("Username:"+ request.session.email + " | Instructor opened Geometry Course");
        i++;
        response.render('pages/InstructorGeometry');
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
    connection.query("SELECT * FROM accounts", function (err, result, fields) {
        if (err) throw err;
        metadata = result
    });
	if (request.session.Adminloggedin) {
         response.render('pages/AdminView', {
            // EJS variable and server-side variable
            metadata: metadata,
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