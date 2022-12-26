//Create express app
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
let app = express();

//Database variables
let mongo = require("mongodb");
let MongoClient = mongo.MongoClient;
let db;

//View engine
app.set("view engine", "pug");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Set up the routes
app.set("views", path.join(__dirname, "views"));

app.get("/", sendIndex);
app.get("/cards", sendCards);
app.get("/cards/:cardID", sendCard);

// Initialize database connection
MongoClient.connect(
	"mongodb://127.0.0.1:27017/",
	{ useNewUrlParser: true },
	function (err, client) {
		if (err) throw err;

		//Get the t8 database
		db = client.db("t8");

		// Start server once Mongo is initialized
		app.listen(3000);
		console.log("Listening on port 3000");
	}
);

async function sendIndex(req, res) {
	res.render("index", {
		data: {
			class: await db.collection("cards").distinct("cardClass"),
			rarity: await db.collection("cards").distinct("rarity"),
		},
	});
}

async function sendCards(req, res) {
	let query = {};
	let attack = {};
	let health = {};
	//checks for properties and if they exists adds them to the query
	if (req.query.artist !== "")
		query.artist = { $regex: `.*${req.query.artist}.*` };
	if (req.query.name !== "") query.name = { $regex: `.*${req.query.name}.*` };
	if (req.query.class !== "") query.cardClass = req.query.class;
	if (req.query.rarity !== "") query.rarity = req.query.rarity;
	if (req.query.minAttack !== "") attack.$gte = Number(req.query.minAttack);
	if (req.query.maxAttack !== "") attack.$lte = Number(req.query.maxAttack);
	if (req.query.minHealth !== "") health.$gte = Number(req.query.minHealth);
	if (req.query.maxHealth !== "") health.$lte = Number(req.query.maxHealth);
	if (!isEmpty(attack)) query.attack = attack;
	if (!isEmpty(health)) query.health = health;
	let cards = await db.collection("cards").find(query).toArray();
	res.render("cards", { cards: cards });
}

function sendCard(req, res) {
	let oid;
	try {
		oid = new mongo.ObjectId(req.params.cardID);
	} catch {
		res.status(404).send("Unknown ID");
		return;
	}

	db.collection("cards").findOne({ _id: oid }, function (err, result) {
		if (err) {
			res.status(500).send("Error reading database.");
			return;
		}
		if (!result) {
			res.status(404).send("Unknown ID");
			return;
		}
		res.status(200).render("card", result);
	});
}
//why does this not already exist
function isEmpty(obj) {
	return Object.keys(obj).length === 0;
}
