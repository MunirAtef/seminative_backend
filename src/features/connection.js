const {MongoClient, ServerApiVersion} = require('mongodb');

const uri = process.env.MONGO_CONNECTION_STRING;


const mongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


const mongodbConnect = async () => {
    try {
        if (!mongoClient.topology || !mongoClient.topology.isConnected()) {
            await mongoClient.connect();
            console.log("✅ Connected to MongoDB server...");
        }
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1); // Exit if the connection fails
    }
};


const mongoDb = mongoClient.db("seminat_db");
const usersCollection = mongoDb.collection("users");
const appsCollection = mongoDb.collection("apps");
const appReviewsCollection = mongoDb.collection("app_reviews");
const userInteractionsCollection = mongoDb.collection("user_interactions");


module.exports = {mongoClient, mongodbConnect, usersCollection, appsCollection, userInteractionsCollection, appReviewsCollection };

