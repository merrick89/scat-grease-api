const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    // Create a room here
    res.send({ response: "Test: start game" }).status(200);
});

router.post("/", async (req, res) => {
    // Start a game here
    /*
        1. Set the last_start_date to now for the room
        2. Randomly generate a set of 12 questions, and associate it to this room
    */

   const roomCode = !req.body.roomCode ? '' : req.body.roomCode;
   
    try {

        // Get the connection from the app
        const client = req.app.locals.client;
        const questionList = client.db("scatGrease").collection("questionList");

        // Generate a random set of 12 questions
        const questions = await questionList.aggregate([{$sample: {size: 12}}]).toArray();

        // Assign a random letter
        const letter = String.fromCharCode(65+Math.floor(Math.random() * 26));

        // console.log(questions);

        const rooms = client.db("scatGrease").collection("rooms");
        rooms.findOneAndUpdate(     {roomCode: roomCode},
                                    {  $set: {
                                            letter: letter,
                                            last_start_date: new Date(),
                                            questions: questions
                                        }
                                    },
                                    { sort: { db_date: -1 } }
                                )

        return res.status(200).send({
            success: true
        });

    } catch (err) {
        console.log("error:", err);
        return res.status(500).send({
            success: false
        });
    }     
});

module.exports = router;