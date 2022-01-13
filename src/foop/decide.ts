import { Message } from 'discord.js'
import { send } from '../old_utils'
import { randomChance, capitalise } from 'tsu'

export function decide(message: Message, query: string): void {
  const embed = {
    color: '#6366F1',
    title: capitalise(query, true),
    description: randomChance(2) ? 'Yes! :D' : 'No. :('
  }

  send(message, { embed })
}
