const cors = require('cors')

const { v4: uuidV4 } = require('uuid')

const express = require('express')
const app = express()
app.use(cors())

const server = require('http').Server(app)

const io = require('socket.io')(server, {
    cors: {
        origin: "*",
    }
})

// TODO deprecated
// app.set('view engine', 'ejs')
// app.use(express.static('public'))

// app.get('/', (req, res) => {
//     res.redirect(`/${uuidV4()}`)
// })

// generate room id
app.get('/api/room', (req, res) => {
    res.json({ roomId: uuidV4() })
})


// app.get('/:room', (req, res) => {
//     res.render('room', { roomId: req.params.room })
// })

const rooms = new Map()

function createRoom(id) {
    rooms.set(id, [])
    console.log(rooms)
}

function deleteRoom(id) {
    rooms.delete(id)
    console.log(rooms)
}

/**
 * 
 * user: { roomId: string, socketId: string, peerId: string } 
 */
function joinUser(user) {
    rooms.get(user.roomId).push(user)
    console.log(rooms)
}

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        console.log('join-room', socket.id, roomId, userId)
        socket.join(roomId)
        joinUser({
            roomId: roomId,
            socketId: socket.id,
            peerId: userId,
        })
        socket.to(roomId).emit('user-connected', userId)

        socket.on('disconnect', () => {
            console.log('disconnect', roomId, userId)
            socket.to(roomId).emit('user-disconnected', userId)
        })
    })

    socket.on('leave-room', (roomId, userId) => {
        console.log('leave-room', roomId, userId)
        socket.leave(roomId)
        socket.to(roomId).emit('user-disconnected', userId)
    })


    io.of("/").adapter.on("join-room", (room, id) => {
        if(room === id) return // ignora global room events
        console.log(`!!! socket ${id} has joined room ${room}`);
    });
    
    io.of("/").adapter.on("leave-room", (room, id) => {
        if(room === id) return // ignore global room events
        console.log(`!! socket ${id} has leaved room ${room}`);
    });
})

io.of("/").adapter.on("create-room", (room) => {
    console.log(`#### created room ${room}`);
    createRoom(room)
});

io.of("/").adapter.on("delete-room", (room) => {
    console.log(`#### deleted room ${room}`);
    deleteRoom(room)
});

server.listen(3000, () => {
    console.log('server started on port', 3000)
})

