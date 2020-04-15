const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const moment = require("moment");

router.get("/", (req, res) => {
    // Create a room here
    res.send({ response: "Test: create" }).status(200);
});

router.post("/", async (req, res) => {
    
    const playerOne = !req.body.nickName ? '' : req.body.nickName;

    try {

        // Get the connection from the app
        const client = req.app.locals.client;

        const collection = client.db("scatGrease").collection("rooms");

        // Create the new room here
        /* A room requires a 5 character roomcode, last_start_date, db_date */
        var roomCode = crypto.randomBytes(20).toString('hex').substr(1,5);
        var obj = { roomCode: roomCode,
                    db_date: moment().format(),
                    playerList: [{
                                    name: playerOne,
                                    score: 0,
                                    answers: {}
                                }],
                    last_start_date: '',
                    questions: [],                    
                    status: 'new'
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

    } catch (err) {
        console.log("error:", err);
        return res.status(500).send({
            connected: false,
            success: false,
            error: {
                message: "Couldn't connect..."
            }
        })
    }     


});

module.exports = router;