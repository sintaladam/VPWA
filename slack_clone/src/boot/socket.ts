import { defineBoot } from '#q-app/wrappers';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

declare module 'vue' {
  interface ComponentCustomProperties {
    $socket: Socket;
  }
}

const socket = io(process.env.API_URL, {
  
})

socket.on('connect', () => console.log('[WS] connected', socket.id))
socket.on('disconnect', (r) => console.log('[WS] disconnected', r))
socket.on('connect_error', (e) => console.error('[WS] error', e.message))

export default defineBoot(({ app }) => {
  app.config.globalProperties.$socket = socket;

});

export { socket }