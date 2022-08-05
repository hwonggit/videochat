let socket = io.connect()
let divVideoChatLobby = document.getElementById("video-chat-lobby")
let divVideoChat = document.getElementById("video-chat-room")
let joinButton = document.getElementById("join")
let userVideo = document.getElementById("user-video")
let peerVideo = document.getElementById("peer-video")
let roomInput = document.getElementById("roomName")
let roomName

let creator = false
let rtcPeerConnectionlet
let userStream


let iceServers = { 
    iceServers: [{urls: "stun:stun.l.google.com:19302" }]
}


joinButton.addEventListener('click', () => {

    if(roomInput.value==""){
        alert("Please enter a room name")
    }
    else{
        roomName = roomInput.value
        socket.emit("join", roomName)
        console.log("roomName from Client: " + roomName)
    }
})

socket.on("created", () => {
    creator = true
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { width: 500, height: 500}
    })
    .then(stream => {
        userStream = stream
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
        userStream = stream
        divVideoChatLobby.style.display = "none"
        userVideo.srcObject = stream
        userVideo.onloadedmetadata = function(e) {
        userVideo.play()
        socket.emit("ready", roomName)
        }
    })
    .catch(err => {
        alert('Could not access user media')
    })
})
socket.on("full", () => {
    alert("Room is Full, Can't Join ")
})

socket.on("ready", () => {
    console.log("Ready received by client")
    console.log("creator = " + creator)
    if(creator){
        rtcPeerConnection = new RTCPeerConnection(iceServers)
        console.log(rtcPeerConnection)
        rtcPeerConnection.onicecandidate = OnIceCandidateFunction
        rtcPeerConnection.ontrack = OnTrackFunction
        rtcPeerConnection.addTrack(userStream.getTracks()[0],userStream )
        //with [1] it is video track
        //rtcPeerConnection.addTrack(userStream.getTracks()[1],userStream )
        rtcPeerConnection.createOffer()
            .then ((offer) => {
                rtcPeerConnection.setLocalDescription(offer)
                socket.emit('offer', offer, roomName)
            })
            .catch((error) => {
                console.log(error)
            })

    }
})
socket.on("candidate", () => {})
socket.on("offer", () => {})
socket.on("answer", () => {})

function OnIceCandidateFunction (event) {
    if(event.candidate){
        console.log('icecandicate is:', event.candidate)
        socket.emit('candidate', event.candidate, roomName)
    }
}

function OnTrackFunction (event) {
    peerVideo.srcObject = event.stream[0]
    peerVideo.onloadedmetadata = function(e) {
    peerVideo.play()
    }

}