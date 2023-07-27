const express = require('express');
const app = express();
const PORT = 5152;
const path = require('path');
const hbs = require('hbs');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');

const con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "student"
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true,
	cookie: { maxAge: 600000 }
}));
app.use(express.json());


const staticpath = path.join(__dirname, '../public');
app.use(express.static(staticpath));//built in middleware//use to serve style file and others
//use template folder//use views engine
const tempaltePath = path.join(__dirname, '../templates/views');//change views folder to template
const partialsPath = path.join(__dirname, '../templates/partials');//partials path

app.set("view engine", "hbs");
app.set('views', tempaltePath); //change views folder
hbs.registerPartials(partialsPath);//register partial

app.get('/', (req, res) => {
	res.render('login');

});

app.post('/', (req, res) => {
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	console.log(`value : ${email}`);

	con.connect(function (err) {
		if (err) throw err;
		console.log('connected');
		var sql = "INSERT INTO user (name, email , password) VALUES (?)";
		var values = [name, email, password];
		con.query(sql, [values], function (err, result) {
			if (err) throw err;
			console.log("Number of records inserted: " + result.affectedRows);
			con.end();
		});
	});
	res.send("Registation Sucessfully");
});

app.post('/auth', function (request, response) {
	// Capture the input fields
	let email = request.body.email;
	let password = request.body.password;
	// Ensure the input fields exists and are not empty
	if (email && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		con.query('SELECT * FROM user WHERE email = ? AND password = ?', [email, password], function (error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.email = email;
				//request.session.password = password;
				// Redirect to home page
				response.redirect('/dashboard');
			} else {
				response.send('Incorrect Email and/or Password!');
			}
			response.end();
		});
	} else {
		response.send('Please enter Email and Password!');
		response.end();
	}
});

// http://localhost:3000/home
app.get('/home', function (request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
		response.send('Welcome back, ' + request.session.email + '!');
	} else {
		// Not logged in
		//response.send('Please login to view this page!');
		response.redirect('/');
	}
	response.end();
});

app.get('/newadmission', (req, res) => {
	if (req.session.loggedin) {
		res.render('newadmission', {
			email: `${req.session.email}`
		});
	}
	else {
		res.redirect('/');
	}
});

app.get('/dashboard', function (req, res) {
	if (req.session.loggedin) {
		res.render('dashboard', {
			email: `${req.session.email}`
		});
	}
	else {
		res.redirect('/');
	}
});

app.get('/events', (req, res) => {
	if (req.session.loggedin) {
		res.render('events', {
			email: `${req.session.email}`
		});
	}
	else {
		res.redirect('/');
	}
});

app.get('/users', (req, res) => {
	if (req.session.loggedin) {
		res.render('users', {
			email: `${req.session.email}`
		});
	}
	else {
		res.redirect('/');
	}
});

app.get('/logouts', (req, res) => {
	if (req.session.loggedin) {
		res.render('logout', {
			email: `${req.session.email}`
		});
	}
	else {
		res.redirect('/');
	}
});

app.get('/csd', (req, res) => {
	if (req.session.loggedin) {
		res.render('csd', {
			email: `${req.session.email}`
		});
	}
	else {
		res.redirect('/');
	}
});

app.get('/account', (req, res) => {
	if (req.session.loggedin) {
		res.render('account', {
			email: `${req.session.email}`
		});
	}
	else {
		res.redirect('/');
	}
});

app.get('/pfee', (req, res) => {
	if (req.session.loggedin) {
		res.render('pfee', {
			email: `${req.session.email}`
		});
	}
	else {
		res.redirect('/');
	}
});

app.get('/cresult', (req, res) => {
	if (req.session.loggedin) {
		res.render('cresult', {
			email: `${req.session.email}`
		});
	}
	else {
		res.redirect('/');
	}
});

app.post('/logout', (req, res) => {
	req.session.destroy(function () {
		console.log("user logged out.")
	});
	res.redirect('/');
});

app.post('/newadmission', function (req, res) {
	var sname = req.body.sname;
	var fname = req.body.fname;
	var mname = req.body.mname;
	var mobile = req.body.mobile;
	var classname = req.body.cname;
	var cname = classname.toUpperCase();
	var fee = req.body.fee;
	console.log(cname);


	var sql1 = "INSERT INTO student (sname, fname, mname , mobile , cname , fee , pfee) VALUES (?)";
	var values1 = [sname, fname, mname, mobile, cname, fee , fee];
	con.query(sql1, [values1], function (err, result) {
		if (err) throw err;
		console.log("Number of records inserted: " + result.affectedRows);
	});
	res.send("Admission Sucessfully");
});

app.post('/csd', function (req, res , next) {
	var classname = req.body.cname;
	var cname = classname.toUpperCase();
	var sql2 = "SELECT * FROM student WHERE cname = (?)";
	var values2 = [cname];
	con.query(sql2, [values2], function (err, data) {
		//console.log(data);
		if(err) throw err;
		res.render('csd' , {data});
	})

});

app.post('/account', function (req, res , next) {
	var classname = req.body.cname;
	var cname = classname.toUpperCase();
	var sql3 = "SELECT * FROM student WHERE cname = (?)";
	var values3 = [cname];
	con.query(sql3, [values3], function (err, data) {
		//console.log(data);
		if(err) throw err;
		res.render('account' , {data});
	})

});

app.post('/pay' , function (req , res){
	var sname=req.body.sname;
	var fname = req.body.fname;
	var cname = req.body.cname;
	var fee = req.body.fee;
})

app.listen(PORT, (error) => {
	console.log(`Server is runnin on port : ${PORT}`);
})