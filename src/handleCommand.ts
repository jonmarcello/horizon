import { Message } from 'discord.js'
import { decide, help, pokedraw, pokeguess, pokename, stop } from './commands'
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

  switch (command) {
    case 'decide':
      decide(message, args)
      break

    case 'help':
      help(message)
      break

    case 'pokedraw':
    case 'pdraw':
      if (store.getIsGameActive()) {
        sendActiveGameEmbed(message)
      } else {
        pokedraw(message, args)
      }
      break

    case 'pokeguess':
    case 'pguess':
      if (store.getIsGameActive()) {
        sendActiveGameEmbed(message)
      } else {
        pokeguess(message, args)
      }
      break

    case 'pokename':
    case 'pname':
      if (store.getIsGameActive()) {
        sendActiveGameEmbed(message)
      } else {
        pokename(message, args)
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
