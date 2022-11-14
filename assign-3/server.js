const express = require('express');
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
let app = express();

const vendors = fs.readdirSync(path.resolve(__dirname, "./vendors")).filter((file) => path.extname(file) == ".json")
	.map((file) => JSON.parse(fs.readFileSync(path.resolve(__dirname, "./vendors", file))));
let id = vendors.length;

app.set("view engine", "pug");
app.set("views", path.join(__dirname, 'views'));
// Show HTTP requests in the console
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/', express.static(path.join(__dirname, 'public')));

app.route("/")
.get(function (req, res) {
    res.render("index.pug");
});

app.route("/vendors")
.get(function (req, res){
    res.format({     
        'text/html': function () {
            res.render("vendors.pug", {data: vendors});
        },
        'application/json': function () {
            let arr = vendors.map((data) => data.id);
            res.send({vendors: arr});
        },
        default: function () {
          // log the request and respond with 406
          res.status(406).send('not valid content type');
        }
    });
});

app.route("/vendors/:vendorID")
.get(function (req,res){
    if (isNaN(req.params.vendorID)){
        res.status(404).send();
    }else if(req.params.vendorID >= vendors.length){
        res.status(404).send();
    }else{
        res.format({     
            html: function () {
                res.render("vendor.pug", {data: vendors[req.params.vendorID]});
            },
            json: function () {
                res.send(JSON.stringify(vendors[req.params.vendorID]));
            },
            default: function () {
            // log the request and respond with 406
            res.status(406).send('not valid content type');
            }
        });
    }
});

app.route("/addvendor")
.get(function (req,res) {
    res.render("add.pug");
}).post(function (req,res){
    if (req.body.name == undefined || isNaN(req.body.min_order) || isNaN(req.body.delivery_fee)){
        res.status(400).send();
    }else{
        vendors.push({
            id: id,
            name: req.body.name,
            min_order: req.body.min_order,
            delivery_fee: req.body.delivery_fee,
            supplies: {},
        });
        id++;
        res.send();
    }
});

app.listen(3000);