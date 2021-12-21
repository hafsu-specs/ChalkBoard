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
var metadata = [];
var instructorcourses = [];

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
		response.send('User: '+username+" already exists: please login instead");
		response.redirect('/');
	}
});

//creating courses
//instructor only
app.post('/CreateCourse', function(request, response) {
	var name = request.body.courseName;
	var description = request.body.description;
    var materials = request.body.materials;
	var semester = request.body.semester;
    var Instructorid;

	if (name && description && materials) {
        connection.query("SELECT id FROM accounts where type = ? AND email = ?",['instructor', request.session.email], function (err, result, fields) {
            if (err) throw err;
            Instructorid = result[0].id;
           
            connection.query('INSERT INTO allcourses (instructorid, coursename, description, coursematerials,  semester) VALUES (?, ?, ?, ?, ?)', 
            [Instructorid, name, description, semester, materials], function(error, results, fields) {
            console.log(" "+fields);
			//TODO: handle if the user already exists
            listnames[i++]=("course created! "+name);
			response.redirect('/InstructorHome');	
			response.end();
		});
        });
		
        listnames[i++]="course added by instructor: "+Instructorid;
        listnames[i++] = "name: "+name;
        listnames[i++] = "description: "+description;
        listnames[i++] = "semester: "+semester;
	} else {
		response.send('User: '+username+" course not created");
		response.redirect('/CreateCourses');
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

//search api


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
app.get('/Profile', function (request, response) {
    if (request.session.studentloggedin) {
        listnames[i]=(request.session.email + ": opened student profile");
        i++;
        response.render('pages/Profile', {
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
    var instructorid;
    
    if (request.session.instructorloggedin) {
        connection.query("SELECT id FROM accounts where type = ? AND email = ?",['instructor', request.session.email], function (err, result, fields) {
            if (err) throw err;
            instructorid = result[0].id;
            console.log(instructorid);
            connection.query("SELECT * FROM allcourses where instructorid = ?",[instructorid], function (err, result, fields) {
                if (err) throw err;
                instructorcourses = result;
            });
        });

        listnames[i]=("Username:"+ request.session.email + " | Instructor logged in");
         i++;
        response.render('pages/InstructorCoursesHomePage', {
           // EJS variable and server-side variable
           instructorcourses: instructorcourses
       });
       return; 
   } else {
         listnames[i]=("instructor access denied: please login");
         i++;
         response.redirect('/');
	}
	response.end();
});

app.get('/studentRoster', function(request, response) {
    if (request.session.instructorloggedin) {
        listnames[i]=("Username:"+ request.session.email + " | Instructor is viewing Roster");
        i++;
        response.render('pages/studentRoster');
        return;
    } else {
        listnames[i]=("instructor access denied: please login");
        i++;
        response.redirect('/');
    }
    response.end();
});
app.get('/SearchResults', function(request, response) {
    if (request.session.instructorloggedin) {
        listnames[i]=("Username:"+ request.session.email + " | Instructor is viewing Search results");
        i++;
        response.render('pages/InstructorSearch');
        return;
    } else {
        listnames[i]=("instructor access denied: please login");
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
        response.render('pages/InstructorGeography');
        return;
    } else {
        listnames[i]=("Instructor access denied: please login");
        i++;
        response.redirect('/');
    }
    response.end();
});

//the following requests are for htmls that we plan to turn into ejs
//  this comment will be deleted once task is complete
app.get('/CreateCourse', function(request, response) {
    if (request.session.instructorloggedin) {
        listnames[i]=("Username:"+ request.session.email + " | Instructor Opened Create Course");
        i++;
        response.render('pages/CreateCourse');
        return;
    } else {
        listnames[i]=("Instructor access denied: please login");
        i++;
        response.redirect('/');
    }
    response.end();
});
app.get('/DropCourse', function(request, response) {
    if (request.session.instructorloggedin) {
        listnames[i]=("Username:"+ request.session.email + " | Instructor Opened Drop Course View");
        i++;
        response.render('pages/DropCourse');
        return;
    } else {
        listnames[i]=("Instructor access denied: please login");
        i++;
        response.redirect('/');
    }
    response.end();
});

app.get('/StudentEnrollment', function(request, response) {
    if (request.session.studentloggedin) {
        listnames[i]=("Username:"+ request.session.email + " | Student Opened Enrollment Page");
        i++;
        response.render("pages/StudentEnrollment");
        return;
    } else {
        listnames[i]=("Student access denied: please login");
        i++;
        response.redirect('/');
    }
    response.end();
});
//For redirection to creating/grading tests from all geo courses:
app.get('/InstructorCreatingTest', function(request, response) {
    if (request.session.instructorloggedin) {
        listnames[i]=("Username:"+ request.session.email + " | Instructor Opened Test Create Mode");
        i++;
        response.render("pages/InstructorCreatingTest");
        return;
    } else {
        listnames[i]=("Instructor access denied: please login");
        i++;
        response.redirect('/');
    }
    response.end();
});
app.get('/InstructorGradingTest', function(request, response) {
    if (request.session.instructorloggedin) {
        listnames[i]=("Username:"+ request.session.email + " | Instructor Opened Test Grade Mode");
        i++;
        response.render("pages/InstructorGradingTest");
        return;
    } else {
        listnames[i]=("Instructor access denied: please login");
        i++;
        response.redirect('/');
    }
    response.end();
});

//Student Test taking, drafts, and results redirection
app.get('/StudentTestTaking', function(request, response) {
    if (request.session.studentloggedin) {
        listnames[i]=("Username:"+ request.session.email + " | Student Opened Test Taking Page");
        i++;
        response.render("pages/StudentTestTaking");
        return;
    } else {
        listnames[i]=("Student access denied: please login");
        i++;
        response.redirect('/');
    }
    response.end();
});

app.get('/StudentTestResults', function(request, response) {
    if (request.session.studentloggedin) {
        listnames[i]=("Username:"+ request.session.email + " | Student Opened Test Results");
        i++;
        response.render("pages/StudentTestResults");
        return;
    } else {
        listnames[i]=("Student access denied: please login");
        i++;
        response.redirect('/');
    }
    response.end();
});

app.get('/StudentTestDraft', function(request, response) {
    if (request.session.studentloggedin) {
        listnames[i]=("Username:"+ request.session.email + " | Student Opened Test Draft");
        i++;
        response.render("pages/StudentTestDraft");
        return;
    } else {
        listnames[i]=("Student access denied: please login");
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