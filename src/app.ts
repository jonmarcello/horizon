import Discord from 'discord.js'
import dotenv from 'dotenv'
import { store } from './store'
import { handleCommand } from './handleCommand'
import { GameType } from './types'
import { randomChance } from '@eb3n/outils'

// load env vars
dotenv.config()

// get discord client
const client = new Discord.Client()

client.on('message', (message) => {
  // make bot ignore own messages
  if (message.author === client.user) return

  // don't send unless in #poke-draw/testing
  if (
    ![process.env.CHANNEL_POKEDRAW, process.env.CHANNEL_TESTING].includes(
      message.channel.id
    )
  ) {
    return
  }

  if (message.content.startsWith(process.env.DISCORD_PREFIX!)) {
    handleCommand(message)
  } else if (randomChance(10)) {
    message.react('👍')
  }
})

client.on('ready', () => {
  client.user?.setActivity('the sunset.', { type: 'WATCHING' })
  console.log('online')
})

client.login(process.env.DISCORD_API_KEY)
