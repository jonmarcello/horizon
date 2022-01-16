import { Client, Message, Permissions } from 'discord.js'

export function run(message: Message, args: string[], client: Client): void {
  message.channel.send(args.join(' ').trim())

  if (message.guild?.me?.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES)) {
    message.delete()
  }
}

export const opts = {
  description: 'Repeats what you say.',
  usage: '%say <message>',
  aliases: ['repeat']
}
