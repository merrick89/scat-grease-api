const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    // Create a room here
    res.send({ response: "Test: answer" }).status(200);
});

router.post("/", async (req, res) => {
    // This is the API endpoint to submit answers.
    
    const playerName = !req.body.nickName ? '' : req.body.nickName;
    const roomCode = !req.body.roomCode ? '' : req.body.roomCode;
    const answers = !req.body.answers ? '' : req.body.answers;

    try {

        // Get the connection from the app
        const client = req.app.locals.client;

        const rooms = client.db("scatGrease").collection("rooms");

        // Check if player exists first
        const existingPlayer = await rooms.find({roomCode: roomCode, "playerList.name": playerName }).toArray();

        if (existingPlayer.length > 0){
           // Update the players answers answers
           rooms.findOneAndUpdate(
                    {roomCode: roomCode, "playerList.name": playerName },
                    {
                        $set: { 
                            "playerList.$.answers": {
                                1: answers.answer1,
                                2: answers.answer2,
                                3: answers.answer3,
                                4: answers.answer4,
                                5: answers.answer5,
                                6: answers.answer6,
                                7: answers.answer7,
                                8: answers.answer8,
                                9: answers.answer9,
                                10: answers.answer10,
                                11: answers.answer11,
                                12: answers.answer12
                            }
                        }
                    },
                    {sort: { db_date: -1 }}                
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