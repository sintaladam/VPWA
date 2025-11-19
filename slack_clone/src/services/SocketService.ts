import { socket } from "src/boot/socket";

class SocketService {
  send(event: string, body: object) {
    socket.emit(event, { body });
  }
}

export default new SocketService();