import { Message } from 'discord.js'
import { send } from '../utils'

export function help(message: Message): void {
  const embed = {
    color: '#6366F1',
    title: 'Horizon Bot Help',
    description: "Instructions for Horizon Bot's commands.",
    fields: [
      {
        name: '`%acdraw [time]`',
        value: '• [time]: a number between 30 and 600\n• shorthand: `%ac`'
      },
      {
        name: '`%choose [options]`',
        value: '• [options]: a list of options, wrapped in double quotes'
      },
      {
        name: '`%decide [query]`',
        value: '• [query]: a yes/no question to ask'
      },
      {
        name: '`%pokedraw [time] [generation/fake]`',
        value:
          '• [time]: a number between 30 and 300\n• [generation/fake]: one of gen1/gen2/.../gen8/fake/all.\n• shorthand: `%pd`'
      },
      {
        name: '`%pokeguess [rounds] [generation]`',
        value:
          '• [rounds]: a number between 5 and 25\n• [generation]: one of gen1/gen2/.../gen8/all.\n• shorthand: `%pg`'
      }
    ]
  }

  if (message.author.id === process.env.LYDIA_ID) {
    send(message, 'tl;dr: type stuff and press enter')
    return
  }

  send(message, { embed })
}
