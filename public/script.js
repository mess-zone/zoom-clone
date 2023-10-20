const socket = io('/')
const peer = new Peer();

// webRTC connection
peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})


socket.on('user-connected', userId => {
    console.log('user-connected', userId)
})