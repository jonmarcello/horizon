import { Message } from 'discord.js'
import { send } from '../utils'

export function help(message: Message): void {
  const embed = {
    color: '#6366F1',
    title: 'Horizon Bot Help',
    description: "Instructions for Horizon Bot's commands.",
    fields: [
      {
        name: '`%pokedraw 30-300 gen1/gen2/.../gen8/all`',
        value:
          'The first value represents the **time of a round**, and the second represents **which generation the Pokémon will be from** (values may be provided in any order).'
      },
      {
        name: '`%pokeguess 5-25 gen1/gen2/.../gen8/all`',
        value:
          'The first value represents the **number of rounds**, and the second represents **which generation the Pokémon will be from** (values may be provided in any order).'
      }
    ]
  }

  if (message.author.id === process.env.LYDIA_ID) {
    send(message, 'tl;dr: type stuff and press enter')
    return
  }

  send(message, { embed })
}
