const express = require('express');
const { connectToDb, getDb } = require('./db');
//const { ObjectId } = require('mongodb');

const app = express();
app.use(express.json())

(async () => {
    try {
        await connectToDb();
        const db = getDb();

        app.post('/Details', async (req, res) => {
            const books = req.body;

            try {
                console.log('Inserting document:', books);
                const result = await db.collection('Details').insertOne(books);
                console.log('Document inserted:', result);
                res.status(201).json(result);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: 'Could not insert document' });
            }
        });

        app.listen(3002, () => {
            console.log("Listening at port 3002");
        });
    } catch (err) {
        console.error("Error connecting to the database:", err);
    }
})();
