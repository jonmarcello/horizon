import { Client, Message, MessageEmbed } from 'discord.js'
import { getRandomReactionGif, send } from '../utils'

export function run(message: Message, args: string[], client: Client): void {
  const gif = getRandomReactionGif('hugs')

  send(message, {
    description: `${message.author} hugged ${args[0]}!`,
    image: { url: gif }
  })
}

export const opts = {
  description: 'Give somebody a nice big hug',
  usage: '%hug',
  aliases: []
}
