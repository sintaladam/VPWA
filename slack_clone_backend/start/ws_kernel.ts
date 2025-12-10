import app from '@adonisjs/core/services/app'
import server from '@adonisjs/core/services/server'
import { Server } from 'socket.io'
import { broadcastingChannels, ChannelListener } from '../app/misc/channelEvents.js';
import socket_service from '#services/socket_service';
import auth_service from '#services/auth_service';
import User from '#models/user';
import db from '@adonisjs/lucid/services/db';

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

    const broadcasts = broadcastingChannels;

    io.on('connection', async (socket) => {
        const listener = new ChannelListener(socket, broadcasts);
        const user = socket.data.user;
        console.log('new connection', socket.id, user.nickname);

        // set user status to online on connect
        try {
            // await User.query()
            //     .where('id', user.id)
            //     .update({ status: 'online' });
            
            // // get all channels this user is in
            // const userChannels = await db
            //     .from('user_channels')
            //     .where('user_id', user.id)
            //     .select('channel_id');

            // // broadcast status change to all channels user is member of
            // for (const uc of userChannels) {
            //     broadcasts.broadcastToChannel(uc.channel_id, 'userStatusChanged', {
            //         userId: user.id,
            //         nickname: user.nickname,
            //         status: 'online'
            //     });
            // }

            // if (listener.getChannelId == null) listener.send('userStatusChanged', {
            //     userId: user.id,
            //     nickname: user.nickname,
            //     status: 'online'
            // });
            socket_service.handle('updateStatus', { status: 'online'} as any, listener);

        } catch (err) {
            console.error('Failed to set online status', err);
        }

        socket.onAny((event, ...args) => {
            socket_service.handle(event, args[0], listener);
        })

        socket.on('disconnect', async () => {
            listener.unsubscribe();
            console.log('disconnected', socket.id, user.nickname);
            
            // set user status to offline on disconnect
            try {
                await User.query()
                    .where('id', user.id)
                    .update({ status: 'offline' });
                
                // get all channels this user is in
                const userChannels = await db
                    .from('user_channels')
                    .where('user_id', user.id)
                    .select('channel_id');

                // broadcast status change to all channels user is member of
                for (const uc of userChannels) {
                    broadcasts.broadcastToChannel(uc.channel_id, 'userStatusChanged', {
                        userId: user.id,
                        nickname: user.nickname,
                        status: 'offline'
                    });
                }
            } catch (err) {
                console.error('Failed to set offline status', err);
            }
        });
    })

    console.log('socket started');
});