let socket = io.connect()
let divVideoChatLobby = document.getElementById("video-chat-lobby")
let divVideoChat = document.getElementById("video-chat-room")
let joinButton = document.getElementById("join")
let userVideo = document.getElementById("user-video")
let peerVideo = document.getElementById("peer-video")
let roomInput = document.getElementById("roomName")

let divButtonGroup = document.getElementById("btn-group")
let muteButton = document.getElementById("muteButton")
let hideCameraButton = document.getElementById("hideCameraButton")
let leaveRoomButton = document.getElementById("leaveRoomButton")

let muteFlag = false
let hideCameraFlag = false

let roomName
let creator = false
let rtcPeerConnection
let userStream


let iceServers = { 
    iceServers: [{urls: "stun:stun.l.google.com:19302" }]
}


joinButton.addEventListener('click', () => {
    if(roomInput.value ==""){
        alert("Please enter a room name")
    }
    else{
        roomName = roomInput.value
        socket.emit("join", roomName)
        //alert(socket.connected)

        console.log("roomName from Client: " + roomName)
    }
})



muteButton.addEventListener('click', () => {
    muteFlag = !muteFlag
    if(muteFlag){
        userStream.getTracks()[0].enabled = false
        muteButton.textContent = "Unmute"
    }
    else{
        userStream.getTracks()[0].enabled = true
        muteButton.textContent = "Mute"
    }
})

hideCameraButton.addEventListener('click', () => {
    hideCameraFlag = !hideCameraFlag
    if(hideCameraFlag){
        userStream.getTracks()[1].enabled = false
        hideCameraButton.textContent = "Show Camera"
    }
    else{
        userStream.getTracks()[1].enabled = true
        hideCameraButton.textContent = "Hide Camera"
    }
})

socket.on('created', () => {
    creator = true
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 500, height: 500}
    })
    .then(stream => {
        userStream = stream
        divVideoChatLobby.style.display = "none"
        divButtonGroup.style = "display:flex"
        userVideo.srcObject = stream
        userVideo.onloadedmetadata = function(e) {
        userVideo.play()
        }
    })
    .catch(err => {
        alert('Could not access user media')
    })
})
socket.on('joined', () => {
    creator = false
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 500, height: 500}
    })
    .then(stream => {
        userStream = stream
        divVideoChatLobby.style.display = "none"
        divButtonGroup.style = "display:flex"
        userVideo.srcObject = stream
        userVideo.onloadedmetadata = function(e) {
        userVideo.play()
        }
        socket.emit('ready', roomName)
    })
    .catch(err => {
        alert('Could not access user media')
    })
})
socket.on('full', () => {
    alert("Room is Full, Can't Join ")
})

socket.on('ready', () => {
    if(creator){
        rtcPeerConnection = new RTCPeerConnection(iceServers)
        console.log("on ready",rtcPeerConnection)
        rtcPeerConnection.onicecandidate = OnIceCandidateFunction
        rtcPeerConnection.ontrack = OnTrackFunction
        rtcPeerConnection.addTrack(userStream.getTracks()[0],userStream )
        //with [1] it is video track
        rtcPeerConnection.addTrack(userStream.getTracks()[1],userStream )
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
socket.on('candidate', (candidate) => {
    let icecandidate = new RTCIceCandidate(candidate)
    rtcPeerConnection.addIceCandidate(icecandidate)
})
socket.on('offer', (offer) => {
    if(!creator){
        rtcPeerConnection = new RTCPeerConnection(iceServers)
        console.log("on offer",rtcPeerConnection)
        rtcPeerConnection.onicecandidate = OnIceCandidateFunction
        rtcPeerConnection.ontrack = OnTrackFunction
        rtcPeerConnection.addTrack(userStream.getTracks()[0],userStream )
        //with [1] it is video track
        rtcPeerConnection.addTrack(userStream.getTracks()[1],userStream )
        rtcPeerConnection.setRemoteDescription(offer)
        rtcPeerConnection.createAnswer()
            .then ((answer) => {
                rtcPeerConnection.setLocalDescription(answer)
                socket.emit('answer', answer, roomName)
            })
            .catch((error) => {
                console.log(error)
            })

    }

})
socket.on('answer', (answer) => {
    rtcPeerConnection.setRemoteDescription(answer)
})

leaveRoomButton.addEventListener('click', () => {
    socket.emit("leave", roomName)
    divVideoChatLobby.style = "display:block"
    divButtonGroup.style = "display:none"
    // need to get rid of user video and peer video
    if(userVideo.srcObject){
        userVideo.srcObject.getTracks()[0].stop() //stop audio track
        userVideo.srcObject.getTracks()[1].stop() //stop video track
    }

    if(peerVideo.srcObject){
        peerVideo.srcObject.getTracks()[0].stop() 
        peerVideo.srcObject.getTracks()[1].stop()
    }

    //close connection to the other peer
    if(rtcPeerConnection){
        rtcPeerConnection.ontrack = null
        rtcPeerConnection.onicecandidate = null
        rtcPeerConnection.close()
        rtcPeerConnection = null
    }
})

socket.on("leave", () => {
    creator = true // This person is now the creator as he is the only person in the room.
    if(rtcPeerConnection){
        rtcPeerConnection.ontrack = null
        rtcPeerConnection.onicecandidate = null
        rtcPeerConnection.close()
        rtcPeerConnection = null
    }

    if(peerVideo.srcObject){
        peerVideo.srcObject.getTracks()[0].stop() 
        peerVideo.srcObject.getTracks()[1].stop()
    }
})

function OnIceCandidateFunction (event) {
    if(event.candidate){
        // icecandidate_g = event.candidate
        // console.log("icecandidate_g =" + icecandidate_g)
        // console.log("icecandidate_g =", icecandidate_g)
        // console.log('icecandicate is:', event.candidate)
        socket.emit('candidate', event.candidate, roomName)
    }
}

function OnTrackFunction (event) {
    peerVideo.srcObject = event.streams[0]
    peerVideo.onloadedmetadata = function(e) {
    peerVideo.play()
    }

}