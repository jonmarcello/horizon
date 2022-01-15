import { Client, Message } from 'discord.js'
import { Color } from '../types'
import { send } from '../utils'

export function run(message: Message, args: string[], client: Client): void {
  //
}

export function onError(message: Message, args: string, error: Error): void {
  send(message, {
    title: 'Error:',
    description: error.message,
    footer:
      "Hint: if you messed up the help command, there's no helping you...",
    color: Color.ERROR
  })
}

export const opts = {
  name: 'help',
  description: 'Shows this message.',
  aliases: ['h']
}
