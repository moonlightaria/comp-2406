const express = require('express');
const path = require('path');
const fs = require("fs");
//Used for generating random data
const faker = require('faker');
let nextUserID = 1000;

//Create the router
let router = express.Router();

//These routes are relative to where the router is mounted
//So this is for requests to /users
//Specify three functions to handle in order
router.get("/", queryParser);
router.get("/", loadUsers);
router.get("/", respondUsers);

//You can also specify multiple functions in a row
//This will use the JSON body parser and then call
// the createUser function
router.post("/", express.json(), createUser);

//Requests for a users's profile
//You can also specify an array of functions
router.get("/:uid", [getUser, sendSingleUser]);
router.put("/:uid", [express.json(), saveUser]);

//Load a user and add a user property to the
// request object based on user ID request parameter
function getUser(req, res, next){
	let users = req.app.locals.users;
	//Get the id parameter
	let id = req.params.uid;

	//If the user profile exists, load it, parse object
	// and add the user property to the request before
	// calling next middleware
	if(users.hasOwnProperty(id)){
		req.user = users[id];
		next();
	}else{
		res.status(404).send("Could not find user.");
	}
}

//Save changes to a user that are given in request body
//More advanced parsing could be done here
//For example, updating only the fields included in body
//We should also perform some data validation here too,
// possibly in a previous middleware
function saveUser(req, res, next){
	let users = req.app.locals.users;
	let id = req.params.uid;

	//Only update the user if there is already a user profile
	// with the specified ID
	if(users.hasOwnProperty(id)){
		users[id] = req.body;//Should check validity of data
		res.status(200).send("User saved.");
	}else{
		res.status(404).send("Could not find user.");
	}
}

//Parse the query parameters
//limit: integer specifying maximum number of results to send back
//page: the page of results to send back (start is (page-1)*limit)
//name: string to find in user names to be considered a match
function queryParser(req, res, next){
	const MAX_USERS = 50;

	//Query string values are strings by default, so we
	// should try to do type conversion here for safety.
	//Whether you send an error for invalid data or
	// use some default value is a design decision

	//If there is no limit parameter, use a default of 10
	if(!req.query.limit){
		req.query.limit = 10;
	}
	//If the limit is larger than we allow, use the max
	if(req.query.limit > MAX_USERS){
		req.query.limit = MAX_USERS;
	}

	//Similar to above but with the page parameter
	if(!req.query.page){
		req.query.page = 1;
	}
	if(req.query.page < 1){
		req.query.page = 1;
	}

	//Example of type conversion
	//Try to convert page parameter to a number
	try{
		req.query.page = Number(req.query.page);
	}catch{
		//Set a default value if parsing fails
		//Could also set to undefined/ignore
		req.query.page = 1;
	}

	//If there is no name parameter, use * as a wildcard
	// character to signify anything should match
	//Could also just check (!req.query.name) later
	if(!req.query.name){
		req.query.name = "*";
	}

	next();
}

//Loads the correct set of users based on the query parameters
//Adds a users property to the response object
//This property is used later to send the response
function loadUsers(req, res, next){
	let users = req.app.locals.users;
	let results = [];
	let startIndex = (req.query.page-1) * Number(req.query.limit);
	let endIndex = startIndex + Number(req.query.limit);
	let countLoaded = 0;
	let failed = false;

	let count = 0;

	for(let i = 0; i < Object.keys(users).length; i++){
		let user = users[Object.keys(users)[i]];

		if(req.query.name == "*" || user.name.toLowerCase().includes(req.query.name.toLowerCase())){
			//Add to results if we are at the correct index
			if(count >= startIndex){
				results.push(user);
			}

			//Stop if we have the correct number of results
			if(results.length >= req.query.limit){
				break;
			}

			count++;
		}
	}

	//Set the property on the result object
	//Call the next middleware
	res.users = results;
	next();
}

//Users the res.users property to send a response
//Sends either HTML or JSON, depending on Accepts header
function respondUsers(req, res, next){
	res.format({
		"text/html": () => {res.status(200).send(createHTML(res.users, req))},
		"application/json": () => {res.status(200).json(res.users)}
	});
	next();
}

//Takes an arary of users and the request object (for the query parameters)
//A template engine is a much better choice
function createHTML(users, req){
	let result = "";

	result += "<html><head><title>User Search Results</title></head>";
	result += "<body>";

	//Make a link for each user
	users.forEach(user => {
		result += `<a href="http://localhost:3000/users/${user.id}">${user.name}</a><br>`;
	});

	//Add next and previous page links
	if(req.query.page > 1){
		result += `<a href="http://localhost:3000/users?page=${req.query.page - 1}&name=${req.query.name}">Previous<a><br>`;
	}
	result += `<a href="http://localhost:3000/users?page=${req.query.page + 1}&name=${req.query.name}">Next<a><br>`;

	result += "</body></html>";
	return result;
}

//Creates a new user with fake details
//In a real system, we could extract the user information
// from the request (e.g., form data or JSON from client-side)
function createUser(req, res, next){
	let users = req.app.locals.users;
	//Create the user
	let u = {};
	u.id = nextUserID;
	u.name = faker.name.firstName() + " " + faker.name.lastName();
	u.address = {address: faker.address.streetAddress(), city: faker.address.city(), state: faker.address.state(), zip: faker.address.zipCode()};
	u.reviews = [];
	u.products = [];

	nextUserID++;
	users[u.id] = u;

	//Respond with the newly created user
	res.status(201).send(u);
}

//Send the representation of a single user that is a property of the request object
//Sends either JSON or HTML, depending on Accepts header
function sendSingleUser(req, res, next){
	res.format({
		"application/json": function(){
			res.status(200).json(req.user);
		},
		"text/html": function(){//Use a template engine!
			let user = req.user;
			let page = `<html><head><title>${user.name}'s Profile</title></head>`;
			page += "<body>";
			page += `Name: ${user.name}<br>`;
			page += `Address: ${user.address.address}, ${user.address.city}, ${user.address.state}, ${user.address.zip}<br>`;
			page += `ID: ${user.id}<br>`;
			page += "<br>Products Bought:<br>";
			//Link for each product
			user.products.forEach(product => {
				page += `<a href="${product}">${product}<a><br>`;
			});
			//Link for each review
			page += "<br>Reviews:<br>";
			user.reviews.forEach(review => {
				page += `<a href="${review}">${review}<a><br>`;
			});
			page += "</body></html>";
			res.status(200).send(page);
		}
	});

	next();
}

//Export the router object, so it can be mounted in the store-server.js file
module.exports = router;
