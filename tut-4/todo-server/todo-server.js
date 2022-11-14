
const http = require('http');
const fs = require("fs");

let list = ["item", "item2", "item3"];

//Create a server, giving it the handler function
//Request represents the incoming request object
//Response represents the outgoing response object
//Remember, you can break this apart to make it look cleaner
const server = http.createServer(function (request, response) {
	console.log(request.url);
	if(request.method === "GET"){
		if(request.url === "/" || request.url === "/todo.html"){
			//read the todo.html file and send it back
			fs.readFile("./tut-4/todo-server/todo.html", function(err, data){
				if(err){
					response.statusCode = 500;
					response.write("Server error.");
					response.end();
					return;
				}
				response.statusCode = 200;
				response.setHeader("Content-Type", "text/html");
				response.write(data);
				response.end();
			});
		}else if(request.url === "/todo.js"){
			//read todo.js file and send it back
			fs.readFile("./tut-4/todo-server/todo.js", function(err, data){
				if(err){
					response.statusCode = 500;
					response.write("Server error.");
					response.end();
					return;
				}
				response.statusCode = 200;
				response.setHeader("Content-Type", "application/javascript");
				response.write(data);
				response.end();
			});
		//Add any more 'routes' and their handling code here
		//e.g., GET requests for "/list", POST request to "/list"
		}else if (request.url === "/list"){
				response.statusCode = 200;
				response.setHeader('Content-Type', 'application/json');
				response.write(JSON.stringify(list));
				response.end();
		}else{
				response.statusCode = 404;
				response.write("Unknwn resource.");
				response.end();
		}
	}else if(request.method === "POST"){
		//gets the data and pushes it onto the list
		if (request.url === "/list"){
			try{
				const chunks = [];
				request.on("data", (chunk) => {
					chunks.push(chunk);
				});
				request.on("end", () => {
					const stringData = Buffer.concat(chunks).toString();
					list.push(JSON.parse(stringData));
				});
				response.statusCode = 200;
				response.end();
		}catch(err){
				response.statusCode = 500;
				response.end();
		}
		}else{
				//any handling in here
				response.statusCode = 404;
				response.write("Unknwn resource.");
				response.end();
		}
		
	}else if(request.method === "PUT"){
		//gets data and removes from the list anything found within
		if (request.url === "/list"){
			try{
				const chunks = [];
				request.on("data", (chunk) => {
					chunks.push(chunk);
				});
				request.on("end", () => {
					const stringData = Buffer.concat(chunks).toString();
					let purge = JSON.parse(stringData);
					list = list.filter((item) => {
						return purge.indexOf(item) <0;
					});
				});
				response.statusCode = 200;
				response.end();
		}catch(err){
			response.statusCode = 500;
			response.end();
		}
		}else{
			//any handling in here
			response.statusCode = 404;
			response.write("Unknwn resource.");
			response.end();
		}
	}
});

//Server listens on port 3000
server.listen(3000);
console.log('Server running at http://127.0.0.1:3000/');