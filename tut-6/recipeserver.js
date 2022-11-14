//Database to store all recipe data
//This will give you 3 recipes to start with
let database = {
	"0":{
		"ingredients":
		[
			{"name":"Crab","unit":"Tsp","amount":3},
			{"name":"Peas","unit":"Cup","amount":12},
			{"name":"Basil","unit":"Tbsp","amount":10},
			{"name":"Cumin","unit":"Liter","amount":3},
			{"name":"Salt","unit":"Tbsp","amount":1}
		],

		"name":"Boiled Crab with Peas",
		"preptime":"13",
		"cooktime":"78",
		"description":"A boring recipe using Crab and Peas",
		"id":"0"
	},
	"1":{
		"ingredients":
		[
			{"name":"Peanuts","unit":"Liter","amount":10},
			{"name":"Artichoke","unit":"Tsp","amount":3},
			{"name":"Basil","unit":"Cup","amount":11},
			{"name":"Sage","unit":"Grams","amount":13},
			{"name":"Pepper","unit":"Cup","amount":1}
		],

		"name":"Boiled Peanuts with Artichoke",
		"preptime":"73",
		"cooktime":"74",
		"description":"A exciting recipe using Peanuts and Artichoke",
		"id":"1"
	},
	"2":{
		"ingredients":
		[
			{"name":"Lobster","unit":"Tsp","amount":14},
			{"name":"Brussel Sprouts","unit":"Liter","amount":14},
			{"name":"Sage","unit":"Tbsp","amount":3},
			{"name":"Thyme","unit":"Tbsp","amount":12},
			{"name":"Pepper","unit":"Tsp","amount":10},
			{"name":"Cumin","unit":"Tbsp","amount":11}
		],

		"name":"Spicy Lobster with Brussel Sprouts",
		"preptime":"86",
		"cooktime":"19",
		"description":"A tasty recipe using Lobster and Brussel Sprouts",
		"id":"2"
	}
};

let currId = 3;

const express = require('express');
const morgan = require("morgan");
const path = require("path");
let app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, 'views'));
// Show HTTP requests in the console
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/', express.static(path.join(__dirname, 'public')));

//Start adding route handlers here
app.route('/recipes') //the resource
.get(function (req, res) { //handle GET requests
	res.render('recipies.pug', {data: database});
})
.post(function (req, res) { //handle POST requests
	req.body.id = currId;
	database[currId] = req.body;
	currId++;
	res.send();
});

app.route(`/recipies/:id`).get(function (req, res){
	if (database[req.params.id] != undefined){
		res.render('recipe.pug', {data: database[req.params.id]});
	}else{
		res.status(404).send('recipe not in system');
	}
});

app.use(function (req,res,next){
	res.status(404).send('resouce not found');
});


app.listen(3000);
console.log("Server listening at http://localhost:3000");
