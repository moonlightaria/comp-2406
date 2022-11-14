let vendor;
let id;

function init(){
    document.getElementById("addcat").addEventListener("click", addCategory);
    document.getElementById("addprod").addEventListener("click", addProduct);
    document.getElementById("save").addEventListener("click", save);
    getVendor();
}

function addCategory(){
    let categories = getCategories();
    let str = document.getElementById("category").value;
    if (categories.includes(str)){
        alert("category already exists");
    }else{
        document.getElementById("left").innerHTML += `<div id=${str}> <h3> ${str} </h3> </div>`;
        vendor.supplies[str] = {};
        option = document.createElement('option');
        option.value = option.text = str;
        document.getElementById("categories").add(option);
    }
    document.getElementById("category").value = "";
}

function getCategories(){
    return Object.keys(vendor.supplies);
}

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
    let price = document.getElementById("price").value;
    let stock = document.getElementById("stock").value;
    let category = document.getElementById('categories');
    category = category.options[category.selectedIndex].value;
    let name = document.getElementById("name").value;
    let desc = document.getElementById("desc").value;
    id++;

    if (isNaN(price) || isNaN(stock)){
        alert("invalid number");
        return;
    }
    if(price <=0 || stock <= 0){
        alert("value to small");
        return;
    }

    vendor.supplies[category][id] = {
        name: name,
        price: price,
        stock: stock,
        description: desc,
    };

    document.getElementById(category).innerHTML += `<p> ${id}: ${stock} ${name} for $${price}</p> <p> ${desc}</p>`;

    document.getElementById("price").value = "";
    document.getElementById("stock").value = "";
    document.getElementById("name").value = "";
    document.getElementById("desc").value= "";
}

function save(){

}