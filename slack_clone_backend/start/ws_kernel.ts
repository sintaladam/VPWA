import app from '@adonisjs/core/services/app'
import server from '@adonisjs/core/services/server'
import { Server } from 'socket.io'

app.ready(() => {
    const io = new Server(server.getNodeServer(), {
        cors: {
            origin: '*',
        },
    });


    io.on('connection', (socket) => {
        console.log('new connection', socket.id);

        socket.on('message', (data) => {
            console.log('new message:', data);
            // Broadcast to everyone (except sender)
            socket.broadcast.emit('message', data);
        });

        socket.on('disconnect', () => {
            console.log('diconnected', socket.id);
    });
  })

    console.log('socket started');
});