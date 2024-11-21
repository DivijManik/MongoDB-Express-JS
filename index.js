import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';

const server = express(); // server
const uri = 'mongodb://localhost:27017';

// path
const serverPath = '/demo';
const database = 'demo';
const dbCollection = 'demo1';

// Mongo DB
const client = new MongoClient(uri);

let db;

// cors required for api call
server.use(cors());
server.use(express.json())

// Connect with MongoDB server
async function run() {
    try {
        await client.connect();
        db = client.db(database);

        console.log("connected to database");
    } finally {
        //await client.close();
    }
}

run().catch(console.error);

// Post Request - use Postman to post json (for testing)
// Add a new document
server.post(serverPath, async (req, res) => {
    let collection = await db.collection(dbCollection);
    let newDocument = req.body;
    // newDocument.date = new Date();
    let result = await collection.insertOne(newDocument);
    res.send(result).status(204);
});

// Get request
// Get all documents in the collection
server.get(serverPath, async (req, res) => {
    const todos = await db.collection(dbCollection).find().toArray();
    res.json(todos)
})

// Put request
// Update a document with id
server.put(serverPath, async (req, res) => {
    let collection = await db.collection(dbCollection);

    let result = await collection.findOneAndUpdate({ _id: new ObjectId(req.query.id) }, { $set: req.body });
    console.log("Put called with - id: " + req.query.id);
    res.send(result).status(204);
});

// Delete
// Delete a document with id
server.delete(serverPath, async (req, res) => {
    let collection = await db.collection(dbCollection);
    console.log("Delete called with - id: " + req.query.id)

    let result = await collection.deleteOne({ _id: new ObjectId(req.query.id) });
    res.send(result).status(204);
});

// -------- Authentication --------

// Register API
server.post(serverPath + '/register', async (req, res) => {
    let collection = await db.collection('authentication');

    // Find user using username
    let user = await collection.findOne({ "user.username": req.body.user.username })

    if (user === null) {
        await collection.insertOne(req.body);
        res.send("Success");
    }
    else
        res.send("Username taken")
});

// Login API
server.post(serverPath + '/login', async (req, res) => {
    let collection = await db.collection('authentication');

    // Find using username
    let data = await collection.findOne({ "user.username": req.body.user.username })

    if (data !== null) {
        if (data.user.password === req.body.user.password)
            res.send("Success");
        else
            res.send("Incorrect password")
    }
    else
        res.send("No Record")
});

// http://localhost:3001/demo

server.listen(3001, () => {
    console.log("server is running")
})