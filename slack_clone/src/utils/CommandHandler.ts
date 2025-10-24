import { useActivePage } from "src/stores/threadStore";
import { useUserStore } from "src/stores/userUserStore";
import { useRouter } from 'vue-router';
import { ChannelType, type ChannelAtr, type StatusType } from '../components/models'

function isStatusType(value: string): value is StatusType {
    return ['online', 'offline', 'dnd'].includes(value);
}

export class CommandHandler {
    commandList = ['list', 'help', 'join']
    router = useRouter();
    activePage = useActivePage();
    userStore = useUserStore();
    people = ['Alice', 'Bob', 'Charlie', 'David'];
    output = [''];



    handle = async (command: string, argument?: string[]) => {
        this.output = []
        switch (command) {
            case 'list':
                this.output.push('Listing all users:');
                this.output.push(...this.people);
                break
            case 'help':
                this.output.push(`available commands: ${this.commandList.join(', ')}`)
                break
            case 'kick':
                //admin can kick user
                //users can vote to kick user they need at least 3 votes
                this.output.push('kicking user...')
                break
            case 'revoke':
                //kick users from private channel only admin
                break
            case 'invite':
                //invite users from private channel only admin
                //everyone can invite to public channel
                break
            case 'cancel':
                //if (user) {
                //     console.log('leaving channel...')
                // } else {
                //     console.log('deleting channel...')
                // }
                break
            case 'join':
                if (argument) {
                    const channel = this.activePage.getThreadId(argument[0] as string)
                    if (channel) {
                        this.output.push(`joining channel ${argument[0]}`);
                        await this.router.push(`/channel/${channel.id}`);
                    } else {
                        this.output.push(`creating channel ${argument[0]}`);
                        this.activePage.createChannel(
                            {
                                name: argument[0],
                                type: ChannelType.Public,
                                description: 'generic description'
                            } as ChannelAtr)
                        const channel = this.activePage.getThreadId(argument[0] as string)
                        if (channel) {
                            await this.router.push(`/channel/${channel.id}`)
                        }
                    }
                }
                break;
            case 'channel':
                if (argument) {
                    if (argument.length >= 3) {
                        const description = argument.slice(2).join(' ');

                        this.activePage.createChannel({
                            name: argument[0],
                            type: argument[1] === 'private' ? ChannelType.Private : ChannelType.Public,
                            description: description
                        } as ChannelAtr);

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
                            this.output.push(`changing status to ${argument[0]}`)
                            this.userStore.changeStatus(argument[0] as StatusType)
                        } else
                            this.output.push('Wrong status type: online, offline, dnd');
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
        return this.output.join('\n');
    }
}
