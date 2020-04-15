const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    // Create a room here
    res.send({ response: "Test: answer" }).status(200);
});

router.post("/", async (req, res) => {
    // This is the API endpoint to score answers.
    
    const playerName = !req.body.nickName ? '' : req.body.nickName;
    const roomCode = !req.body.roomCode ? '' : req.body.roomCode;
    const direction = !req.body.direction ? '' : req.body.direction;
    const answerNumber = !req.body.answerNumber ? '' : req.body.answerNumber;

    const recordToSet = `playerList.$.answers.${answerNumber}.score`;

    try {

        // Get the connection from the app
        const client = req.app.locals.client;

        const rooms = client.db("scatGrease").collection("rooms");

        // Check if player exists first
        const existingPlayer = await rooms.find({roomCode: roomCode, "playerList.name": playerName }).toArray();

        if (existingPlayer.length > 0){           
           if (direction){
                // Update the player's score
                rooms.findOneAndUpdate(
                        {roomCode: roomCode, "playerList.name": playerName },
                        {
                            $inc: {
                                "playerList.$.score": 1
                            }
                        },
                        {sort: { db_date: -1 }}                
                )

                // Update the answer's score
                rooms.findOneAndUpdate(
                        {roomCode: roomCode, "playerList.name": playerName },
                        {
                            $inc: {
                                [recordToSet]: 1
                            }
                        },
                        {sort: { db_date: -1 }}                
                )
           } else {
               // Update the player's score
                rooms.findOneAndUpdate(
                        {roomCode: roomCode, "playerList.name": playerName },
                        {
                            $inc: {
                                "playerList.$.score": -1
                            }
                        },
                        {sort: { db_date: -1 }}                
                )

                // Update the answer's score
                rooms.findOneAndUpdate(
                    {roomCode: roomCode, "playerList.name": playerName },
                    {
                        $inc: {
                            [recordToSet]: -1
                        }
                    },
                    {sort: { db_date: -1 }}                
                )
           }
           
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