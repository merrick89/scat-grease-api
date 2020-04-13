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
const startGame = require("./routes/scatGrease/startGame");

app.use(index);
app.use('/scatGrease/create', create);
app.use('/scatGrease/startGame', startGame);

const uri = `mongodb+srv://${config.user}:${config.password}@merrick-6y73m.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true });

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

        socket.join(`${roomCode}`);

        if (interval) {
            clearInterval(interval);
        }
    
        interval = setInterval(() => getApiAndEmit(socket, roomCode), 1000);

    })    

    socket.on("disconnect", () => {
        console.log("Client disconnected");
        if (interval) {
            clearInterval(interval);
        }
    });    
});

const getApiAndEmit = async (socket, roomCode) => {       
    // Query the DB to get information on the room.
    
    
    try {
        const res = {
            roomCode: roomCode,
            playerList: [
                {name: "Merrick", score:0},
                {name: "Ymilie", score:0},
                {name: "Beshan", score:0},
                {name: "Aneesha", score:0}
            ],
            letter: 'M',
            questions: [
                {id: 1,
                text: "Places to hide a body."},
                {id: 2,
                text: "Things you can put inside yourself."},
                {id: 3,
                text: "Something wet."},
                {id: 4,
                text: "A shitty murder weapon."},
                {id: 5,
                text: "Ways to convince a bouncer to let you in."}
            ],
            timeStarted: moment().format()
        };

        socket.emit("FromAPI", res); // Emitting a new message. It will be consumed by the client        

    } catch (error) {
        console.error(`Error: ${error}`);
    }
};

const port = process.env.PORT || 4001;
server.listen(port, () => console.log(`Listening on port ${port}`));