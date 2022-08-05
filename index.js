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
            console.log ("Room Created")
        }
        else if (room.size==1){
            socket.join(roomName)
            console.log("Room Joined")
        }
        else{
            console.log("Room Full for Now") 
        }
        console.log(rooms)

    })
})

