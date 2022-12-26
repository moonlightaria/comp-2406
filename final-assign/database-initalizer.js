let mongo = require("mongodb");
let userData = require("./data/users.json");
let galleryData = require("./data/gallery.json");
let reviewData = require("./data/reviews.json");
let MongoClient = mongo.MongoClient;

createDatabase();

async function createDatabase() {
	let db = await MongoClient.connect("mongodb://127.0.0.1:27017/", {
		useNewUrlParser: true,
	});
	db = db.topology.client.db("final");
	console.log("connected");
	await createCollections(db);
	process.exit();
}
async function createCollections(db) {
	await createUsers(db);
	await createGallery(db);
	await createReviews(db);
	await createWorkshops(db);
}
async function createGallery(db) {
	await db.collection("gallery").drop(() => {});
	console.log("dropping gallery");
	await db.createCollection("gallery", {
		validator: {
			$jsonSchema: {
				bsonType: 'object',
				required: [
					'name',
					'artist',
					'year',
					'category',
					'medium',
					'description',
					'image',
					'likes'
				],
				additionalProperties: false,
				description: 'an artwork in the gallery',
				properties: {
					_id: {
						bsonType: 'objectId',
						description: 'objectId of this object, required field of type objectId'
					},
					name: {
						bsonType: 'string',
						description: 'name of the artwork, required field of type string'
					},
					artist: {
						bsonType: 'string',
						description: 'name of the artist, required field of type string'
					},
					year: {
						bsonType: 'int',
						minimum: 0,
						maximum: 2022,
						description: 'the year the artwork was made, 0 if unknown, required field of type int bounded between 0 and 2022'
					},
					category: {
						bsonType: 'string',
						description: 'category of the artwork, required field of type string'
					},
					medium: {
						bsonType: 'string',
						description: 'medium of the artwork, required field of type string'
					},
					description: {
						bsonType: 'string',
						description: 'description of the artwork, required field of type string'
					},
					image: {
						bsonType: 'string',
						description: 'url of the artwork, required field of type string'
					},
					likes: {
						bsonType: 'array',
						items: {
							bsonType: 'string'
						}
					}
				}
			}
		},
	});
	console.log("created gallery");
	await db.collection("gallery").createIndex({ name: 1 }, { unique: true });
	console.log("added gallery indexes");
	await db.collection("gallery").insertMany(galleryData);
	console.log("added gallery");
}
async function createUsers(db) {
	await db.collection("users").drop(() => {});
	console.log("dropping users");
	await db.createCollection("users");
	console.log("creating users");
	await db.collection("users").createIndex({ username: 1 }, { unique: true });
	console.log("added user indexes");
	await db.collection("users").insertMany(userData);
	console.log("added users");
}
async function createReviews(db){
	await db.collection("reviews").drop(() => {});
	console.log("dropping reviews");
	await db.createCollection("reviews");
	console.log("creating reviews");
	await db.collection("reviews").createIndex({ user: 1, art: 1 }, { unique: true });
	console.log("added reviews indexes");
	await db.collection("reviews").insertMany(reviewData);
	console.log("added reviews");
}
async function createWorkshops(db){
	await db.collection("workshops").drop(() => {});
	console.log("dropping workshops");
	await db.createCollection("workshops");
	console.log("creating workshops");
	await db.collection("workshops").createIndex({ name:1 }, { unique: true });
	console.log("added workshops indexes");
}
