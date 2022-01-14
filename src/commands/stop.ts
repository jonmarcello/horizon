import { Client, Message } from 'discord.js'
import { Color } from '../types'
import { prettySend } from '../utils'
import { store } from '../store'

export function run(message: Message, args: string[], client: Client): void {
  const guildId = message.guild!.id

  if (!store.isGameInProgress(guildId)) {
    throw new Error('There are no games currently being played.')
  }

  const author = message.author.username

  prettySend(message, {
    description: `**${author}** has ended a game early. Boo them!`
  })

  store.endGame(guildId)
}

export function onError(message: Message, args: string, error: Error): void {
  prettySend(message, {
    title: 'Error:',
    description: error.message,
    footer: 'Hint: are you sure a game is active?',
    color: Color.ERROR
  })
}

export const opts = {
  name: 'choose',
  description: '',
  aliases: []
}
