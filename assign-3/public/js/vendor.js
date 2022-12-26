let vendor;
let id;

//add listeners and get the vendor data
function init(){
    document.getElementById("addcat").addEventListener("click", addCategory);
    document.getElementById("addprod").addEventListener("click", addProduct);
    document.getElementById("save").addEventListener("click", save);
    getVendor();
}
//adds a category to the vendor
function addCategory(){
    let categories = getCategories();
    //gets str of category to add
    let str = document.getElementById("category").value;
    //checks if category already exists
    if (categories.includes(str)){
        alert("category already exists");
    }else{
        //adds to supplies html
        document.getElementById("left").innerHTML += `<div id=${str}> <h3> ${str} </h3> </div>`;
        //adds to vendor object
        vendor.supplies[str] = {};
        //adds to category select
        option = document.createElement('option');
        option.value = option.text = str;
        document.getElementById("categories").add(option);
    }
    //clears category text
    document.getElementById("category").value = "";
}

//gets an array of all categories
function getCategories(){
    return Object.keys(vendor.supplies);
}
//requests the vendor object
function getVendor(){
    let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
            vendor = JSON.parse(xhttp.response);
            id = largestId();
		}
	};
	xhttp.open("GET", window.location.pathname, true);
    xhttp.setRequestHeader('Accept','application/json');
	xhttp.send();
}

//returns the largest id in the vendor
function largestId() {
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

function addProduct(){
    //gets the values
    let name = document.getElementById("name").value;
    let price = document.getElementById("price").value;
    let stock = document.getElementById("stock").value;
    let desc = document.getElementById("desc").value;
    let category = document.getElementById('categories');
    category = category.options[category.selectedIndex].value;
    id++;

    //validates data
    if (isNaN(price) || isNaN(stock)){
        alert("invalid number");
        return;
    }
    if(price <=0 || stock <= 0){
        alert("value to small");
        return;
    }
    
    //adds product to vendor
    vendor.supplies[category][id] = {
        name: name,
        price: price,
        stock: stock,
        description: desc,
    };

    //updates supplies html
    document.getElementById(category).innerHTML += `<p> ${id}: ${stock} ${name} for $${price}</p> <p> ${desc}</p>`;

    //clears input feilds
    document.getElementById("price").value = "";
    document.getElementById("stock").value = "";
    document.getElementById("name").value = "";
    document.getElementById("desc").value= "";
}
//sends vendor object to server
function save(){
    //updates vendor object with modified data
    vendor.name = document.getElementById("name").value;
    vendor.delivery_fee = document.getElementById("delivery_fee").value;
    vendor.min_order = document.getElementById("min_order").value;
    
    let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
            alert("saved");
		}
	};
	xhttp.open("PUT", window.location.pathname, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify(vendor));
}