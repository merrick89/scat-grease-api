const express = require("express");
const cookieParser = require('cookie-parser');
const http = require("http");
const moment = require("moment");
const socketIo = require("socket.io");
const MongoClient = require('mongodb').MongoClient;
const config = require("./config/config");
const cors = require("cors");

const app = express();

app.use(cors({
    origin:true,
    credentials: true
}))
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

const index = require("./routes/index");
const create = require("./routes/scatGrease/create");
const join = require("./routes/scatGrease/join");
const startGame = require("./routes/scatGrease/startGame");

app.use(index);
app.use('/scatGrease/create', create);
app.use('/scatGrease/join', join);
app.use('/scatGrease/startGame', startGame);

const uri = `mongodb+srv://${config.user}:${config.password}@merrick-6y73m.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Establish the connection for the entire app
client.connect().then((client)=>{
    app.locals.client = client;

    const server = http.createServer(app);
    const io = socketIo(server); // < Interesting!

    let interval;

    io.on("connection", socket => {     
        
        console.log("New client connected");

        // Fix max listeners warning in console
        io.setMaxListeners(0);

        // Get the roomCode from the client (React)
        socket.on("clientConnected", (roomCode) => {

            console.log("Room Joined:", roomCode);

            socket.join(roomCode);

            if (interval) {
                clearInterval(interval);
            }
        
            interval = setInterval(() => getApiAndEmit(io, roomCode), 2000);

        })    

        socket.on("disconnect", () => {
            console.log("Client disconnected");
            if (interval) {
                clearInterval(interval);
            }
        });    
    });

    const getApiAndEmit = async (io, roomCode) => {       
        // Query the DB to get information on the room.
       
        const collection = client.db("scatGrease").collection("rooms");        
    
        const record = await collection.find({roomCode: roomCode}).sort({db_date: -1}).limit(1).toArray();
        const game = record[0];

        //console.log(game)

        try {
            var res;
            if (game){
                res = {
                    success: true,
                    roomId: game._id,
                    roomCode: game.roomCode,
                    playerList: game.playerList,
                    letter: game.letter,
                    questions: game.questions,
                    timeStarted: game.last_start_date
                }; 
            } else {
                res = {
                    success: false
                }
            }
    
            io.to(roomCode).emit("FromAPI", res); // Emitting a new message. It will be consumed by the client        
    
        } catch (error) {
            console.error(`Error: ${error}`);
        }          
      
        
    };

    const port = process.env.PORT || 4001;
    server.listen(port, () => console.log(`Listening on port ${port}`));

}).catch((err) => {
    console.log("Could not connect:", err)
})