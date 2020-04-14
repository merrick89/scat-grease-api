const express = require("express");
const router = express.Router();
const crypto = require("crypto");

router.get("/", (req, res) => {
    // Create a room here
    res.send({ response: "Test: join" }).status(200);
});

router.post("/", async (req, res) => {
    
    const playerName = !req.body.nickName ? '' : req.body.nickName;
    const roomCode = !req.body.roomCode ? '' : req.body.roomCode;

    try {

        // Get the connection from the app
        const client = req.app.locals.client;

        const rooms = client.db("scatGrease").collection("rooms");

        // Update the room with the new player... if it doesn't already exist
        const existingPlayer = await rooms.find({roomCode: roomCode, "playerList.name": playerName }).toArray();

        if (existingPlayer.length === 0){
            // This player does not exist in the room, let's add him in
            rooms.findOneAndUpdate(     {roomCode: roomCode},
                {  $push: {
                        playerList: {name: playerName, score: 0}
                    }
                },
                { sort: { db_date: -1 } }
            )
        }

        return res.send({
            success: true,          
        }).status(200);

    } catch (err) {
        console.log("error:", err);
        return res.status(500).send({            
            success: false,
            error: {
                message: "Couldn't connect..."
            }
        })
    }     


});

module.exports = router;