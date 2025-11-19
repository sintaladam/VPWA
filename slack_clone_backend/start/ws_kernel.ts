import app from '@adonisjs/core/services/app'
import server from '@adonisjs/core/services/server'
import { Server } from 'socket.io'
import { BroadcastingChannels, ChannelListener } from '../app/misc/channelEvents.js';
import socket_service from '#services/socket_service';
import auth_service from '#services/auth_service';

app.ready(() => {
    const io = new Server(server.getNodeServer(), {
        cors: {
            origin: '*',
        },
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Missing token'));
            }

            const user = await auth_service.verifyToken(token);
            if (!user) {
                return next(new Error('Invalid token'));
            }

            socket.data.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication failed'));
        }
    });

    const broadcasts = new BroadcastingChannels();

    io.on('connection', (socket) => {
        const listener = new ChannelListener(socket, broadcasts);
        console.log('new connection', socket.id);

        socket.onAny((event, ...args) => {
            socket_service.handle(event, args[0], listener);
        })

        socket.on('disconnect', () => {
            listener.unsubscribe();
            console.log('diconnected', socket.id);
        });
    })

    console.log('socket started');
});