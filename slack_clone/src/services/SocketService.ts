import { Notify } from "quasar";
import { socket } from "src/boot/socket";
import { router } from 'src/router';
 
import { useAuthStore } from "src/stores/authStore";
import { AuthManager } from 'src/services';
import { notify } from "src/utils/helperFunctions";
import type { Activity, Message, Invite, Member } from "src/contracts";
import { useActivePage } from "src/stores/threadStore";
import type { StatusType } from "src/components/models";
import { useNotifications } from 'src/composables/useNotifications'

const userStore = useAuthStore();
const activePage = useActivePage();
const { notifyForMessage } = useNotifications()

class SocketService {
  private socket: typeof socket;
 
   constructor() {
    this.socket = socket;

    // debugging
    // socket listeners
    // this.socket.on('error', (data: { message: string }) => {
    //   console.error('[WS] error received:', data.message);
    //   Notify.create({
    //     type: 'negative',
    //     message: `WebSocket error: ${data.message}`,
    //     position: 'top',
    //   });
    // }); 
    this.socket.on('connect', () => {
      console.log('[WS] connected', this.socket.id);
      // status is set to online automatically by the backend on connect
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WS] disconnected', reason);
      // status is set to offline automatically by the backend on disconnect
    });

    this.socket.on('connect_error', (error) => console.error('[WS] error', error.message));

    this.socket.on('newActivity', (data: Activity) => activePage.addActivity(data));

    this.socket.on('message', (data: { messages: Message[]; isNew?: boolean }) => {
      console.log('got messages', data.messages);
      try {
        activePage.loadMessages(data.messages, data.isNew ?? false);
        // data.messages?.forEach((message) => {
        //   void notifyForMessage(message);
        // });
      } catch (error) {
        console.error('message handler error', error);
      }
    });

    this.socket.on('notification', (data: { message: Message, channel: string }) => {
      void notifyForMessage(data.message, data.channel);
    });

    this.socket.on('channelDeleted', async (data: { channelId: number }) => {
      try {
        await activePage.removeChannel(data.channelId);
      } catch (e) {
        console.error('channelDeleted handler error', e);
      }
    });

    this.socket.on('joinedChannel', async (data: { channelId: number; userId: number; nickname: string }) => {
      try {
        await activePage.getMembers(data.channelId);
        if (userStore.user && userStore.user.id === data.userId) {
          //notify(`You have joined the channel successfully!`, 'positive', 'top');  
        } else {
          notify(`User ${data.nickname} has joined the channel!`, 'positive', 'top');
        }
      } catch (e) {
        console.error('joinChannel handler error', e);
      }
    }); 

    this.socket.on('leaveChannel', async (data: { channelId: number; userId: number }) => {
      try {
        activePage.removeMember(data.channelId, data.userId);
        if (userStore.user && userStore.user.id === data.userId) {
          await router?.push('/channel');
          activePage.activePageId = -1;
          notify(`You have left the channel.`, 'positive', 'top');  
        }
      } catch (e) {
        console.error('leaveChannel handler error', e);
      }
    });

    this.socket.on('userKicked', async (data: { channelId: number; userId: number; nickname: string; permanent?: boolean; voteKick?: boolean }) => {
      try {
        activePage.removeMember(data.channelId, data.userId);
        const reason = data.voteKick ? '(vote-kick threshold reached)' : data.permanent ? '(admin kick)' : '';
        if (userStore.user && userStore.user.id === data.userId) {
          notify(`You were kicked from channel ${reason}`, 'negative', 'top');
          await router?.push('/channel');
          
        }else {
          notify(`User ${data.nickname} was kicked from channel ${reason}`, 'positive', 'top');
        }
      } catch (e) {
        console.error('userKicked handler error', e);
      }
    });

    this.socket.on('kickVoteAdded', (data: { channelId: number; targetUserId: number; nickname: string; voteCount: number }) => {
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

    this.socket.on('userStatusChanged', (data: { userId: number; nickname: string; status: StatusType }) => {
      try {
        const auth = useAuthStore();

        // update authStore if this is the current user
        if (auth.user && auth.user.id === data.userId) {
          auth.changeStatus(data.status);
          console.log(`Your status changed to ${data.status}`);
          if (data.status === 'online') {
            this.subscribeToChannel(activePage.activePageId);
            console.log('Refreshing channels on status online');
            //await activePage.loadMessages();
          }
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

    this.socket.on('inviteSent', (data: { channelId: number; slug: string }) => {
      if (data) {
        Notify.create({
          type: 'positive',
          message: `Invitation sent successfully to user: ${data.slug}!`,
          position: 'top',
        });
      } else {
        Notify.create({
          type: 'negative',
          message: "Invitation failed :(",
          position: 'top',
        });
      }
    });

    this.socket.on('inviteReceived', (data: Invite) => {
      console.log('Invite received:', data);
      console.log('current active page: ', useActivePage().activePageId);
      useActivePage().invites.push(data);

      Notify.create({
        type: 'info',
        message: `You have been invited to join ${data.channel.name} by user ID ${data.senderId}.`,
        position: 'top',
      });
    });

    this.socket.on('invite_error', (data: { message: string }) => {
      notify('Invite error: ' + data.message, 'negative', 'top');
    }); 

    //auth logic
    AuthManager.onChange((newToken) => {
      // Reset socket when token is changed
      if (newToken !== null) {
        if (this.socket.connected) this.socket.disconnect();
        this.socket.auth = { token: newToken };
        this.socket.connect();
      }
    });

    AuthManager.onLogout(() => {
      // Disconnect socket when user logs out
      if (this.socket.connected) {
        this.socket.disconnect();
        this.socket.auth = {};
      }
    });
  }

  //socket on

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  turnOn(event: string, handler: (...data: any[]) => void) {
    this.socket.on(event, handler);
  }

  //socket off

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  turnOff(event: string, handler: (...data: any[]) => void) {
    this.socket.off(event, handler);
  }

  //socket emiters

  send(event: string, body: object) {
    if (['message', 'activity'].includes(event) && userStore.user?.status === 'offline')  {
      notify('Action not possible while offline', 'negative');
      return;
    }
    this.socket.emit(event, { body });
  }
  inviteUser(channelId: number, slug: string) {
      this.socket.emit('inviteUser', {
      channelId: channelId,
      slug: slug,
    });
  }
  updateStatus(status: StatusType) {
    this.socket.emit('updateStatus', { status });
  }
  subscribeToChannel(id: number) {
    this.socket.emit('subscribe', { channelId: id});
  }
  kickUser(channelId: number, targetNickname: string, isAdmin: boolean) {
    this.socket.emit('kickUser', {
      channelId: channelId,
      targetNickname,
      isAdmin
    });
  }
  deleteChannel(channelId: number) {
    this.socket.emit('deleteChannel', { channelId });
    notify(`You successfully deleted the channel!`, 'positive');
  }
  leaveChannel(channelId: number, userId: number) {
    this.socket.emit('leaveChannel', { channelId, userId });
    notify(`You successfully left the channel!`, 'positive');
  }
  loadMessages(params: { perPage: number; createdAt?: string }) {
    this.socket.emit('loadMessages', params);
  }
  joinChannel(channelId: number) {
    this.socket.emit('joinChannel', { channelId });
  } 
}

export default new SocketService();