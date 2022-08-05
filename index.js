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
        console.log(rooms)
        //let room = io.sockets.adapter.rooms.get(roomName)

    })
})

