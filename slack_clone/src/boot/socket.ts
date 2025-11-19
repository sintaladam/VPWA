import { defineBoot } from '#q-app/wrappers';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import type { Message } from 'src/contracts';
import { AuthManager } from 'src/services';
import { useActivePage } from 'src/stores/threadStore';

declare module 'vue' {
  interface ComponentCustomProperties {
    $socket: Socket;
  }
}

const activePage = useActivePage();

const socket = io(process.env.API_URL, {
  autoConnect: false,
})

socket.on('connect', () => console.log('[WS] connected', socket.id))
socket.on('disconnect', (r) => console.log('[WS] disconnected', r))
socket.on('connect_error', (e) => console.error('[WS] error', e.message))

socket.on('message', (data: { messages: Message[] }) => activePage.loadMessages(data.messages))


AuthManager.onChange((newToken) => {
  if (newToken !== null) {
    if (socket.connected) socket.disconnect();
    socket.auth = { token: newToken };
    socket.connect();
  }
})

AuthManager.onLogout(() => {
  if (socket.connected) {
    socket.disconnect();
    socket.auth = {};
  }
})

export default defineBoot(({ app }) => {
  app.config.globalProperties.$socket = socket;

});

export { socket }