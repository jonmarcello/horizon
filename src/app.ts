import Discord from 'discord.js'
import { readdirSync } from 'fs'
import { Obj } from 'tsu'
import dotenv from 'dotenv'
import { Command } from './types'
import { handleCommand } from './handleCommand'
import { handleMessage } from './handleMessage'

// load env vars to process.env
dotenv.config()

async function init() {
  const commandFiles = readdirSync('./src/commands')

  const commands = await commandFiles.reduce(async (acc, file) => {
    const command: Command = await import(`./commands/${file}`)
    const commandName = file.split('.ts')[0]

    const next = { ...(await acc), [commandName]: command }

    command.opts?.aliases?.forEach((alias) => {
      next[alias] = command
    })

    return next
  }, Promise.resolve({} as Obj<Command>))

  const client = new Discord.Client()

  client.on('message', (message) => {
    if (message.author.bot) return

    if (message.content.startsWith(process.env.COMMAND_PREFIX as string)) {
      handleCommand(client, commands, message)
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
