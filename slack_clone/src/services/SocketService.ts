import { Notify } from "quasar";
import { socket } from "src/boot/socket";
import { useAuthStore } from "src/stores/authStore";

const userStore = useAuthStore();

class SocketService {
  send(event: string, body: object) {
    if (['message', 'activity'].includes(event) && userStore.user?.status === 'offline') {
      Notify.create({
        type: 'negative',
        message: 'Action not possible while offline'
      });
      return;
    }
    socket.emit(event, { body });
  }
}

export default new SocketService();