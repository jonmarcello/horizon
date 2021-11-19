import { Client, Message, Permissions } from 'discord.js'
import { send } from '../utils'

export function say(message: Message, args: string): void {
  send(message, args)

  if (message.guild?.me?.hasPermission(Permissions.FLAGS.MANAGE_MESSAGES)) {
    message.delete()
  }
}
