const http = require('http');
const fs = require('fs');
const path = require('path');
const pug = require('pug');

const vendorDir = "./vendors/";
const pugDir = "./pug";
const hostname = '127.0.0.1';
const port = 3000;

const vendors = fs.readdirSync(path.resolve(__dirname, vendorDir)).filter((file) => path.extname(file) == ".json")
	.map((file) => JSON.parse(fs.readFileSync(path.resolve(__dirname, vendorDir, file))));
//init sale data for each vendor
let saleData = {};
vendors.forEach(vendor => {
	saleData[vendor.name] = {
		sales: 0,
		total: 0,
		products: [],
		popular :{
			name: "NONE",
			quantity: -1,
		},
	};
});

const server = http.createServer((req, res) => {
	console.log(req.url);
	//send requested html files
	if (req.method === "GET") {
		if (req.url === "/" || req.url === "/index.html") {
			let file = pug.renderFile(path.resolve(__dirname, pugDir, "home.pug"), {});
			send200("text/html", file, res);
		} else if (req.url === "/order") {
			let file = pug.renderFile(path.resolve(__dirname, pugDir, "order.pug"), {});
			send200("text/html", file, res);
		} else if (req.url === "/stats") {
			console.log(saleData);
			let file = pug.renderFile(path.resolve(__dirname, pugDir, "stats.pug"), {vendors: saleData});
			send200("text/html", file, res);
		//send css file
		} else if (req.url === "/styles.css") {
			fs.readFile(path.resolve(__dirname, "styles.css"), function (err, data) {
				if (err)
					send500(res);
				else
					send200("text/css", data, res);
			});
		//send js file
		} else if (req.url === "/client.js") {
			fs.readFile(path.resolve(__dirname, "client.js"), function (err, data) {
				if (err)
					send500(res);
				else
					send200("application/javascript", data, res);
			});
		//send vendor names
		} else if (req.url === "/vendors") {
			let data = vendors.map((vendor) => vendor.name);
			send200("text/plain", JSON.stringify(data), res);
		//send a requested vendor
		} else if (req.url.startsWith("/vendors/")) {
			let name = decodeURI(req.url.slice(9));
			let data = getVendor(vendors, name);
			send200("text/plain", JSON.stringify(data), res);
		//send images
		} else if (req.url === "/add.png") {
			fs.readFile(path.resolve(__dirname, "add.png"), function (err, data) {
				if (err)
					send500(res);
				else
					send200("image/png", data, res);
			});
		} else if (req.url === "/remove.png") {
			fs.readFile(path.resolve(__dirname, "remove.png"), function (err, data) {
				if (err)
					send500(res);
				else
					send200("image/png", data, res);
			});
		//resourse not found error
		} else {
			send404(res);
		}
	} else if (req.method === "POST") {
		//process a sale
		if (req.url === "/sale") {
			let body = "";
			req.on('data', (chunk) => {
				body += chunk;
			});
			req.on('end', () => {
				addSaleData(JSON.parse(body));
				send200Empty(res);
			});
		//process a new product
		} else if (req.url === "/product") {
			let body = "";
			req.on('data', (chunk) => {
				body += chunk;
			});
			req.on('end', () => {
				addProduct(JSON.parse(body));
				send200Empty(res);
			});
		//resource not found error
		} else {
			send404(res);
		}
	}
});

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});
//adds a product to a vendor
function addProduct(data) {
	let vendor = getVendor(vendors, data.vendor);
	//client code works on ids, used to ensure no duplicate ids
	let id = largestId(vendor) + 1;
	vendor.supplies[data.category][id] = data.product;
}
//returns the largest id in the vendor
function largestId(vendor) {
	let supplies = vendor.supplies;
	let maxId = -1;
	for (const category in supplies) {
		for (const product in supplies[category]) {
			if (+product >= maxId) {
				maxId = +product;
			}
		}
	}
	return maxId;
}
//processes a sale
function addSaleData(sale) {
	let vendorData = saleData[sale.name];
	let vendor = getVendor(vendors, sale.name);
	let saleTotal = 0;
	vendorData.sales += 1;
	for (let i = 0; i < sale.products.length; i++) {
		//checks if this product has been sold before
		let product = vendorData.products.find((prod) => prod.name === sale.products[i]);
		//if not adds its info to sales data
		if (product == undefined) {
			let temp = {
				name: sale.products[i],
				quantity: sale.quantities[i],
			};
			vendorData.products.push(temp);
			//check for most popular product
			if (vendorData.popular.quantity < temp.quantity)
				vendorData.popular = temp;
		//if it has been sold before increment its quantity
		} else {
			product.quantity += sale.quantities[i];
			//check for most popular product
			if (vendorData.popular.quantity < product.quantity)
				vendorData.popular = product;
		}
		//increments the sale total
		saleTotal += productLookupByName(vendor, sale.products[i]).price * sale.quantities[i];
	}
	//adds tax and fee to the sale before incrementing the total
	vendorData.total += saleTotal + saleTotal / 10 + vendor.delivery_fee;
}

//Helper function to send a 404 error
function send404(response) {
	response.statusCode = 404;
	response.write("Unknown resource.");
	response.end();
}

//Helper function to send a 500 error
function send500(response) {
	response.statusCode = 500;
	response.write("Server error.");
	response.end();
}

//Helper functions to send 200 sucess (lazy work around to finding out theres no overloading in js)
function send200(type, data, res){
	res.statusCode = 200;
	res.setHeader("Content-Type", type);
	res.write(data);
	res.end();
}
function send200Empty(res){
	res.statusCode = 200;
	res.end();
}
//looks up a product by its name
function productLookupByName(vendor, name) {
	let supplies = vendor.supplies;
	for (const category in supplies) {
		for (const product in supplies[category]) {
			if (supplies[category][product].name === name) {
				return supplies[category][product];
			}
		}
	}
	return null;
}
//returns the vendor with the given name
function getVendor(vendors, name){
	return vendors.find((vendor) => vendor.name == name);
}