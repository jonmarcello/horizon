import { Client, Message, MessageEmbed } from 'discord.js'
import { arrayToSentence, fetchRandomReaction } from '../utils'

export function run(message: Message, args: string[], client: Client): void {
  const randomHug = fetchRandomReaction('hugs')
  const allMentions = message.mentions.members?.map(member => {
    return `<@${member.user.id}>`
  })
  const mentionsAsSentence = arrayToSentence(allMentions);

  let description = `<@${message.author.id}> hugged themselves`
  if (allMentions) {
    description = `<@${message.author.id}> hugged ${mentionsAsSentence}`
  }

  const embedMessage = new MessageEmbed()
    .setColor('#0099ff')
    .setDescription(description)
    .setImage(randomHug)

  message.channel.send(embedMessage)
}

export const opts = {
  description: 'Give somebody a nice big hug',
  usage: '%hug',
  aliases: []
}
