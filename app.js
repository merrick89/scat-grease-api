const express = require("express");
const cookieParser = require('cookie-parser');
const http = require("http");
const moment = require("moment");
const socketIo = require("socket.io");
const MongoClient = require('mongodb').MongoClient;
const cors = require("cors");
const aws = require('aws-sdk');

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
const answer = require("./routes/scatGrease/answer");
const score = require("./routes/scatGrease/score");

app.use(index);
app.use('/scatGrease/create', create);
app.use('/scatGrease/join', join);
app.use('/scatGrease/startGame', startGame);
app.use('/scatGrease/answer', answer);
app.use('/scatGrease/score', score);


const user = process.env.user;
const password = process.env.password;
const socketEmitFrequency = process.env.socketEmitFrequency;
const secondsPerRound = process.env.secondsPerRoun;

const uri = `mongodb+srv://${s3.user}:${s3.password}@merrick-6y73m.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Establish the connection for the entire app
client.connect().then((client)=>{
    app.locals.client = client;    

    const server = http.createServer(app);
    const io = socketIo(server); // < Interesting!

    io.on("connection", socket => {        

        console.log("New client connected");

        // Fix max listeners warning in console
        io.setMaxListeners(0);

        // Get the roomCode from the client (React)
        socket.on("clientConnected", (roomCode) => {

            console.log("Room Joined:", roomCode);

            socket.join(roomCode);

            let interval;

            if (interval) {
                clearInterval(interval);
            }            

            interval = setInterval(() => getApiAndEmit(io, roomCode), s3.socketEmitFrequency);

        })    

        socket.on("disconnect", () => {
            console.log("Client disconnected");
        });    
    });

    const getApiAndEmit = async (io, roomCode) => {       
        // Query the DB to get information on the room.        

        const rooms = client.db("scatGrease").collection("rooms");        
    
        const room = await rooms.find({roomCode: roomCode}).sort({db_date: -1}).limit(1).toArray();
        const game = room[0];

        //console.log(game)

        try {
            var res;
            if (game){

                //  Check if the game is started. If it is, check when the start date was... If it was over 3 minutes ago,
                //  set the status of the game to "end". This will happen every time the setInterval happens.
                //  We add an extra 3 seconds to let the data get through...

                if (game.status === 'playing' && moment().diff(game.last_start_date, 'seconds') > s3.secondsPerRound){
                    console.log("Ending the game!");
                    rooms.findOneAndUpdate(     {roomCode: roomCode},
                                                {  $set: {
                                                        status: 'end'
                                                    }
                                                },
                                                { sort: { db_date: -1 } }
                                            )
                }

                res = {
                    success: true,
                    roomId: game._id,
                    roomCode: game.roomCode,
                    playerList: game.playerList,
                    letter: game.letter,
                    questions: game.questions,
                    timeStarted: game.last_start_date,
                    status: game.status
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