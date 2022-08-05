const express = require("express")
const socket = require("socket.io")
const app = express()

let server = app.listen(4000, () =>{
    console.log("server is running")
})

app.use(express.static("public"))

let io = socket(server)

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
        socket.broadcast.to(roomName).emit("ready")
    })

    socket.on("candidate", (candidate, roomName) => {
        console.log("Candidate")
        socket.broadcast.to(roomName).emit("candidate", candidate)
    })

    socket.on("offer", (offer, roomName) => {
        console.log("Offer")
        socket.broadcast.to(roomName).emit("offer", offer)
    })

    socket.on("answer", (answer, roomName) => {
        console.log("Answer")
        socket.broadcast.to(roomName).emit("answer", answer)
    })
})

