import { Client, Message } from 'discord.js'

export function run(message: Message, args: string[], client: Client): void {
  message.channel.send('thank u for trusting me :)')
}

export const opts = {
  description: 'Does this command really exist?',
  usage: '%gullible',
  aliases: []
}
