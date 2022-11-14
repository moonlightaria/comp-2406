//Stores the current vendor to easily retrieve data. The assumption is that this object is following the same format as the data included above. If you retrieve the vendor data from the server and assign it to this variable, the client order form code should work automatically.
let currentVendor;
//Stored the order data. Will have a key with each item ID that is in the order, with the associated value being the number of that item in the order.
let order = {};

//Called on page load. Initialize the drop-down list, add event handlers, and default to the first vendor.
function init() {
	genSelList();
}

//Generate new HTML for a drop-down list containing all vendors.
//For A2, you will likely have to make an XMLHttpRequest from here to retrieve the array of vendor names.
function genSelList() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			let data = JSON.parse(xhttp.response);
			let result = '<select name="vendor-select" class="vendors" id="vendor-select">';
			data.forEach(elem => {
				result += `<option value="${elem}">${elem}</option>`;
			});
			result += "</select>";
			document.getElementById("header").innerHTML += result;
			document.getElementById("vendor-select").onchange = selectVendor;
			selectVendor();
		}
	};
	xhttp.open("GET", `/vendors`, true);
	xhttp.send();
}

//Helper function. Returns true if object is empty, false otherwise.
function isEmpty(obj) {
	for (var key in obj) {
		if (obj.hasOwnProperty(key))
			return false;
	}
	return true;
}

//Called when drop-down list item is changed.
//For A2, you will likely have to make an XMLHttpRequest here to retrieve the supplies list data for the selected vendor
function selectVendor() {
	let result = true;

	//If order is not empty, confirm the user wants to switch vendors
	if (!isEmpty(order)) {
		result = confirm("Are you sure you want to clear your order and switch vendor?");
	}

	//If switch is confirmed, load the new vendor data
	if (result) {
		getVendorInfo();
	} else {
		//If user refused the change of vendor, reset the selected index to what it was before they changed it
		let select = document.getElementById("vendor-select");
		select.selectedIndex = currentSelectIndex;
	}
}
//function that gets and loads a new vendor
function getVendorInfo() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			let data = JSON.parse(xhttp.response);
			currentVendor = data;
			//Update the page contents to contain the new supply list
			document.getElementById("left").innerHTML = getCategoryHTML(currentVendor);
			document.getElementById("middle").innerHTML = getSuppliesHTML(currentVendor);
			//Clear the current order and update the order summary
			order = {};
			updateOrder();
			//Update the vendor info on the page
			let info = document.getElementById("info");
			info.innerHTML = "<h1>" + currentVendor.name + "</h1>" + "<br>Minimum Order: $" + currentVendor.min_order + "<br>Delivery Fee: $" + currentVendor.delivery_fee + "<br><br>";
		}
	};
	let select = document.getElementById("vendor-select");
	xhttp.open("GET", `/vendors/${select.options[select.selectedIndex].text}`, true);
	xhttp.send();
}

//Given a vendor object, produces HTML for the left column
function getCategoryHTML(vend) {
	let supplies = vend.supplies;
	let select = '<select name="category-select" id="category-select">';
	let result = "<h3>Categories</h3><br>";
	Object.keys(supplies).forEach(key => {
		result += `<a href="#${key}">${key}</a><br>`;
		select += `<option value="${key}">${key}</option>`;
	});
	select += "</select><br><br>";
	result += "<h3>Add Product</h3><br>";
	result += select;
	result += `<label for="name">name:</label>
	<input type="text" id="name" name="name"><br><br>
	<label for="price">price:</label>
	<input type="text" id="price" name="price"><br><br>
	<label for="stock">stock:</label>
	<input type="text" id="stock" name="stock"><br><br>
	<label for="disc">discription:</label>
	<input type="text" id="disc" name="disc"><br><br>
	<input type="button" value="Add Product" onclick="submit()">` ;
	return result;
}
//handles the sumbition for adding a new product to the vendor
function submit() {
	let data = productData();
	//return if no valid product
	if (data == "") {
		return;
	}
	//send product data and reset the vendor
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			currentVendor.supplies[data.category][largestId(currentVendor)+1] = data.product;
			document.getElementById("middle").innerHTML = getSuppliesHTML(currentVendor);
			alert("product added");
		}
	};
	xhttp.open("POST", `/product`, true);
	xhttp.send(JSON.stringify(data));
}
//function to validate new product data
function productData() {
	let select = document.getElementById("category-select");
	let stock = +document.getElementById("stock").value;
	let price = +document.getElementById("price").value;
	//checks if stock or price is a valid number
	if (isNaN(stock) || stock<1) {
		alert("stock is not a valid number");
		return "";
	}
	if (isNaN(price || stock<1)) {
		alert("price is not a valid number");
		return "";
	}
	//returns the data needed to add a new product
	return {
		vendor: currentVendor.name,
		category: select.options[select.selectedIndex].text,
		product: {
			name: document.getElementById("name").value,
			description: document.getElementById("disc").value,
			stock: stock,
			price: price
		}
	};
}

//Given a vendor object, produces the supplies HTML for the middle column
function getSuppliesHTML(vend) {
	let supplies = vend.supplies;
	let result = "";
	//For each category in the supply list
	Object.keys(supplies).forEach(key => {
		result += `<b>${key}</b><a name="${key}"></a><br>`;
		//For each item in the category
		Object.keys(supplies[key]).forEach(id => {
			item = supplies[key][id];
			result += `${item.name} (\$${item.price}, stock=${item.stock}) <img src='add.png' style='height:20px;vertical-align:bottom;' onclick='addItem(${item.stock}, ${id})'/> <br>`;
			result += item.description + "<br><br>";
		});
	});
	return result;
}

//Responsible for adding one of the items with given id to the order, updating the summary, and alerting if "Out of stock"
function addItem(stock, id) {
	if (order.hasOwnProperty(id) && (stock == order[id])) {
		alert("Out if stock!");
		return;
	} else if (order.hasOwnProperty(id)) {
		order[id] += 1;
	} else {
		order[id] = 1;
	}
	updateOrder();
}

//Responsible for removing one of the items with given id from the order and updating the summary
function removeItem(id) {
	if (order.hasOwnProperty(id)) {
		order[id] -= 1;
		if (order[id] <= 0) {
			delete order[id];
		}
	}
	updateOrder();
}

//Reproduces new HTML containing the order summary and updates the page
//This is called whenever an item is added/removed in the order
function updateOrder() {
	let result = "";
	let subtotal = 0;

	//For each item ID currently in the order
	Object.keys(order).forEach(id => {
		//Retrieve the item from the supplies data using helper function
		//Then update the subtotal and result HTML
		let item = getItemById(id);
		subtotal += (item.price * order[id]);
		result += `${item.name} x ${order[id]} (${(item.price * order[id]).toFixed(2)}) <img src='remove.png' style='height:15px;vertical-align:bottom;' onclick='removeItem(${id})'/><br>`;
	});

	//Add the summary fields to the result HTML, rounding to two decimal places
	result += `<br>Subtotal: \$${subtotal.toFixed(2)}<br>`;
	result += `Tax: \$${(subtotal * 0.1).toFixed(2)}<br>`;
	result += `Delivery Fee: \$${currentVendor.delivery_fee.toFixed(2)}<br>`;
	let total = subtotal + (subtotal * 0.1) + currentVendor.delivery_fee;
	result += `Total: \$${total.toFixed(2)}<br>`;

	//Decide whether to show the Submit Order button or the "Order X more" label
	if (subtotal >= currentVendor.min_order) {
		result += `<button type="button" id="submit" class="sumbit" onclick="submitOrder()">Submit Order</button>`;
	} else {
		result += `Add \$${(currentVendor.min_order - subtotal).toFixed(2)} more to your order.`;
	}

	document.getElementById("right").innerHTML = result;
}

//Simulated submitting the order
//For A2, you will likely make an XMLHttpRequest here
function submitOrder() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			alert("Order placed!");
			order = {};
			getVendorInfo();
		}
	};
	xhttp.open("POST", `/sale`, true);
	xhttp.send(JSON.stringify(orderData()));
}
//function to format required to process sale (used paired arrays, was mistake and too annoying to change now)
function orderData() {
	return {
		name: currentVendor.name,
		products: Object.keys(order).map((item) => getItemById(item).name),
		quantities: Object.values(order),
	};
}
//Helper function. Given an ID of an item in the current vendors' supply list, returns that item object if it exists.
function getItemById(id) {
	let categories = Object.keys(currentVendor.supplies);
	for (let i = 0; i < categories.length; i++) {
		if (currentVendor.supplies[categories[i]].hasOwnProperty(id)) {
			return currentVendor.supplies[categories[i]][id];
		}
	}
	return null;
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