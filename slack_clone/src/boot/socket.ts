import { defineBoot } from '#q-app/wrappers';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

declare module 'vue' {
  interface ComponentCustomProperties {
    $socket: Socket;
  }
}

const socket = io(process.env.API_URL, {
  autoConnect: false,
})

export default defineBoot(({ app }) => {
  app.config.globalProperties.$socket = socket;

});

export { socket }