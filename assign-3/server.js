//dependencies
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
let app = express();

//init vendors and id
const vendors = fs
	.readdirSync(path.resolve(__dirname, "./vendors"))
	.filter((file) => path.extname(file) == ".json")
	.map((file) =>
		JSON.parse(fs.readFileSync(path.resolve(__dirname, "./vendors", file)))
	);
let id = 0;

//sets middleware and view engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/", express.static(path.join(__dirname, "public")));

//sends welcome page
app.route("/").get(function (req, res) {
	res.render("index.pug");
});

app
	.route("/vendors")
	.get(function (req, res) {
		//sends data based on request accept header
		res.format({
			"text/html": function () {
				res.render("vendors.pug", { data: vendors });
			},
			"application/json": function () {
				let arr = vendors.map((data) => data.id);
				res.send({ vendors: arr });
			},
			default: function () {
				res.status(406).send("not valid content type");
			},
		});
	})
	.post(function (req, res) {
		//checks if valid format
		if (
			req.body.name == undefined ||
			isNaN(req.body.min_order) ||
			isNaN(req.body.delivery_fee)
		) {
			res.status(400).send();
		} else {
			//creates new vendor, pushes it onto array and sends it back to user
			setId();
			let temp = {
				id: id,
				name: req.body.name,
				min_order: req.body.min_order,
				delivery_fee: req.body.delivery_fee,
				supplies: {},
			};
			vendors.push(temp);
			res.send(JSON.stringify(temp));
		}
	});

app
	.route("/vendors/:vendorID")
	.get(function (req, res) {
		//validates url
		if (isNaN(req.params.vendorID)) {
			res.status(404).send();
		} else if (getVendorIndex(req.params.vendorID) < 0) {
			res.status(404).send();
		} else {
			//returns data based on accept headers
			res.format({
				html: function () {
					res.render("vendor.pug", {
						data: vendors[getVendorIndex(req.params.vendorID)],
					});
				},
				json: function () {
					res.send(
						JSON.stringify(vendors[getVendorIndex(req.params.vendorID)])
					);
				},
				default: function () {
					res.status(406).send("not valid content type");
				},
			});
		}
	})
	.put(function (req, res) {
		//checks if vendor exits
		if (getVendorIndex(req.params.vendorID) < 0) {
			res.status(404).send();
		} else {
			//updates vendor
			vendors[getVendorIndex(req.params.vendorID)] = req.body;
			res.send();
		}
	});

//sends the add page
app.route("/addvendor").get(function (req, res) {
	res.render("add.pug");
});

app.listen(3000);

//returns the index of a vender if an id
function getVendorIndex(id) {
	return vendors.findIndex((e) => e.id == id);
}
//searches for next free id
function setId() {
	while (getVendorIndex(id) < 0) {
		id++;
	}
}
