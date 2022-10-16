const http = require('http');
const fs = require('fs');
const path = require('path');
const vendorDir = "./vendors/";

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    const vendors = fs.readdirSync(vendorDir).filter((file) => path.extname(file) == ".json").map((file) => JSON.parse(fs.readFileSync(vendorDir + file)));
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end(JSON.stringify(vendors));
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});