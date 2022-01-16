import { Client, Message } from 'discord.js'
import { isBlank, isEmpty, randomNumber } from 'tsu'
import { Color } from '../types'
import { send } from '../utils'

export function run(message: Message, args: string[], client: Client): void {
  const trimmedArgs = args.filter((arg) => !isBlank(arg))

  if (!trimmedArgs[0]?.length) {
    throw new Error('No arguments provided.')
  } else if (!trimmedArgs[0].toLowerCase().includes('d')) {
    throw new Error('Argument must be of the form: XdY.')
  }

  const params = trimmedArgs[0].toLowerCase().split('d')
  const nDice = isEmpty(params[0]) ? 1 : Number(params[0])
  const nSides = Number(params[1])

  if (isNaN(nDice) || nDice > 100) {
    throw new Error('The number of dice must be a number between [1-100].')
  }

  if (isNaN(nSides) || nSides < 2 || nSides > 100) {
    throw new Error('The number of dice must be a number between [2-100].')
  }

  const rolls = [...new Array(Number(nDice) || 1)].map(
    () => randomNumber(Number(nSides)) + 1
  )

  send(message, {
    title: 'Rolls:',
    description: `[${rolls.join(', ')}]`
  })
}

export function onError(message: Message, args: string, error: Error): void {
  send(message, {
    title: 'Error:',
    description: error.message,
    footer: 'Hint: did you provide a positive number of dice/sides?',
    color: Color.ERROR
  })
}

export const opts = {
  description: 'Rolls a number of dice.',
  usage: '%roll <number of dice>d<number of sides>',
  aliases: ['dice']
}
