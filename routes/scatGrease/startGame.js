const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    // Create a room here
    res.send({ response: "Test: start game" }).status(200);
});

router.post("/", (req, res) => {
    // Start a game here
    /*
        1. Set the last_start_date to now for the room
        2. Randomly generate a set of 12 questions, and associate it to this room
    */
    res.send({ response: "Started a game." }).status(200);
});

module.exports = router;