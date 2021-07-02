import Discord from 'discord.js'
import dotenv from 'dotenv'
import { store } from './store'
import { handleCommand } from './handleCommand'
import { GameType } from './types'

// load env vars
dotenv.config()

// get discord client
const client = new Discord.Client()

client.on('message', (message) => {
  // make bot ignore own messages
  if (message.author === client.user) return

  // don't send unless in #poke-draw
  // if (message.channel.id !== '859794185360375820') {
  //   return
  // }

  if (message.content.startsWith(process.env.DISCORD_PREFIX!)) {
    handleCommand(message)
  } else if (store.getGameType() === GameType.POKEGUESS) {
    // handle the guess
  }
})

client.on('ready', () => {
  client.user?.setActivity('the sunset.', { type: 'WATCHING' })
  console.log('online')
})

client.login(process.env.DISCORD_API_KEY)
