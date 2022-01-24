import { Client, Message, TextChannel } from 'discord.js'
import { randomChance, randomNumber } from 'tsu'
import { isHorizonBotOrAdminChannel } from './utils'

export async function handleMessage(
  client: Client,
  message: Message
): Promise<void> {
  const shouldReact = randomChance(500)

  if (shouldReact && !isHorizonBotOrAdminChannel(message.channel.id)) {
    const emojiRoll = randomNumber(100)
    let emoji

    if (emojiRoll >= 95) {
      emoji = '🍑'
    } else {
      emoji = '👍'
    }

    message.react(emoji)

    if (message.guild?.id === process.env.SERVER_HB) {
      const author = message.author.username
      const horizonLikesChannel = <TextChannel>(
        client.channels.cache.get(<string>process.env.CHANNEL_HB_HORIZONLIKES)
      )

      const opinion =
        emojiRoll >= 95
          ? `I found **${author}**'s comment very peachy!`
          : `I liked **${author}**'s comment!`

      horizonLikesChannel.send(`${opinion}\n> **${message.content}**`)
    }
  }
}
