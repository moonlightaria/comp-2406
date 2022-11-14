/*
Card source: https://api.hearthstonejson.com/v1/25770/enUS/cards.json

Each card is a JS object
All have:
	id - string uniquely identifies the card
	artist - string indicating the name of the artist for the cards image
	cardClass - string indicating the class of the card
	set  - string indicating the set the card is from
	type - string indicating the type of the card
	text - string indicating card text
Some have:
	rarity - string indicating the rarity of the card
	mechanics - array of string indicating special mechanics
	
Routes:
	/cards - search all cards (query params: class, set, type, artist)
	/cards/:cardID - specific card with ID=:cardID
*/

const http = require('http');
const pug = require('pug');
const qs = require('node:querystring');
const path = require('path');

//Set up the required data
let cardData = require("./cards.json");
let cards = {}; //Stores all of the cards, key=id
cardData.forEach(card => {
	cards[card.id] = card;
});

//Initialize server
const server = http.createServer(function (req, res) {
	console.log(req.url);
	if (req.method === "GET"){
		if (req.url.startsWith("/cards/")){
			let id = decodeURI(req.url.slice(7));
			let file = pug.renderFile(path.resolve(__dirname, "card.pug"),{"card": cards[id]});
			send200("text/html", file, res);
		}else if (req.url.startsWith("/cards?")){
			let params = qs.parse(req.url.slice(7));
			let file = pug.renderFile(path.resolve(__dirname, "cards.pug"),{"cards": getQuery(cards, params)});
			send200("text/html", file, res);	
		}else if (req.url.startsWith("/cards")){
			let file = pug.renderFile(path.resolve(__dirname, "cards.pug"), {"cards": getQuery(cards, {})});
			send200("text/html", file, res);
		}else{
			res.statusCode = 404;
			res.write("Unknwn resource.");
			res.end();
		}
	}else{
		res.statusCode = 404;
		res.write("Unknwn resource.");
		res.end();
	}
});

//Start server
server.listen(3000);
console.log("Server listening at http://localhost:3000");

//Helper functions to send 200 sucess (lazy work around to finding out theres no overloading in js)
function send200(type, data, res){
	res.statusCode = 200;
	res.setHeader("Content-Type", type);
	res.write(data);
	res.end();
}
function getQuery(cards, params){
	if (Object.keys(params).length === 0){
		return cards;
	}
	let filtered = Object.entries(cards);
	if (params.name !== undefined){
		filtered = filtered.filter(([key, value]) => value.name.includes(params.name));
	}
	if (params.class !== undefined){
		filtered = filtered.filter(([key, value]) => value.cardClass === params.class);
	}
	if (params.limit !== undefined){
		if (!isNaN(params.limit)){
			filtered.length = (filtered.length < Number(params.limit)) ? filtered.length : Number(params.limit);
		}
	}
	return Object.fromEntries(filtered);
}