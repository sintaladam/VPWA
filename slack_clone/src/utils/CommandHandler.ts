import { useActivePage } from 'src/stores/threadStore';
import { useAuthStore } from 'src/stores/authStore';
import { useRouter } from 'vue-router';
import {
  ChannelType,
  type ChannelAtr,
  type messageType,
  type StatusType,
  type UserAtr,
} from '../components/models';
import { notify, isStatusType, print } from './helperFunctions';

import { socket } from 'src/boot/socket';
//import { Notify } from 'quasar'

import type { Channel } from 'src/contracts';
import { HomeService } from 'src/services';

export class CommandHandler {
  commandList = ['list', 'help', 'join', 'kick', 'invite', 'cancel', 'status'];
  router = useRouter();
  activePage = useActivePage();
  userStore = useAuthStore();
  output = [''];  

  handle = async (
    command: string,
    argument?: string[],
  ): Promise<{ type?: messageType; output: string | string[] | UserAtr[] }> => {
    this.output = [];
    switch (command) {
      case 'list': {
        await this.activePage.getMembers(this.activePage.activePageId);
        const users: UserAtr[] = this.activePage.members as UserAtr[];
        if (users && users.length > 0) {
          return { type: 'component', output: users };
        } else {
          print('No users found.', this.output);
        }
        break;
      }
      case 'help':
        print(`available commands: ${this.commandList.join(', ')}`, this.output);
        break;
      case 'kick':
        if (argument && argument.length === 1) {
          const targetNickname = argument[0];
          const isAdmin = this.activePage.isAdmin(
            this.activePage.activePageId,
            this.userStore.user?.id as number
          );

          // emit kick event cez socket (backend rozhodne či je to admin-kick alebo vote-kick)
          socket.emit('kickUser', {
            channelId: this.activePage.activePageId,
            targetNickname,
            isAdmin
          });

          if (isAdmin) {
            print(`Kicked user ${targetNickname} from channel.`, this.output);
          } else {
            print(`Voted to kick ${targetNickname}. 3 votes needed for ban.`, this.output);
          }
        } else {
          this.output.push('Usage: /kick <nickname>');
        }
        break;
      case 'revoke':
        //kick users from private channel only admin
        break;
      case 'invite':
        if (argument && argument.length > 0) {
          const invitedUser = argument.join(' ').trim();
          if (!invitedUser) {
            print('User nickname or email cannot be empty.', this.output);
            break;
          }
          // get current channel id
          const currentChannelId = this.activePage.activePageId;
          if (!currentChannelId) {
            print('You must be in a channel to invite someone.', this.output);
            break;
          }
          // send invite
          const res = await HomeService.createInvite(currentChannelId, invitedUser);
          if (res) {
            notify(`Invitation sent to ${invitedUser}`, 'positive');
            print(`Invitation sent to ${invitedUser}`, this.output);
          } else {
            notify(`Failed to invite ${invitedUser}`, 'negative');
            print(`Failed to invite ${invitedUser}`, this.output);
          }
        } else {
          this.output.push('Usage: /invite <nickname or email>');
        }
        break;
      case 'cancel':
        if (this.activePage.isAdmin(this.activePage.activePageId, this.userStore.user?.id as number)) {
          socket.emit('deleteChannel', { channelId: this.activePage.activePageId });
          notify(`You successfully deleted the channel!`, 'positive');
        } else {
          console.log('leaving channel...')
          if (this.userStore.user) {
            socket.emit('leaveChannel', { channelId: this.activePage.activePageId, userId: this.userStore.user.id });
            notify(`You successfully left the channel!`, 'positive');
          } else {
            console.error('User is not logged in.');
          }
        }
        break;
      case 'join':
        if (argument && argument.length > 0) {
          const channelName = argument.join(' ').trim();
          if (!channelName) {
            print('Channel name cannot be empty.', this.output);
            break;
          }
          // try to find existing channel by name
          let channel: Channel | 0 = this.activePage.getThreadId(channelName);
          if (channel) {
            // channel exists, just join it
            this.activePage.activePageId = channel.id;
            await this.router.push(`/channel/${channel.id}`);
            print(`Joined channel ${channel.name}`, this.output);
          } else {
            // create new channel
            const newChannel = {
              name: channelName,
              type: ChannelType.Public,
              description: '',
            } as Partial<Channel>;

            const res = await this.activePage.createChannel(newChannel as ChannelAtr);
            if (res) {
              // find the newly created channel
              channel = this.activePage.getThreadId(channelName);
              if (channel) {
                this.activePage.activePageId = channel.id;
                await this.router.push(`/channel/${channel.id}`);
                notify(`Channel '${channelName}' created successfully`, 'positive');
                print(`Created and joined channel ${channel.name}`, this.output);
              } else {
                print('Channel created but failed to join.', this.output);
              }
            } else {
              notify(`Failed to create channel '${channelName}'`, 'negative');
              print('Failed to create channel.', this.output);
            }
          }
        } else {
          this.output.push('Usage: /join <channel name>');
        }
        break;
      case 'status':
        if (argument) {
          if (argument.length == 1) {
            if (isStatusType(argument[0] as string)) {
              this.output.push(`changing status to ${argument[0]}`);
              
              // emit socket event to broadcast status change
              socket.emit('updateStatus', { status: argument[0] as StatusType });
            } else this.output.push('Wrong status type: online, offline, DND');
          } else {
            this.output.push(`You provided ${argument.length} arguments but only 1 is needed`);
          }
        } else {
          this.output.push('No arguments provided');
        }
        break;
      default:
        print('Unknown command. type /help for available commands', this.output);
    }
    return { type: 'message', output: this.output.join('\n') };
  };
}
