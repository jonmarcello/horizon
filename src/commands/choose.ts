import { Client, Message } from 'discord.js'
import { randomNumber } from 'tsu'
import { Color } from '../types'
import { send } from '../utils'

export function run(message: Message, args: string[], client: Client): void {
  if (!args?.length) {
    throw new Error('No arguments provided.')
  }

  const joinedArgs = args.join(' ')

  if (!joinedArgs.includes('/')) {
    throw new Error('No options found.')
  }

  const options = joinedArgs
    .replace(/^\/|\/$/g, '')
    .split('/')
    .map((s) => s.trim())
    .map((s) => (s === '' ? '<empty>' : s))

  const option = options[randomNumber(options.length)]

  send(message, {
    title: 'Decision:',
    description: option
  })
}

export function onError(message: Message, args: string, error: Error): void {
  send(message, {
    title: 'Error:',
    description: error.message,
    footer: 'Hint: did you separate your options with /s?',
    color: Color.ERROR
  })
}

export const opts = {
  name: 'choose',
  description: 'Randomly selects an item from a list of choices.',
  aliases: ['pick', 'select']
}
