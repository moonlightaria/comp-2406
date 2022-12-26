//Note that a lot of this code is very similar to the user-router.js file
//This is because many of these operations are, in essense, the same
//We are retrieving a resource, creating/saving a resource, etc.
//As we cover more topics (e.g., databases), this code
//will become simplified. We will have less to do on our own
//This is related to the 'uniform interface' principle - we
//are doing the same types of operations on different resources

const express = require("express");
const faker = require("faker");
let router = express.Router();
let nextProductID = 1000;

//Requests for /products
//Specify three functions to handle in order
router.get("/", queryParser);
router.get("/", loadProducts);
router.get("/", respondProducts);

//You can also specify multiple functions in a row
router.post("/", express.json(), createProduct);

//Requests for a specific product
router.get("/:id", getProduct, sendSingleProduct);
router.put("/:id", express.json(), saveProduct);

//Parse the query parameters
//limit: integer specifying maximum number of results to send back
//page: the page of results to send back (start is (page-1)*limit)
//name: string to find in product name to be considered a match
//minprice: the minimum price to find
//maxprice: the maximum price to find
function queryParser(req, res, next) {
	const MAX_PRODUCTS = 50;

	//build a query string to use for pagination later
	let params = [];
	for (let prop in req.query) {
		if (prop == "page") {
			continue;
		}
		params.push(prop + "=" + req.query[prop]);
	}
	//Add it to the request object so we can access in later middleware
	req.qstring = params.join("&");

	try {
		if (!req.query.limit) {
			req.query.limit = 10;
		}

		req.query.limit = Number(req.query.limit);

		if (req.query.limit > MAX_PRODUCTS) {
			req.query.limit = MAX_PRODUCTS;
		}
	} catch {
		req.query.limit = 10;
	}

	//Parse page parameter
	try {
		if (!req.query.page) {
			req.query.page = 1;
		}

		req.query.page = Number(req.query.page);

		if (req.query.page < 1) {
			req.query.page = 1;
		}
	} catch {
		req.query.page = 1;
	}

	if (req.query.minprice) {
		try {
			req.query.minprice = Number(req.query.minprice);
		} catch (err) {
			req.query.minprice = undefined;
		}
	}

	if (req.query.maxprice) {
		try {
			req.query.maxprice = Number(req.query.maxprice);
		} catch {
			req.query.maxprice = undefined;
		}
	}

	if (!req.query.name) {
		req.query.name = "*";
	}

	next();
}

//Loads a product by ID and adds it to request object
function getProduct(req, res, next) {
	let id = req.params.id;
	if (req.app.locals.products.hasOwnProperty(id)) {
		req.product = req.app.locals.products[id];
		next();
	} else {
		res.status(404).send("Could not find product.");
	}
}

//Saves a product using the request body
//Used for updating products with a PUT request
function saveProduct(req, res, next) {
	let id = req.params.id;
	if (req.app.locals.products.hasOwnProperty(id)) {
		req.app.locals.products[id] = req.body; //Really want to check validity here
		res.status(200).send("Product saved.");
	} else {
		res.status(404).send("Could not find product.");
	}
}

//Helper function for determining whether a product
// matches the query parameters. Compares the name,
// min price, and max price. All must be true.
//Different applications may have different logic
function productMatch(product, query) {
	let nameCheck =
		query.name == "*" ||
		product.name.toLowerCase().includes(query.name.toLowerCase());
	let minPriceCheck = !query.minprice || product.price >= query.minprice;
	let maxPriceCheck = !query.maxprice || product.price <= query.maxprice;
	return nameCheck && minPriceCheck && maxPriceCheck;
}

//Load the correct products into the result object
//Works similar to user router, but has different checks
// for product matching (min price, max price)
function loadProducts(req, res, next) {
	let products = req.app.locals.products;
	let results = [];
	let startIndex = (req.query.page - 1) * Number(req.query.limit);

	let count = 0;

	for (let i = 0; i < Object.keys(products).length; i++) {
		let product = products[Object.keys(products)[i]];
		//If the product matches the query parameters
		if (productMatch(product, req.query)) {
			//Add to results if we are at the correct index
			if (count >= startIndex) {
				results.push(product);
			}

			//Stop if we have the correct number of results
			if (results.length >= req.query.limit) {
				break;
			}

			count++;
		}
	}

	//Set the property to be used in the response
	res.products = results;
	next();
}

//Sends an array of products in response to a request
//Uses the products property added by previous middleware
//Sends either JSON or HTML
function respondProducts(req, res, next) {
	res.format({
		"text/html": () => {
			res.render("pages/products", {
				products: res.products,
				qstring: req.qstring,
				current: req.query.page,
			});
		},
		"application/json": () => {
			res.status(200).json(res.products);
		},
	});
	next();
}

//Create a new random product in response to POST /products
//In a real system, we would likely provide a page
// to specify a new products information
function createProduct(req, res, next) {
	//Generate a random product
	let p = {};
	p.id = nextProductID;
	p.name = faker.commerce.productName();
	p.price = faker.commerce.price();
	p.reviews = [];
	p.buyers = [];

	nextProductID++;
	req.app.locals.products[p.id] = p;
	res.status(201).send(p);
}

//Send representation of a single product
//Sends either JSON or HTML
function sendSingleProduct(req, res, next) {
	if (
		typeof req.session.products === "undefined" ||
		!Array.isArray(req.session.products)
	) {
		req.session.products = [];
	}
	if (!req.session.products.includes(req.product.id)) {
		req.session.products.push(req.product.id);
	}
	console.log(req.product);
	res.format({
		"application/json": function () {
			res.status(200).json(req.product);
		},
		"text/html": () => {
			res.render("pages/product", {
				product: req.product,
				recommended: getRecommended(req.product, req.app.locals),
			});
		},
	});
	next();
}

function getRecommended(currProduct, locals) {
	let array = [];
	for (let i = 0; i < currProduct.buyers.length; i++) {
		let user = currProduct.buyers[i].substring(28);
		user = locals.users[user];
		for (let j = 0; j < user.products.length; j++) {
			let product = user.products[j].substring(31);
			product = locals.products[product];
			if (!array.includes(product) && product != currProduct) {
				array.push(product);
				if (array.length >= 5) return array;
			}
		}
	}
}

//Export the router so it can be mounted in the main app
module.exports = router;
