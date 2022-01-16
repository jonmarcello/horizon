import { Client, Message } from 'discord.js'
import { Color } from '../types'
import { send } from '../utils'
import { store } from '../store'

export function run(message: Message, args: string[], client: Client): void {
  const guildId = message.guild!.id

  if (!store.isGameInProgress(guildId)) {
    throw new Error('There are no games currently being played.')
  }

  const user = message.author.username

  send(message, {
    description: `**${user}** has ended a game early. Boo them!`
  })

  store.endGame(guildId)
}

export function onError(message: Message, args: string, error: Error): void {
  send(message, {
    title: 'Error:',
    description: error.message,
    footer: 'Hint: are you sure a game is active?',
    color: Color.ERROR
  })
}

export const opts = {
  description: 'Ends the current game early.',
  usage: '%stop',
  aliases: ['end']
}
