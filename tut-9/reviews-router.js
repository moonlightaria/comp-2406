//Required modules
const express = require('express');
const path = require('path');
const fs = require("fs");
const faker = require('faker'); //For generating random data

//Create the router
let router = express.Router();
let nextReviewID = 1000;

//Requests for /reviews
//Specify three functions to handle in order
router.get("/", queryParser); //Parse the query parameters
router.get("/", loadReviews); //Load matching reviews
router.get("/", respondReviews); //Send the response

//You can also specify multiple functions in a row
router.post("/", express.json(), createReview); //Parse the body, then create a random review

//Requests for a review (/reviews/someID)
router.get("/:id", getReview, sendSingleReview);
router.put("/:id", express.json(), saveReview);

//Parses the query parameters. Possible parameters:
//limit: integer specifying maximum number of results to send back
//page: the page of results to send back (start is (page-1)*limit)
function queryParser(req, res, next){
	const MAX_REVIEWS = 50;

	if(!req.query.limit){
		req.query.limit = 10;
	}
	if(req.query.limit > MAX_REVIEWS){
		req.query.limit = MAX_REVIEWS;
	}

	if(!req.query.page){
		req.query.page = 1;
	}
	if(req.query.page < 1){
		req.query.page = 1;
	}

	try{
		req.query.page = Number(req.query.page);
	}catch{
		req.query.page = 1;
	}

	next();
}

//Read a single review's data and saves into
// review property of request
//Assumes there is an 'id' parameter in the request
function getReview(req, res, next){
	let reviews = req.app.locals.reviews;
	let id = req.params.id;
	if(reviews.hasOwnProperty(id)){
		req.review = reviews[id];
		next();
	}else{
		res.status(404).send("Could not find user.");
	}
}

//Saves a changed review to the file system
//Assumes there is an ID parameter
function saveReview(req, res, next){
	let reviews = req.app.locals.reviews;
	let id = req.params.id;
	if(reviews.hasOwnProperty(id)){
		reviews[id] = req.body; //Should check validity of data
		res.status(200).send("Review saved.");
	}else{
		res.status(404).send("Could not find review.");
	}
}

//Loads correct reviews and creates a reviews property in response object
//Users specified query parmeters to get the correct amount
function loadReviews(req, res, next){
	let reviews = req.app.locals.reviews;
	let results = [];
	let startIndex = (req.query.page-1) * Number(req.query.limit);
	let endIndex = startIndex + Number(req.query.limit);
	let countLoaded = 0;

	let count = 0;

	for(let i = 0; i < Object.keys(reviews).length; i++){
		let review = reviews[Object.keys(reviews)[i]];
		//Add to results if we are at the correct index
		if(count >= startIndex){
			results.push(review);
		}

		//Stop if we have the correct number of results
		if(results.length >= req.query.limit){
			break;
		}

		count++;
	}

	//Update the response object
	res.reviews = results;
	next();
}

//Sends loaded reviews in response
//Sends either JSON or HTML, depending on Accepts header
function respondReviews(req, res, next){
	res.format({
		"text/html": () => {res.status(200).send(createHTML(res.reviews, req))},
		"application/json": () => {res.status(200).json(res.reviews)}
	});
	next();
}

//Creates HTML list of reviews for response
//A template engine would be a much better choice
function createHTML(reviews, req){
	let result = "";

	result += "<html><head><title>Reviews</title></head>";
	result += "<body>";

	//For each review in result, add a link and summary text
	reviews.forEach(review => {
		result += `<a href="http://localhost:3000/reviews/${review.id}">${review.rating} Stars: ${review.summary}</a><br><br>`;
	});

	//Build and include next/previous links
	if(req.query.page > 1){
		let nextLink = `http://localhost:3000/reviews?page=${req.query.page - 1}`;


		result += `<a href="${nextLink}">Previous<a><br>`;
	}

	let params = [`page=${req.query.page + 1}`];
	for(prop in req.query){
		if(prop == "page"){
			continue;
		}
		params.push(prop + "=" + req.query[prop]);
	}
	let queryString = params.join("&");

	result += `<a href="http://localhost:3000/reviews?${queryString}">Next<a><br>`;

	result += "</body></html>";
	return result;
}

//Creates a new review in response to POST request to /reviews
//Here, random data is inserted other than reviewer/product
//A real system would likely have most of the data specified
function createReview(req, res, next){
	let reviews = req.app.locals.reviews;
	let r = {};
	r.id = nextReviewID;
	r.reviewer = req.body.reviewer;
	r.product = req.body.product;
	r.rating = Math.floor(Math.random()*5) + 1;
	r.summary = faker.lorem.sentence();
	r.review = faker.lorem.paragraph();

	nextReviewID++;
	reviews[r.id] = r;
	res.status(201).send(r);
}

//Create response for a single review (/reviews/:id)
//Sends either JSON or HTML
function sendSingleReview(req, res, next){
	res.format({
		"application/json": function(){
			res.status(200).json(req.review);
		},
		"text/html": function(){ //Use a template engine instead of this approach
			let review = req.review;
			let page = `<html><head><title>Review Summary</title></head>`;
			page += "<body>";
			page += `Reviewer: <a href="${review.reviewer}">${review.reviewer}</a><br>`;
			page += `Product: <a href="${review.product}">${review.product}</a><br>`;
			page += `Rating: ${review.rating}<br>`;
			page += `Summary: ${review.summary}<br>`;
			page += `review: ${review.review}<br>`;
			page += "</body></html>";
			res.status(200).send(page);
		}
	});

	next();
}

//Export the router object so we can access it in the base app
module.exports = router;
