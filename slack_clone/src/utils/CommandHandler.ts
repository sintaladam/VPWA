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
import { socket } from 'src/boot/socket';
import { Notify } from 'quasar'

import type { Channel } from 'src/contracts';
import { HomeService } from 'src/services';

function isStatusType(value: string): value is StatusType {
  return ['online', 'offline', 'dnd'].includes(value);
}

export class CommandHandler {
  commandList = ['list', 'help', 'join'];
  router = useRouter();
  activePage = useActivePage();
  userStore = useAuthStore();
  output = [''];

  print(value: string): void {
    this.output.push(value);
  }

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
          this.output.push('No users found.');
        } 
        break;
      }
      case 'help':
        this.output.push(`available commands: ${this.commandList.join(', ')}`);
        break;
      // case 'kick':
      //   if (!this.activePage.isAdmin(this.activePage.activePageId, this.userStore.user?.id as number)) {
      //     if (argument && argument.length > 0 && argument.length < 2) {
      //       const output = this.activePage.voteKickUser(
      //         argument[0]!,
      //         this.userStore.user?.id as number,
      //         this.activePage.activePageId,
      //       );
      //       if (output) {
      //         this.print(output);
      //       }
      //     } else {
      //       this.print('Invalid number of arguments');
      //     }
      //   } else {
      //     if (argument && argument.length > 0) {
      //       const userIds = argument
      //         .map((name) => {
      //           const userEntry = Object.values(this.activePage.users).find(
      //             (u) => u.nickname === name,
      //           );
      //           return userEntry?.id;
      //         })
      //         .filter(Boolean) as number[]; // remove undefined (nicknames not found)

      //       if (userIds.length > 0) {
      //         this.activePage.removeUsersFromThread(this.activePage.activePageId, userIds);
      //         const kickedNames = userIds
      //           .map((id) => this.activePage.users[id]?.nickname ?? 'Unknown')
      //           .join(', ');
      //         this.output.push(`Kicked user(s): ${kickedNames}`);
      //       } else {
      //         this.output.push('No valid users found to kick by nickname.');
      //       }
      //     }
      //   }
      //   break;
      case 'revoke':
        //kick users from private channel only admin
        break;
      case 'invite':
        if (argument && argument.length > 0) {
          const invitedUser = argument.join(' ').trim();
          if (!invitedUser) {
            this.output.push('User nickname or email cannot be empty.');
            break;
          }

          // get current channel id
          const currentChannelId = this.activePage.activePageId;
          if (!currentChannelId) {
            this.output.push('You must be in a channel to invite someone.');
            break;
          }

          // send invite
          const res = await HomeService.createInvite(currentChannelId, invitedUser);
          if (res) {
            Notify.create({ 
              type: 'positive', 
              message: `Invitation sent to ${invitedUser}` 
            });
            this.output.push(`Invitation sent to ${invitedUser}`);
          } else {
            Notify.create({ 
              type: 'negative', 
              message: `Failed to invite ${invitedUser}` 
            });
            this.output.push(`Failed to invite ${invitedUser}`);
          }
        } else {
          this.output.push('Usage: /invite <nickname or email>');
        }
        break;
      case 'cancel':
        if (this.activePage.isAdmin(this.activePage.activePageId, this.userStore.user?.id as number)) {
          socket.emit('deleteChannel', { channelId: this.activePage.activePageId });
          Notify.create({
            type: 'positive',
            message: `You successfully deleted the channel!`
          })
        } else {
          console.log('leaving channel...')
          if (this.userStore.user) {
            socket.emit('leaveChannel', {channelId: this.activePage.activePageId, userId: this.userStore.user.id});
            Notify.create({
              type: 'positive',
              message: `You successfully left the channel!`
            })
          } else {
            console.error('User is not logged in.');
          }
        }
        break;
      case 'join':
        if (argument && argument.length > 0) {
          const channelName = argument.join(' ').trim();
          if (!channelName) {
            this.output.push('Channel name cannot be empty.');
            break;
          }
          // try to find existing channel by name
          let channel: Channel | 0 = this.activePage.getThreadId(channelName);
          if (channel) {
            // channel exists, just join it
            this.activePage.activePageId = channel.id;
            await this.router.push(`/channel/${channel.id}`);
            this.output.push(`Joined channel ${channel.name}`);
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
                Notify.create({ 
                  type: 'positive', 
                  message: `Channel '${channelName}' created successfully` 
                });
                this.output.push(`Created and joined channel ${channel.name}`);
              } else {
                this.output.push('Channel created but failed to join.');
              }
            } else {
              Notify.create({ 
                type: 'negative', 
                message: `Failed to create channel '${channelName}'` 
              });
              this.output.push('Failed to create channel.');
            }
          }
        } else {
          this.output.push('Usage: /join <channel name>');
        }
        break;
      case 'channel':
        if (argument) {
          if (argument.length >= 3) {
            // const description = argument.slice(2).join(' ');

            // this.activePage.createChannel({
            //   name: argument[0],
            //   type: argument[1] === 'private' ? ChannelType.Private : ChannelType.Public,
            //   description: description,
            // } as Channel, this.userStore.user?.id as number);

            this.output.push(`creating channel ${argument[0]}`);

            const channel = this.activePage.getThreadId(argument[0] as string);
            if (channel) {
              await this.router.push(`/channel/${channel.id}`);
            }
          } else {
            this.output.push(`You provided ${argument.length} arguments but at least 3 are needed`);
          }
        }
        break;
      case 'quit':
        //admin can cancel channel
        break;
      case 'status':
        if (argument) {
          if (argument.length == 1) {
            if (isStatusType(argument[0] as string)) {
              this.output.push(`changing status to ${argument[0]}`);
              this.userStore.changeStatus(argument[0] as StatusType);
            } else this.output.push('Wrong status type: online, offline, dnd');
          } else {
            this.output.push(`You provided ${argument.length} arguments but only 3 were needed`);
          }
        } else {
          this.output.push('No arguments provided');
        }
        break;
      default:
        this.output.push('Unknown command. type /help for available commands');
    }
    return { type: 'message', output: this.output.join('\n') };
  };
}
