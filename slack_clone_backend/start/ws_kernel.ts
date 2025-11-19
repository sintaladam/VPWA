import app from '@adonisjs/core/services/app'
import server from '@adonisjs/core/services/server'
import { Server } from 'socket.io'
import { BroadcastingChannels, ChannelListener } from '../app/misc/channelEvents.js';
import socket_service from '#services/socket_service';
import { args } from '@adonisjs/core/ace';

app.ready(() => {
    const io = new Server(server.getNodeServer(), {
        cors: {
            origin: '*',
        },
    });

    const broadcasts = new BroadcastingChannels();
    const handler = socket_service;


    io.on('connection', (socket) => {
        const listener = new ChannelListener(socket, broadcasts);
        console.log('new connection', socket.id);

        listener.subscribe(1);

        // socket.on('message', (data) => {
        //     console.log('new message:', data);
        //     // Broadcast to everyone (except sender)
        //     // socket.broadcast.emit('message', data);
        //     handler.handle(data, listener);
        // });

        socket.onAny((event, ...args) => {
            handler.handle(event, args[0], listener);
        })

        socket.on('disconnect', () => {
            listener.unsubscribe();
            console.log('diconnected', socket.id);
    });
  })

    console.log('socket started');
});