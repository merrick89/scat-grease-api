const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  // Connects to the room.
  res.send({ response: "I am alive" }).status(200);
});

module.exports = router;