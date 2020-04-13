const express = require("express");
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const config = require("../../config/config");
const crypto = require("crypto");

const uri = `mongodb+srv://${config.user}:${config.password}@merrick-6y73m.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

router.get("/", (req, res) => {
    // Create a room here
    res.send({ response: "Test: create" }).status(200);
});

router.post("/", async (req, res) => {
    
    const playerOne = !req.body.nickName ? '' : req.body.nickName;

    // Connect to DB and create a new room
    await client.connect().then(async (client) => {
        const collection = client.db("scatGrease").collection("rooms");

        // Create the new room here
        /* A room requires a 5 character roomcode, last_start_date, db_date */
        var roomCode = crypto.randomBytes(20).toString('hex').substr(1,5);
        var obj = { roomCode: roomCode,
                    db_date: new Date(),
                    playerList: [{
                                    name: playerOne,
                                    score: 0
                                }]
                }
        
        // Insert the room record
        const insertResponse = await collection.insertOne(obj);

        return res.send({ 
            connected: true,
            success: true,
            data: { 
                mongoId: insertResponse.insertedId,
                roomCode: insertResponse.ops[0].roomCode
            }            
        }).status(200);
        
    }).catch( err => {
        console.log("error:", err);
        return res.status(500).send({
            connected: false,
            success: false,
            error: {
                message: "Couldn't connect..."
            }
        })
    })

});

module.exports = router;