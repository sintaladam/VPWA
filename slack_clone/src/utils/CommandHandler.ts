import { useActivePage } from "src/stores/activePage";

export class CommandHandler {
    activePage = useActivePage();
    people = ['Alice', 'Bob', 'Charlie', 'David'];
    output = [''];

    handle(command: string, argument?: string[] ) {
        this.output = []
        switch (command) {
            case 'list':
                this.output.push('Listing all users:');
                this.output.push(...this.people);
                break
            case 'help':
                this.output.push('available commands: list, help')
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
                if (argument && this.activePage.channels.some(c => c.name === argument[0])) {
                    console.log('channel exists')
                    console.log('joining channel...')
                } else {
                    console.log('creating channel...')
                }
                break
            default:
                this.output.push('Unknown command. type /help for available commands');
        }
        return this.output.join('\n');
    }
}
