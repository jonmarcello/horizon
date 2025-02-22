import { Client, Message } from 'discord.js'
import { Color } from '../types'
import { send } from '../utils'

export function run(message: Message, args: string[], client: Client): void {
  const commands = client.commands

  if (message.author.id === process.env.LYDIA_ID) {
    send(message, {
      title: 'Error:',
      description: 'Lydia detected.\ntl;dr: type stuff and press enter',
      color: Color.ERROR
    })

    return
  }

  message.channel.send({
    embed: {
      title: 'Commands:',
      fields: commands
        .filter(
          // prevent aliases from being displayed as their own commands
          (command, commandName) => !command.opts.aliases?.includes(commandName)
        )
        .filter((command, commandName) => !commandName.includes(':'))
        .map((command, commandName) => {
          const aliases = command.opts.aliases?.join(', ') ?? ''
          const description = `${command.opts.description}\nUsage: \`${command.opts.usage}\``

          return {
            name: `${process.env.COMMAND_PREFIX}${commandName}${
              aliases ? ` (${aliases})` : ''
            }`,
            value: description,
            inline: true
          }
        }),
      color: Color.DEFAULT
    }
  })
}

export function onError(message: Message, args: string, error: Error): void {
  send(message, {
    title: 'Error:',
    description: error.message,
    footer:
      "Hint: if you messed up the help command, there's no helping you...",
    color: Color.ERROR
  })
}

export const opts = {
  description: 'Displays this message.',
  usage: '%help',
  aliases: ['commands', 'cmds']
}
