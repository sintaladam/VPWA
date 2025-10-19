export class CommandHandler {
    handle(command: string) {
      switch (command) {
        case 'list':
          console.log('listing all users...')
          break
        default:
          console.log('Unknown command')
      }
    }
  }
  