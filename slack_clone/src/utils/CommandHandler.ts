import { useActivePage } from 'src/stores/threadStore';
import { useAuthStore } from 'src/stores/authStore';
import { useRouter } from 'vue-router';
import {
  //ChannelType,
  type messageType,
  // type ChannelAtr,
  type StatusType,
  type UserAtr,
} from '../components/models';
import { socket } from 'src/boot/socket';
import { Notify } from 'quasar'

//import type { Channel } from 'src/contracts';

function isStatusType(value: string): value is StatusType {
  return ['online', 'offline', 'dnd'].includes(value);
}

export class CommandHandler {
  commandList = ['list', 'help', 'join', 'kick', 'cancel', 'status'];
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
            this.output.push(`Kicked user ${targetNickname} from channel.`);
          } else {
            this.output.push(`Voted to kick ${targetNickname}. 3 votes needed for ban.`);
          }
        } else {
          this.output.push('Usage: /kick <nickname>');
        }
        break;
      case 'revoke':
        //kick users from private channel only admin
        break;
      case 'invite':
        //invite users to private channel only admin
        //everyone can invite to public channel
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
          //
        }
        break;
      case 'join':
        // if (argument) {
        //   const channel_name = argument.join(' ');
        //   const channel = this.activePage.getThreadId(channel_name);
        //   if (channel) {
        //     this.output.push(`joining channel ${argument[0]}`);
        //     await this.router.push(`/channel/${channel.id}`);
        //   } else {
        //     this.output.push(`creating channel ${argument[0]}`);
        //     this.activePage.createChannel({
        //       name: argument[0],
        //       type: ChannelType.Public,
        //       description: 'generic description',
        //     } as Channel, this.userStore.user?.id as number);
        //     const channel = this.activePage.getThreadId(argument[0] as string);
        //     if (channel) {
        //       await this.router.push(`/channel/${channel.id}`);
        //     }
        //   }
        // }
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
