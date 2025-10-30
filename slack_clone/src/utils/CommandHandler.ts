import { useActivePage } from 'src/stores/threadStore';
import { useUserStore } from 'src/stores/userUserStore';
import { useRouter } from 'vue-router';
import {
    ChannelType,
    type messageType,
    type ChannelAtr,
    type StatusType,
    type UserAtr,
} from '../components/models';

function isStatusType(value: string): value is StatusType {
    return ['online', 'offline', 'dnd'].includes(value);
}

export class CommandHandler {
    commandList = ['list', 'help', 'join'];
    router = useRouter();
    activePage = useActivePage();
    userStore = useUserStore();
    output = [''];

    print(value: string): void {
        this.output.push(value);
    }

    handle = async (
        command: string,
        argument?: string[],
    ): Promise<{ type?: messageType; output: string | string[] | UserAtr[] }> => {
        this.output = [];
        if (this.activePage.activePageType != 'channel') {
            this.print('Commands can be used only inside channels');
            return { type: 'message', output: this.output };
        }
        switch (command) {
            case 'list': {

                const users = this.activePage.getThreadUsers(this.activePage.activePageId);

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
                if (!this.activePage.isAdmin(this.activePage.activePageId, this.userStore.id)) {
                    if (argument && argument.length > 0 && argument.length < 2) {
                        const output = this.activePage.voteKickUser(
                            argument[0]!,
                            this.userStore.id,
                            this.activePage.activePageId,
                        );
                        if (output) {
                            this.print(output);
                        }
                    } else {
                        this.print('Invalid number of arguments');
                    }
                } else {
                    if (argument && argument.length > 0) {
                        const userIds = argument
                            .map((name) => {
                                const userEntry = Object.values(this.activePage.users).find(
                                    (u) => u.nickname === name,
                                );
                                return userEntry?.id;
                            })
                            .filter(Boolean) as number[]; // remove undefined (nicknames not found)

                        if (userIds.length > 0) {
                            this.activePage.removeUsersFromThread(this.activePage.activePageId, userIds);
                            const kickedNames = userIds
                                .map((id) => this.activePage.users[id]?.nickname ?? 'Unknown')
                                .join(', ');
                            this.output.push(`Kicked user(s): ${kickedNames}`);
                        } else {
                            this.output.push('No valid users found to kick by nickname.');
                        }
                    }
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
                //if (user) {
                //     console.log('leaving channel...')
                // } else {
                //     console.log('deleting channel...')
                // }
                break;
            case 'join':
                if (argument) {
                    const channel = this.activePage.getThreadId(argument[0] as string);
                    if (channel) {
                        this.output.push(`joining channel ${argument[0]}`);
                        await this.router.push(`/channel/${channel.id}`);
                    } else {
                        this.output.push(`creating channel ${argument[0]}`);
                        this.activePage.createChannel({
                            name: argument[0],
                            type: ChannelType.Public,
                            description: 'generic description',
                        } as ChannelAtr);
                        const channel = this.activePage.getThreadId(argument[0] as string);
                        if (channel) {
                            await this.router.push(`/channel/${channel.id}`);
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
                            description: description,
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
