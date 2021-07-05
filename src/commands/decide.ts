import { Message } from 'discord.js'
import { send } from '../utils'
import { randomChance, capitaliseWords } from '@eb3n/outils'

export function decide(message: Message, query: string): void {
  const embed = {
    color: '#6366F1',
    title: capitaliseWords(query),
    description: randomChance(2) ? 'Yes! :D' : 'No. :('
  }

  send(message, { embed })
}
