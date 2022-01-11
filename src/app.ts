import Discord, { TextChannel } from 'discord.js'
import dotenv from 'dotenv'
import { handleCommand } from './handleCommand'
import { randomChance } from 'tsu'

// load env vars
dotenv.config()

// get discord client
const client = new Discord.Client()

client.on('message', (message) => {
  // make bot ignore own messages
  if (message.author === client.user) return

  if (message.content.startsWith(process.env.DISCORD_PREFIX as string)) {
    handleCommand(message)
  } else if (randomChance(500)) {
    message.react('👍')

    if (message.guild?.id === process.env.SERVER_HORIZON) {
      const THUMBS_UP = client.channels.cache.get(
        process.env.CHANNEL_HB_THUMBS_UP as string
      ) as TextChannel

      THUMBS_UP.send(
        `I liked **${message.author.username}**'s comment:\n> **${message.content}**`
      )
    }
  }
})

client.on('ready', () => {
  client.user?.setActivity('the sunset.', { type: 'WATCHING' })
  console.log('online')
})

client.login(process.env.DISCORD_API_KEY)
