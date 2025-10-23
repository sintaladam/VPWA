import { useActivePage } from "src/stores/activePage";
import { useRouter } from 'vue-router';
import { ChannelType, type ChannelAtr } from '../components/models'


export class CommandHandler {
    commandList = ['list', 'help', 'join']
    router = useRouter();
    activePage = useActivePage();
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
                this.output.push('kicking user...')
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
                    const channel = this.activePage.channels.find(c => c.name === argument[0]);

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
                        const channel = this.activePage.channels.find(c => c.name === argument[0]);
                        if (channel) {
                            await this.router.push(`/channel/${channel.id}`)
                        }
                    }
                }
                break;
            case 'channel':
                if (argument) {
                    if (argument.length > 2) {
                        this.activePage.createChannel(
                            {
                                name: argument[0],
                                type: argument[1] === 'private' ? ChannelType.Private : ChannelType.Public,
                                description: argument[2]
                            } as ChannelAtr)
                        this.output.push(`creating channel ${argument[0]}`);
                        const channel = this.activePage.channels.find(c => c.name === argument[0]);
                        if (channel) {
                            await this.router.push(`/channel/${channel.id}`)
                        }
                    } else {
                        this.output.push('Not enough arguments provided');
                    }
                }
                break;
            default:
                this.output.push('Unknown command. type /help for available commands');
        }
        return this.output.join('\n');
    }
}
