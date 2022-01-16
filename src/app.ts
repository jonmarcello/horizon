import Discord, { Collection } from 'discord.js'
import { readdirSync } from 'fs'
import dotenv from 'dotenv'
import { Command } from './types'
import { handleCommand } from './handleCommand'
import { handleMessage } from './handleMessage'

// load env vars to process.env
dotenv.config()

async function init() {
  const client = new Discord.Client()
  client.commands = new Collection()

  const commandFiles = readdirSync('./src/commands')

  commandFiles.forEach(async (file) => {
    const path = `./commands/${file}`
    const command: Command = await import(path)
    const commandName = file.split('.')[0]

    client.commands.set(commandName, command)

    command.opts.aliases?.forEach((alias) => {
      client.commands.set(alias, command)
    })
  })

  client.on('message', (message) => {
    if (message.author.bot) return

    if (message.content.startsWith(process.env.COMMAND_PREFIX as string)) {
      handleCommand(client, message)
    } else {
      handleMessage(client, message)
    }
  })

  client.on('ready', () => {
    client.user?.setActivity('the sunset.', { type: 'WATCHING' })
    const timestamp = new Date().toLocaleString('en-GB')
    console.log(`[${timestamp}]: Bot online.`)
  })

  client.login(process.env.DISCORD_API_KEY)
}

init()
