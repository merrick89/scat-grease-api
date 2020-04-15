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
                                1:  {
                                        answer: answers.answer1,
                                        score: 0                                    
                                    },
                                2:  {
                                        answer: answers.answer2,
                                        score: 0
                                    },
                                3: {
                                        answer: answers.answer3,
                                        score: 0
                                    },
                                4: {
                                        answer: answers.answer4,
                                        score: 0
                                    },
                                5: {
                                        answer: answers.answer5,
                                        score: 0
                                    },
                                6: {
                                        answer: answers.answer6,
                                        score: 0
                                    },
                                7: {
                                        answer: answers.answer7,
                                        score: 0
                                    },
                                8: {
                                        answer: answers.answer8,
                                        score: 0
                                    },
                                9: {
                                        answer: answers.answer9,
                                        score: 0
                                    },
                                10: {
                                        answer: answers.answer10,
                                        score: 0
                                    },
                                11: {
                                        answer: answers.answer11,
                                        score: 0
                                    },
                                12: {
                                        answer: answers.answer12,
                                        score: 0
                                    },
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