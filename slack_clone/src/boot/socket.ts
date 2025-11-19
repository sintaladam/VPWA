import { defineBoot } from '#q-app/wrappers';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import type { Message } from 'src/contracts';
import { useActivePage } from 'src/stores/threadStore';

declare module 'vue' {
  interface ComponentCustomProperties {
    $socket: Socket;
  }
}

const activePage = useActivePage();

const socket = io(process.env.API_URL, {
  
})

socket.on('connect', () => console.log('[WS] connected', socket.id))
socket.on('disconnect', (r) => console.log('[WS] disconnected', r))
socket.on('connect_error', (e) => console.error('[WS] error', e.message))

socket.on('message', (data: Message) => activePage.loadMessages([data]))

export default defineBoot(({ app }) => {
  app.config.globalProperties.$socket = socket;

});

export { socket }