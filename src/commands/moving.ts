import { Message } from 'discord.js'
import { send } from '../utils'

export function run(message: Message, args: string[]): void {
  const goal = 1645099200000
  const now = Date.now()

  let delta = (goal - now) / 1000

  const days = Math.floor(delta / 86400)
  delta -= days * 86400

  const hours = Math.floor(delta / 3600)
  delta -= hours * 3600

  const minutes = Math.floor(delta / 60)
  delta -= minutes * 60

  send(message, {
    title: 'Time until no more stressy Eb:',
    description: `${days} days, ${hours} hours, ${minutes} minutes`
  })
}

export const opts = {
  description: 'How long until Eb moves house?',
  usage: '%moving',
  aliases: ['suffering']
}
