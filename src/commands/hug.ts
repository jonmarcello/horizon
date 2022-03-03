import { Client, Message, MessageEmbed } from 'discord.js'
import { getRandomReactionGif, send } from '../utils'

export function run(message: Message, args: string[], client: Client): void {
  const gif = getRandomReactionGif('hugs')
  const member = args[0]

  send(message, {
    description: `${
      member
        ? `${message.member} hugged ${member}`
        : `${message.member} got hugged`
    }`,
    image: { url: gif }
  })
}

export const opts = {
  description: 'Give somebody a nice big hug',
  usage: '%hug',
  aliases: []
}
