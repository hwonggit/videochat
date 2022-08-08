const https = require("https")
const fs = require ("fs") 

const express = require("express")
const socket = require("socket.io")
const app = express()

const path = require("path");
//const file = fs.readFileSync(path.resolve(__dirname, "../file.xml"));

const options = {
    key: fs.readFileSync("./certificates/192.168.1.104-key.pem"),
    cert: fs.readFileSync("./certificates/192.168.1.104.pem")
}
console.log("options: ", options)



let httpServer = app.listen(4002, () =>{
    console.log("server is running")
})


let httpsServer = https
    .createServer(options, app)
    .listen(4000, () => {
        console.log("server is running at port 4000")
    })



app.use(express.static("public"))

let io = socket(httpsServer)

io.on("connection", (socket) =>{
    console.log("User connected:" + socket.id)

    socket.on("join", (roomName) => {
        let rooms = io.sockets.adapter.rooms
        //let room = io.sockets.adapter.rooms.get(roomName)
        let room = rooms.get(roomName)

        if (room == undefined){
            // create a room if undefined
            socket.join(roomName)
            socket.emit("created")
        }
        else if (room.size==1){
            socket.join(roomName)
            socket.emit("joined")

        }
        else{
            socket.emit("full")
        }
        console.log(rooms)

    })

    socket.on("ready", (roomName) => {
        console.log("Ready")
        console.log("Roomname: " + roomName)
        socket.broadcast.to(roomName).emit("ready")
    })

    socket.on("candidate", (candidate, roomName) => {
        console.log(candidate)
        socket.broadcast.to(roomName).emit("candidate", candidate)
    })

    socket.on("offer", (offer, roomName) => {
        console.log(offer)
        socket.broadcast.to(roomName).emit("offer", offer)
    })

    socket.on("answer", (answer, roomName) => {
        console.log("Answer")
        socket.broadcast.to(roomName).emit("answer", answer)
    })

    socket.on("leave", (roomName) => {
        socket.leave(roomName)
        socket.broadcast.to(roomName).emit("leave")
    })
})

