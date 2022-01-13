import { Client, Message, Permissions } from 'discord.js'
import { send } from '../utils'

export function run(message: Message, args: string[], client: Client): void {
  send(message, args.join(' ').trim())

  if (message.guild?.me?.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES)) {
    message.delete()
  }
}

export const opts = {
  name: 'say',
  description: '',
  aliases: ['repeat']
}
