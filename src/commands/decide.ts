import { Client, Message } from 'discord.js'
import { capitalise, randomChance } from 'tsu'
import { Color } from '../types'
import { send } from '../utils'

export function run(message: Message, args: string[], client: Client): void {
  const result = randomChance(2)

  send(message, {
    title: capitalise(args.join(' ').trim()),
    description: result ? 'Yes' : 'No',
    color: result ? Color.SUCCESS : Color.ERROR
  })
}

export const opts = {
  name: 'decide',
  description: 'Makes a coin flip decision.',
  aliases: ['yn']
}
