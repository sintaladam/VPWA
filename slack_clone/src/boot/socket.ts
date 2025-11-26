import { defineBoot } from '#q-app/wrappers';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import type { Message } from 'src/contracts';
import { AuthManager } from 'src/services';
import { useActivePage } from 'src/stores/threadStore';
import { useNotifications } from 'src/composables/useNotifications'
import { Notify } from 'quasar'

declare module 'vue' {
  interface ComponentCustomProperties {
    $socket: Socket;
  }
}

const activePage = useActivePage();
const { notifyForMessage } = useNotifications()


const socket = io(process.env.API_URL, {
  autoConnect: false,
})

socket.on('connect', () => console.log('[WS] connected', socket.id))
socket.on('disconnect', (r) => console.log('[WS] disconnected', r))
socket.on('connect_error', (e) => console.error('[WS] error', e.message))

socket.on('message', (data: { messages: Message[] }) => {
    try {
      activePage.loadMessages(data.messages)
      data.messages?.forEach(m => {
        void notifyForMessage(m)
      })
    } catch (e) {
      console.error('message handler error', e)
    }

});
socket.on('channelDeleted', (data: { channelId: number }) => {
  try {
    activePage.removeChannel(data.channelId);
  } catch (e) {
    console.error('channelDeleted handler error', e);
  }
});
socket.on('leaveChannel', (data: { channelId: number; userId: number }) => {
  try {
    activePage.removeMember(data.channelId, data.userId);
  } catch (e) {
    console.error('leaveChannel handler error', e);
  }
});

socket.on('userKicked', (data: { channelId: number; userId: number; nickname: string; permanent?: boolean; voteKick?: boolean }) => {
  try {
    activePage.removeMember(data.channelId, data.userId);
    const reason = data.voteKick ? '(vote-kick threshold reached)' : data.permanent ? '(admin kick)' : '';
    Notify.create({
      type: 'negative',
      message: `User ${data.nickname} was kicked from channel ${reason}`,
      position: 'top',
    });
  } catch (e) {
    console.error('userKicked handler error', e);
  }
});

socket.on('kickVoteAdded', (data: { channelId: number; targetUserId: number; nickname: string; voteCount: number }) => {
  try {
    Notify.create({
      type: 'warning',
      message: `Kick vote for ${data.nickname}: ${data.voteCount}/3`,
      position: 'top',
    });
  } catch (e) {
    console.error('kickVoteAdded handler error', e);
  }
});

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