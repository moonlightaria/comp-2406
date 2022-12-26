//dependencies
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
let mongo = require("mongodb");

let db;
let MongoClient = mongo.MongoClient;
let app = express();

//sets middleware and view engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use("/", express.static(path.join(__dirname, "public")));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "some secret key here",
    resave: true,
    saveUninitialized: true,
  }));

app.get("*", checkLoggedIn);
app.get("/user/:user", userPage);
app.get("/user", getQueryUsers);
app.get("/workshop", getQueryWorkshops);
app.get("/users", queryUsers);
app.get("/workshops", queryWorkshops);
app.get("/artwork", getArtQuery);
app.get("/artwork/:artwork", artwork);
app.get("/artworks", queryArtwork);
app.get("/addArt", addArtwork);
app.get("/addWorkshop", addWorkshop);
app.get("/workshops/:workshop", workshop);
app.get("/activity", activity);
app.get("/logout", logout);
app.get("*", home);

app.post("/login", login);
app.post("/create", createUser);
app.post("/artwork", newArt);
app.post("/artwork/:artwork/like", like);
app.post("/user/:username/follow", follow);
app.post("/user/changeAccountType", changeAccountType);
app.post("/workshop", newWorkshop);
app.post("/workshops/:workshop", attend);
app.post("/artwork/:artwork/review", review);

app.delete("/artwork/:artwork", deleteArt);
app.delete("/artwork/:artwork/review", deleteReview);
app.delete("/workshops/:workshop", deleteWorkshop);

MongoClient.connect("mongodb://127.0.0.1:27017/", { useNewUrlParser: true }, function (err, client) {
  if (err) throw err;
  db = client.db("final");
  app.listen(3000);
  console.log("Listening on port 3000");
});
//middleware that checks if the user is logged in, if not sends login page
async function checkLoggedIn(req, res, next) {
  if (req.session.username == undefined) {
    res.render("login.pug");
    return;
  }
  next();
}
//logs the user in to specified account
async function login(req, res) {
  let result = await db.collection("users").findOne({ username: req.body.username, password: req.body.password });
  if (result) {
    req.session.username = result.username;
    res.send(true);
  } else {
    res.send(false);
  }
}
//creates a new account
async function createUser(req, res) {
  let user = {
    username: req.body.username,
    password: req.body.password,
    isArtist: false,
    following: [],
    notifications: [],
  };
  if(user.username ==""){
    res.send(false);
    return;
  }
  try {
    await db.collection("users").insertOne(user);
    req.session.username = user.username;
    res.send(true);
  } catch {
    res.send(false);
  }
}
//renders a users page
async function userPage(req, res) {
  let userData = await db.collection("users").findOne({ username: req.params.user });
  if (userData == null) {
    res.status(404).send("user not found");
    return;
  }
  let owned = userData.username == req.session.username;
  let artworkData = await db.collection("gallery").find({ artist: userData.username }, { name: 1, image: 1 }).toArray();
  let hosting = await db.collection("workshops").find({ host: userData.username }).toArray();
  let attending = await db.collection("workshops").find({ attendees: userData.username }).toArray();
  let numFollowing = await db.collection("users").count({following: userData.username});
  let selfData = await db.collection("users").findOne({ username: req.session.username });
  let isFollowing = selfData.following.includes(userData.username);
  if (owned)
    await db.collection("users").updateOne({ username: req.params.user }, { $set : {notifications: [] }});
  await verifyArtist(artworkData, req, userData);

  res.render("user.pug", {
    username: userData.username,
    user: req.session.username,
    owned: owned,
    isArtist: userData.isArtist,
    artworks: artworkData,
    isFollowing: isFollowing,
    following: userData.following,
    numFollowing: numFollowing,
    hosting: hosting,
    attending: attending,
    notifications: userData.notifications,
  });
}
//verify if a user should be an artist, if not revert them back
async function verifyArtist(artworkData, req, userData) {
  if (artworkData.length == 0) {
    await db.collection("users").updateOne({ username: req.session.username }, { $set: { isArtist: false } });
    userData.isArtist = false;
  }
}
//renders the users personal page, used as failsafe for all bad urls
async function home(req, res) {
  req.params.user = req.session.username;
  userPage(req, res);
}
//renders the page for an artwork
async function artwork(req, res) {
  let art = await db.collection("gallery").findOne({ name: req.params.artwork });
  if (art==null){
    res.status(404).send("artwork not found");
    return;
  }
  art.reviews = await getReviewsForArt(art.name);
  let owned = req.session.username == art.artist;
  let liked = art.likes.includes(req.session.username);
  res.render("artwork.pug", {
    art: art,
    owned: owned,
    liked: liked,
  });
}
//submit or update review
async function review(req, res) {
  let result = await db
    .collection("reviews")
    .updateOne(
      { art: req.params.artwork, user: req.session.username },
      { $set: { art: req.params.artwork, user: req.session.username, content: req.body.content } },
      { upsert: true }
    );
  let action = (result.modifiedCount>0) ? `review updated (${req.params.artwork})`: `review added (${req.params.artwork})`;
  let art = await db.collection("gallery").findOne({ name: req.params.artwork });
  await addNotification(art.artist, req.session.username, action);
  await sendReviews(req, res);
}
//helper function to get reviews based on art
async function getReviewsForArt(art) {
  return db.collection("reviews").find({ art: art }, { user: 1, content: 1 }).toArray();
}
//sends the reviews html
async function sendReviews(req, res) {
  let reviews = await getReviewsForArt(req.params.artwork);
  res.render("partials/artReviews", { art: { reviews: reviews } });
}
//deletes a review and sends a notification
async function deleteOneReview(req, review) {
  await db.collection("reviews").deleteOne({ art: review.art, user: review.user });
  let art = await db.collection("gallery").findOne({ name: review.art });
  await db.collection("users").updateOne({username: art.artist},{$push:{notifications:{user:req.session.username,action:`deleted their review (${review.art})`}}});
}
//route for deleting a review
async function deleteReview(req, res) {
  let review = await db.collection("reviews").findOne({ art: req.params.artwork, user: req.session.username });
  await deleteOneReview(req, review);
  await sendReviews(req, res);
}
//likes a users artwork
async function like(req, res) {
  let art = await db.collection("gallery").findOne({ name: req.params.artwork });
  let liked = art.likes.indexOf(req.session.username);
  let action;
  if (liked != -1) {
    await db.collection("gallery").updateOne({ name: req.params.artwork }, { $pull: { likes: req.session.username } });
    action = `unliked your artwork (${art.name})`;
    await addNotification(art.artist, req.session.username, action);
    res.send(`like: ${art.likes.length - 1}`);
  } else {
    await db.collection("gallery").updateOne({ name: req.params.artwork }, { $push: { likes: req.session.username } });
    action = `liked your artwork (${art.name})`;
    await addNotification(art.artist, req.session.username, action);
    res.send(`unlike: ${art.likes.length + 1}`);
  }
}
//shows the user all their current activity
async function activity(req, res) {
  let reviews = await db.collection("reviews").find({ user: req.session.username }, { art: 1, content: 1 }).toArray();
  let arts = await db
    .collection("gallery")
    .find(
      { $or: [ {name:{ $in: reviews.map((e) => e.art) }}, { likes: req.session.username }] },
      { name: 1, artist: 1, image: 1, likes: 1 }
    )
    .toArray();
  for (const art of arts) {
    art.liked = art.likes.indexOf(req.session.username) >= 0;
    art.review = reviews.find((e) => e.art == art.name);
    art.reviewed = art.review != undefined;
    if (!art.reviewed){ 
      art.review = "";
    }else{
      art.review = art.review.content;
    }
  }
  res.render("activity", { artworks: arts });
}
//deletes an artwork from the gallery
async function deleteArt(req, res) {
  await db.collection("reviews").deleteMany({ art: req.params.artwork });
  await db.collection("gallery").deleteOne({ name: req.params.artwork });
  let following = await db.collection("users").find({following: req.session.username}).toArray();
  await db.collection("users").updateMany({username: {$in:following.map(e => e.username)}}, {$push: {notifications: {user:req.session.username,action:`has deleted artwork (${req.params.artwork})`}}});
  res.send();
}
//follow a users account
async function follow(req,res){
  let user = await db.collection("users").findOne({ username: req.session.username });
  let following = user.following.indexOf(req.params.username);
  let numFollowing = await db.collection("users").count({following: req.params.username});
  let action;
  if (following != -1) {
    await db.collection("users").updateOne({ username: req.session.username }, { $pull: { following: req.params.username } });
    action = `unfollowed your account`;
    addNotification(req.params.username, req.session.username, action);
    res.send(`follow: ${numFollowing-1}`);
  } else {
    await db.collection("users").updateOne({ username: req.session.username }, { $push: { following: req.params.username } });
    action = `followed your account`;
    addNotification(req.params.username, req.session.username, action);
    res.send(`unfollow: ${numFollowing+1}`);
  }
}
//change account type between artist and patron
async function changeAccountType(req,res){
  let user = await db.collection("users").findOne({ username: req.session.username });
  await db.collection("users").updateOne({ username: req.session.username }, { $set:{isArtist: !user.isArtist}} );
  let artworks = await db.collection("gallery").count({artist:req.session.username});
  res.send(!user.isArtist && !(artworks>0));
}
//logs a user out
async function logout(req, res){
  req.session.destroy();
  res.redirect("/login");
}
//add artwork to the gallery
async function addArtwork(req,res){
  res.render("addArtwork");
}
//adds artwork to the gallery
async function newArt(req,res){
  for (let key in req.body){
    if (req.body[key]==""){
      res.render("addDocument", {message: `error: ${key} has no value`});
      return;
    }
  }
  if (isNaN(Number(req.body.year)) || Number(req.body.year) >2022 || Number(req.body.year) <1){
    res.render("addDocument", {message: `error: year must be a number between 1 and 2022`});
    return;
  }
  let art = {
    name: req.body.name,
    artist: req.session.username,
    year: Number(req.body.year),
    category: req.body.category,
    medium: req.body.medium,
    description: req.body.description,
    image: req.body.image,
    likes: []
  };
  try{
    await db.collection("gallery").insertOne(art);
    let following = await db.collection("users").find({following: req.session.username}).toArray();
    await db.collection("users").updateMany({username: {$in:following.map(e => e.username)}}, {$push: {notifications: {user:req.session.username,action:`has uploaded new artwork (${art.name})`}}});
  }catch{
    res.render("addDocument", {message: "error: name already exists"});
    return;
  } 
  res.render("addDocument", {message: "success"});
}
//adds workshop to the database
async function addWorkshop(req,res){
  res.render("addWorkshop");
}
//adds workshop to the database
async function newWorkshop(req,res){
  for (let key in req.body){
    if (req.body[key]==""){
      res.render("addDocument", {message: `error: ${key} has no value`});
      return;
    }
  }
  if (isNaN(Number(req.body.capacity)) || Number(req.body.capacity) <0){
    res.render("addDocument", {message: `error: capacity must be a number greater than 0`});
    return;
  }
  let workshop = {
    name: req.body.name,
    host: req.session.username,
    capacity: Number(req.body.capacity),
    category: req.body.category,
    medium: req.body.medium,
    description: req.body.description,
    attendees: []
  };
  try{
    await db.collection("workshops").insertOne(workshop);
    let following = await db.collection("users").find({following: req.session.username}).toArray();
    await db.collection("users").updateMany({username: {$in:following.map(e => e.username)}}, {$push: {notifications: {user:req.session.username,action:`is hosting a new workshop (${workshop.name})`}}});
  }catch{
    res.render("addDocument", {message: "error: name already exists"});
    return;
  }
  res.render("addDocument", {message: "success"});
}
//renders a workshop
async function workshop(req,res){
  let workshop = await db.collection("workshops").findOne({name:req.params.workshop});
  if (workshop==null){
    res.status(404).send("workshop not found");
    return;
  }
  let owned = workshop.host == req.session.username;
  let attending = workshop.attendees.includes(req.session.username);
  res.render("workshop",{
    workshop: workshop,
    owned: owned,
    attending: attending
  });
}
//route for attending
async function attend(req,res){
  let workshop = await db.collection("workshops").findOne({name: req.params.workshop});
  let following = workshop.attendees.indexOf(req.session.username);
  let action;
  if (following != -1) {
    await db.collection("workshops").updateOne({ name: req.params.workshop }, { $pull: { attendees: req.session.username } });
    action = `has canceled their attendance to your workshop (${workshop.name})`;
    await addNotification(workshop.host, req.session.username, action);
    res.send(`attend`);
  } else {
    let full = workshop.attendees.length >= workshop.capacity;
    if (full){
      res.send("workshop is full");
      return;
    }
    await db.collection("workshops").updateOne({ name: req.params.workshop }, { $push: { attendees: req.session.username } });
    action = `is attending your workshop (${workshop.name})`;
    await addNotification(workshop.host, req.session.username, action);
    res.send(`cancel attendance`);
  }
}
//deletes a workshop
async function deleteWorkshop(req,res){
  let workshop = await db.collection("workshops").findOne({name:req.params.workshop});
  let notification = {
    user: req.session.username,
    action: `deleted their workshop (${req.params.workshop})`
  };
  await db.collection("workshops").deleteOne({ name: req.params.workshop });
  await db.collection("users").updateMany({username: {$in:workshop.attendees}}, {$push:{notifications:notification}});
  res.send();
}
//adds a notification to a user
async function addNotification(target, user, action){
  await db.collection("users").updateOne({username: target}, {$push: {notifications: {user:user,action:action}}});
}
//sends the query submit page
async function getQueryUsers(req, res){
  res.render("usersQuery");
}
//sends the query submit page
async function getQueryWorkshops(req,res){
  res.render("workshopsQuery");
}
//sends the query submit page
async function getArtQuery(req,res){
  res.render("artworkQuery");
}
//query logic
async function queryArtwork(req,res){
  let query = {};
  let year = {};
  let likes = {};
  //checks for properties and if they exists adds them to the query
  if (req.query.name != "" && req.query.name != undefined) query.name = { $regex: `${req.query.name}`,$options:"i"};
  if (req.query.artist != "" && req.query.artist != undefined) query.artist = { $regex: `${req.query.artist}`,$options:"i"};
  if (req.query.category != "" && req.query.category != undefined) query.category = { $regex: `${req.query.category}`,$options:"i"};
  if (req.query.medium != "" && req.query.medium != undefined) query.medium = { $regex: `${req.query.medium}`,$options:"i"};
  if (req.query.minYear != "" && req.query.minYear != undefined) year.$gte = (!isNaN(Number(req.query.minYear))) ? Number(req.query.minYear) : 1;
  if (req.query.maxYear != "" && req.query.maxYear != undefined) year.$lte = (!isNaN(Number(req.query.maxYear))) ? Number(req.query.maxYear) : 2022;
  if (req.query.minLikes != "" && req.query.minLikes != undefined) query[`likes.${Number(req.query.minLikes)-1}`] = {$exists: true};
  if (!isEmpty(year)) query.year = year;
  if (!isEmpty(likes)) query.likes = likes;
  let artworks = await db.collection("gallery").find(query).toArray();
  let maxQuery = Math.ceil(artworks.length/10);
  let page = (req.query.page !== "" && req.query.page != undefined && !isNaN(Number(req.query.page))) ? Number(req.query.page) : 1;
  artworks = artworks.slice((page-1)*10, page*10);
  let nextUrl = req.protocol + '://' + req.get('host') + req.originalUrl.replace(`page=${req.query.page}`,`page=${page+1}`);
  let prevUrl = req.protocol + '://' + req.get('host') + req.originalUrl.replace(`page=${req.query.page}`, `page=${page-1}`);
  res.render("queryResults", { links: artworks.map(e => e.name), page: page, next:nextUrl, prev:prevUrl, maxQuery:maxQuery,collection:"artwork"});
}
//query logic
async function queryUsers(req,res){
  let query = {};
  if (req.query.username != "" && req.query.username != undefined) query.username = { $regex: `${req.query.username}`,$options:"i"};
  if (req.query.following != "" && req.query.following != undefined) query.following = { $regex: `${req.query.following}`,$options:"i"};
  let data = await db.collection("users").find(query).toArray();
  let maxQuery = Math.ceil(data.length/10);
  let page = (req.query.page !== "" && req.query.page != undefined && !isNaN(Number(req.query.page))) ? Number(req.query.page) : 1;
  data = data.slice((page-1)*10, page*10);
  let nextUrl = req.protocol + '://' + req.get('host') + req.originalUrl.replace(`page=${req.query.page}`,`page=${page+1}`);
  let prevUrl = req.protocol + '://' + req.get('host') + req.originalUrl.replace(`page=${req.query.page}`, `page=${page-1}`);
  res.render("queryResults", { links: data.map(e => e.username), page: page, next:nextUrl, prev:prevUrl, maxQuery:maxQuery,collection:"user"});
}
//query logic
async function queryWorkshops(req,res){
  let query = {};
  if (req.query.name != "" && req.query.name != undefined) query.name = { $regex: `${req.query.name}`,$options:"i"};
  if (req.query.host != "" && req.query.host != undefined) query.host = { $regex: `${req.query.host}`,$options:"i"};
  if (req.query.capacity != "" && req.query.capacity != undefined){
    query.capacity = {};
    query.capacity.$gte = (!isNaN(Number(req.body.capacity))) ? Number(req.query.capacity) : 0;}
  let data = await db.collection("workshops").find(query).toArray();
  let maxQuery = Math.ceil(data.length/10);
  let page = (req.query.page !== "" && req.query.page != undefined && !isNaN(Number(req.query.page))) ? Number(req.query.page) : 1;
  data = data.slice((page-1)*10, page*10);
  let nextUrl = req.protocol + '://' + req.get('host') + req.originalUrl.replace(`page=${req.query.page}`,`page=${page+1}`);
  let prevUrl = req.protocol + '://' + req.get('host') + req.originalUrl.replace(`page=${req.query.page}`, `page=${page-1}`);
  res.render("queryResults", { links: data.map(e => e.name), page: page, next:nextUrl, prev:prevUrl, maxQuery:maxQuery, collection:"workshops"});
}

//why does this not already exist
function isEmpty(obj) {
	return Object.keys(obj).length === 0;
}