import { defineBoot } from '#q-app/wrappers';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import type { Activity, Member, Message, Invite } from 'src/contracts';
import type { StatusType } from 'src/components/models'

import { AuthManager } from 'src/services';
import { useActivePage } from 'src/stores/threadStore';
import { useAuthStore } from 'src/stores/authStore';
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

socket.on('connect', () => {
  console.log('[WS] connected', socket.id);
  // status is set to online automatically by the backend on connect
})
socket.on('disconnect', (r) => {
  console.log('[WS] disconnected', r);
  // status is set to offline automatically by the backend on disconnect
})
socket.on('connect_error', (e) => console.error('[WS] error', e.message))
socket.on('newActivity', (data: Activity) => activePage.addActivity(data))

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
socket.on('userStatusChanged', (data: { userId: number; nickname: string; status: StatusType }) => {
  try {
    const auth = useAuthStore();
    
    // update authStore if this is the current user
    if (auth.user && auth.user.id === data.userId) {
      auth.changeStatus(data.status);
    }
    // update in members list for display in UI
    const member = activePage.members.find(m => m.id === data.userId);
    if (member) {
      (member as Member).status = data.status;
    }
    
    console.log(`User ${data.nickname} status changed to ${data.status}`);
  } catch (e) {
    console.error('userStatusChanged handler error', e);
  }
});

AuthManager.onChange((newToken) => { //reset socket when token is changed
  if (newToken !== null) {
    if (socket.connected) socket.disconnect();
    socket.auth = { token: newToken };
    socket.connect();
  }
})
socket.on('inviteSent', (data: { success: boolean; message: string }) => {
  if (data.success) {
    Notify.create({
      type: 'positive',
      message: data.message,
      position: 'top',
    });
  } else {
    Notify.create({
      type: 'negative',
      message: data.message,
      position: 'top',
    });
  }
});

socket.on('inviteReceived', (data: Invite) => {
  console.log('Invite received:', data);

  useActivePage().invites.push(data);

  Notify.create({
    type: 'info',
    message: `You have been invited to join ${data.channel.name} by user ID ${data.senderId}.`,
    position: 'top',
  });
});

AuthManager.onLogout(() => { //disconnect socket when user logs out
  if (socket.connected) {
    socket.disconnect();
    socket.auth = {};
  }
})

export default defineBoot(({ app }) => {
  app.config.globalProperties.$socket = socket;

});

export { socket }