let socket = io.connect()
let divVideoChatLobby = document.getElementById("video-chat-lobby")
let divVideoChat = document.getElementById("video-chat-room")
let joinButton = document.getElementById("join")
let userVideo = document.getElementById("user-video")
let peerVideo = document.getElementById("peer-video")
let roomInput = document.getElementById("roomName")
let roomName = roomInput.value

let creator = false

joinButton.addEventListener('click', () => {

    if(roomInput.value==""){
        alert("Please enter a room name")
    }
    else{
        socket.emit("join", roomName)
    }
})

socket.on("created", () => {
    creator = true
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { width: 500, height: 500}
    })
    .then(stream => {
        divVideoChatLobby.style.display = "none"
        userVideo.srcObject = stream
        userVideo.onloadedmetadata = function(e) {
        userVideo.play()
        }
    })
    .catch(err => {
        alert('Could not access user media')
    })
})
socket.on("joined", () => {
    creator = false
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { width: 500, height: 500}
    })
    .then(stream => {
        divVideoChatLobby.style.display = "none"
        userVideo.srcObject = stream
        userVideo.onloadedmetadata = function(e) {
        userVideo.play()
        }
    })
    .catch(err => {
        alert('Could not access user media')
    })
})
socket.on("full", () => {
    alert("Room is Full, Can't Join ")
})



socket.on("ready", () => {})
socket.on("candidate", () => {})
socket.on("offer", () => {})
socket.on("answer", () => {})