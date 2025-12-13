import { useActivePage } from 'src/stores/threadStore';
import { useAuthStore } from 'src/stores/authStore';
import { router } from 'src/router';
import {
  ChannelType,
  type ChannelAtr,
  type messageType,
  type StatusType,
  type UserAtr,
} from '../components/models';
import { notify, isStatusType, print } from './helperFunctions';
import type { Channel } from 'src/contracts';
//import { HomeService } from 'src/services';
import SocketService from 'src/services/SocketService';
import { HomeService } from 'src/services';

export class CommandHandler {
  commandList = ['list', 'help', 'join', 'kick', 'invite', 'cancel', 'status'];
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
          const channelId = this.activePage.activePageId;
          // emit kick event cez socket (backend rozhodne či je to admin-kick alebo vote-kick)
          SocketService.kickUser(channelId, targetNickname ? targetNickname : '', isAdmin);

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
          //works with nickname or email
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
          SocketService.inviteUser(currentChannelId, invitedUser);
        } else {
          this.output.push('Usage: /invite <nickname or email>');
        }
        break;
      case 'cancel':
        if (this.activePage.isAdmin(this.activePage.activePageId, this.userStore.user?.id as number)) {
          SocketService.deleteChannel(this.activePage.activePageId);
        } else {
          console.log('leaving channel...')
          if (this.userStore.user) {
            SocketService.leaveChannel(this.activePage.activePageId, this.userStore.user.id);
          } else {
            console.error('User is not logged in.');
          }
        }
        break;
      case 'join':
        if (argument && argument.length > 0) {
          // detect optional "[private]" flag at end
          const args = [...argument];
          let isPrivate = false;
          const lastArg = args[args.length - 1];
          if (lastArg && /^\[private\]$/i.test(lastArg.trim())) {
            isPrivate = true;
            args.pop();
          }

          const channelName = args.join(' ').trim();
          if (!channelName) {
            print('Channel name cannot be empty.', this.output);
            break;
          }
          // try to find existing channel by name
          let channel: Channel | 0 = this.activePage.getThreadId(channelName);
          if (channel) {
            // channel exists, just join it
            this.activePage.activePageId = channel.id;
            await router?.push(`/channel/${channel.id}`);
            print(`Joined channel ${channel.name}`, this.output);
          } else {
            const channels = await HomeService.getAllPublicChannels(); // refresh channels
            if (channels) {
              const channel = channels.find((ch) => ch.name === channelName);
              if (channel) {
                // channel exists, join it
                const res2 = await this.activePage.joinChannel(channel.id);
                SocketService.joinChannel(channel.id);
                if (res2) {
                  this.activePage.activePageId = channel.id;
                  await router?.push(`/channel/${channel.id}`);
                  notify(`Joined channel '${channelName}' successfully`, 'positive');
                  print(`Joined channel ${channel.name}`, this.output);
                  break;
                } else {
                  notify(`Failed to join channel '${channelName}'`, 'negative');
                  print('Failed to join channel.', this.output);
                  break;
                }
              }
            }
            // create new channel (use private flag if specified)
            const newChannel = {
              name: channelName,
              type: isPrivate ? ChannelType.Private : ChannelType.Public,
              description: '',
            } as Partial<Channel>;

            const res = await this.activePage.createChannel(newChannel as ChannelAtr);
            if (res) {
              // find the newly created channel
              channel = this.activePage.getThreadId(channelName);
              if (channel) {
                this.activePage.activePageId = channel.id;
                await router?.push(`/channel/${channel.id}`);
                notify(`Channel '${channelName}' created successfully`, 'positive', 'top');
              } else {
                print('Channel created but failed to join.', this.output);
              }
            } else {
              notify(`Failed to create channel '${channelName}'`, 'negative', 'top');
            }
          }
        } else {
          this.output.push('Usage: /join <channel name> [private]');
        }
        break;
      case 'status':
        if (argument) {
          if (argument.length == 1) {
            if (isStatusType(argument[0] as string)) {
              this.output.push(`changing status to ${argument[0]}`);
              
              // emit socket event to broadcast status change
              SocketService.updateStatus(argument[0] as StatusType);
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
