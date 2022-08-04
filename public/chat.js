let divVideoChatLobby = document.getElementById("video-chat-lobby");
let divVideoChat = document.getElementById("video-chat-room");
let joinButton = document.getElementById("join");
let userVideo = document.getElementById("user-video");
let peerVideo = document.getElementById("peer-video");
let roomInput = document.getElementById("roomName");

joinButton.addEventListener('click', () => {

    if(roomInput.value==""){
        alert("Please enter a room name")
    }
    else{
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

    }
})