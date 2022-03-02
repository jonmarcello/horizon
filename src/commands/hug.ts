import { Client, Message, MessageEmbed } from 'discord.js'
import { arrayToSentence, fetchRandomReaction } from '../utils'

export function run(message: Message, args: string[], client: Client): void {
  const randomHug = fetchRandomReaction('hugs')
  const allMentions = message.mentions.members?.map(member => {
    return `<@${member.user.id}>`
  })

  const sentenceMentions = arrayToSentence(allMentions);

  let description = `<@${message.author.id}> hugged themselves`
  if (allMentions) {
    description = `<@${message.author.id}> hugged ${sentenceMentions}`
  }

  const embedMessage = new MessageEmbed()
    .setColor('#0099ff')
    .setDescription(description)
    .setImage(randomHug)

  message.channel.send(embedMessage)
}

export const opts = {
  description: 'Does this command really exist?',
  usage: '%hug',
  aliases: []
}
