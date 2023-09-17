const express = require('express');
const { connectToDb, getDb } = require('./db');
const { ObjectId } = require('mongodb');
//app.use(express.json());
//const {ObjectId}=require('mongodb')
//import {connectToDb,getDb} from './db.js'

// initialize the app and middleware..
const app = express();
app.use(express.json());//pass any json coming in as a request so i can use it in my handler function..

(async () => {
    try {
        await connectToDb();//This is the line when the function "connectToDb" from db.js is called. 
        const db = getDb();

        app.get('/Details', async (req, res) => {
            try {
                // Access query parameters from the req object
                const queryParam = req.query.paramName;

                // Access headers from the req object
                const userAgent = req.headers['user-agent'];

                // Access the request URL from the req object
                const requestUrl = req.originalUrl;

                // Use query parameters, headers, and other req properties as needed

                // Perform database query and send response
                const books = await db.collection('Details').find().sort({ author: 1 }).toArray();
                res.status(200).json({ books, queryParam, userAgent, requestUrl });
            } catch (error) {
                console.error("Error fetching books:", error);
                res.status(500).json({ error: 'Could not fetch books' });
            }
        });
        

app.get('/Details/:id', async (req, res) => {
    try {
        
        if (ObjectId.isValid(req.params.id)) {
            const doc = await db.collection('Details').findOne({ _id: new ObjectId(req.params.id) });
            if (doc) {
                res.status(200).json(doc); // Return the document if found
            } else {
                res.status(404).json({ error: 'No Document' }); // Document not found
            }
        } else {
            res.status(400).json({ error: 'Not a valid ObjectId' }); // Invalid ObjectId format
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.post('/Details', async (req, res) => {
    //console.log(res.headersSent)
    //res.send('OK');

    
    const books = req.body;
    console.log('Request Body:', req.body);
    try {
        console.log('Inserting document:', books);
        const result = await db.collection('Details').insertOne(books);
        console.log('Document inserted:', result);
        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not insert document', details: err.message });
    }
});
//delete(inside this is the endpoint where the api will hit)
//and then we send the result method back to the client as well 
//and then we catch an error and give a status of 500 and if the the object id is not valid else part will execute ...
//the working goes as we get a objectid using the id from the req parameter if its a valid one , we get the result back from mongo db with a status code of 200 then to  collection books and we will use the deleteone method to delete one method from the Details collection 
app.delete('/Details/:id',(req,res)=>{
    //console.log(`Delete book with id ${req.params}`);
    if( ObjectId.isValid(req.params.id))
    {
    db.collection('Details')
    .deleteOne({_id: new ObjectId(req.params.id)})
    .then(result=>{
        res.status(200).json(result)
    })

    .catch(err=>{
        res.status(500).json({error:"Could not find the document"});
    })
}else{
    res.status(400).json({"Error":"Invalid Object Id"})
}
})
app.patch('/Details/:id',(req,res)=>{
    const updates=req.body//updates will be an object with differenrt fields we want to update,these may be the full book details or may be the author ot the titile part..

    //First an if check to check if it is a valid object id
    if(ObjectId.isValid(req.params.id)){
    db.collection('Details')
    .updateOne({_id:new ObjectId(req.params.id)},{$set :updates})
    .then(result=>{
        res.status(200).json(result)
    })
    .catch(err=>{
        res.status(500).json({error:'couldnot update'})
    })
}
else{
    return res.sendStatus(400);
}
    
})



app.listen(5500, () => {
            console.log("Listening at port 5500");
        });
    } catch (err) {
        console.error("Error connecting to the database:", err);
    }
})();



/*Explanation:

In the code snippet you've provided, you have an immediately-invoked function expression (IIFE) that wraps the asynchronous code. This IIFE contains multiple asynchronous operations, including connecting to the database (await connectToDb()) and querying the database (await db.collection('Details').find().sort({ author: 1 }).toArray()). These asynchronous operations return Promises, and they are resolved in the following way:

await connectToDb():

This line awaits the resolution of the connectToDb function, which is defined in your db.js file.
When you call await connectToDb(), the code inside the connectToDb function is executed up until the await MongoClient.connect(...).
If the database connection is successful, the await statement will pause the execution of the surrounding function (the IIFE) until the promise returned by connectToDb is resolved. This ensures that the database connection is established before moving on.
await db.collection('Details').find().sort({ author: 1 }).toArray():

In your route handler, you're querying the database to fetch a list of books.
The await keyword here ensures that the database query is completed and the data is retrieved before moving on to the next steps.
The Promises returned by the database operations (db.collection('Details').find().sort({ author: 1 }).toArray()) are being resolved within the await statements.
res.status(200).json({ books, queryParam, userAgent, requestUrl });:

After the database query is complete and the data is retrieved, the response is being constructed and sent to the client using res.status(200).json(...).
The asynchronous nature of the Promises ensures that the response is sent only when all the asynchronous operations (including database querying) have completed.
If any errors occur during the execution of the try blocks (such as database connection errors or query errors), the corresponding catch blocks will be executed, handling the errors appropriately and sending an error response to the client.

In summary, the await keyword is used to wait for Promises to be resolved, ensuring that asynchronous operations are completed before moving on to the next steps in your code. This allows your code to be written in a more readable and synchronous-like manner while still taking advantage of non-blocking asynchronous behavior.


*/

/* 
Route- Handler Part:

Express Route Handler Setup:

The app.get('/Details', async (req, res) => { ... }) block sets up a route handler for the /Details URL path.
Within this route handler:

Query parameters, request headers, and the request URL are accessed from the req object as demonstrated in the comments.

A database query is performed to fetch books from the 'Details' collection using await db.collection('Details').find().sort({ author: 1 }).toArray();.
The retrieved books, along with other information from the req object, are used to construct the response JSON.
If there's an error during the database query, a 500 Internal Server Error response is sent.
Server Listen:

After setting up the route handler, the app.listen(3005, () => { ... }) call starts the Express server to listen on port 3005.
Once the server is started, the provided callback function is executed, logging "Listening at port 3005" to the console.
Error Handling:

If any error occurs during the execution of the code within the IIFE (e.g., connecting to the database), the catch block will catch the error and log an appropriate message.
Similarly, if there's an error during the execution of the route handler (e.g., a database query error), the catch block within the route handler will catch the error and send an error response to the client.
In summary, this code sets up an Express server, establishes a database connection, and defines a route handler to fetch books from the database and respond to client requests. The use of async/await ensures that asynchronous operations, like database queries and waiting for the database connection, are handled in a readable and sequential manner. Any errors are properly caught and handled to ensure the reliability of the application.







*/