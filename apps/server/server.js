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


io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        console.log('join-room', roomId, userId)
        socket.join(roomId)
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
})

io.of("/").adapter.on("join-room", (room, id) => {
    console.log(`!!! socket ${id} has joined room ${room}`);
});

io.of("/").adapter.on("leave-room", (room, id) => {
    console.log(`!! socket ${id} has leaved room ${room}`);
});

server.listen(3000, () => {
    console.log('server started on port', 3000)
})

