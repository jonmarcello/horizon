import { Client, Message, Permissions } from 'discord.js'

export function run(message: Message, args: string[], client: Client): void {
  message.channel.send(args.join(' ').trim())

  if (message.guild?.me?.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES)) {
    message.delete()
  }
}

export const opts = {
  name: 'say',
  description: 'Sends a message as the bot.',
  aliases: ['repeat']
}
