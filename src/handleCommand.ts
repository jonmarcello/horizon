import { Message } from 'discord.js'
import { acdraw, decide, help, pokedraw, pokeguess, stop } from './commands'
import { store } from './store'
import { sendEmbed, splitMessage } from './utils'

function sendActiveGameEmbed(message: Message): void {
  sendEmbed(
    message,
    'A game is currently active. Please finish playing, or use `%stop` to end it early',
    'error'
  )
}

export function handleCommand(message: Message): void {
  const [command, args] = splitMessage(message.content)
  const isAllowedChannel =
    message.channel.id === process.env.CHANNEL_POKEDRAW ||
    message.channel.id === process.env.CHANNEL_TESTING

  if (!isAllowedChannel) {
    return
  }

  console.log({ command, args })

  switch (command) {
    case 'acdraw':
    case 'ac':
      if (store.getIsGameActive()) {
        sendActiveGameEmbed(message)
      } else {
        acdraw(message, args)
      }
      break

    case 'decide':
    case 'd':
      decide(message, args)
      break

    case 'help':
      help(message)
      break

    case 'pokedraw':
    case 'pd':
      if (store.getIsGameActive()) {
        sendActiveGameEmbed(message)
      } else {
        pokedraw(message, args)
      }
      break

    case 'pokeguess':
    case 'pg':
      if (store.getIsGameActive()) {
        sendActiveGameEmbed(message)
      } else {
        pokeguess(message, args)
      }
      break

    case 'end':
    case 'stop':
      if (store.getIsGameActive()) {
        stop(message)
      } else {
        sendEmbed(message, 'No game is currently active.', 'error')
      }
  }
}
