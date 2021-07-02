import {
  Message,
  APIMessageContentResolvable,
  MessageAdditions,
  MessageOptions
} from 'discord.js'
import { Pokemon } from './types'
import { Obj, randomNumber } from '@eb3n/outils'
import pokemonData from './assets/pokemon.json'

export const DEX_NUMBERS = {
  gen1: { min: 1, max: 151 },
  gen2: { min: 152, max: 251 },
  gen3: { min: 252, max: 386 },
  gen4: { min: 387, max: 493 },
  gen5: { min: 494, max: 649 },
  gen6: { min: 650, max: 721 },
  gen7: { min: 722, max: 809 },
  gen8: { min: 810, max: 898 },
  all: { min: 1, max: 898 }
}

export function splitMessage(messageContent: string): [string, string] {
  if (!messageContent || messageContent.length === 0) {
    return ['', '']
  }

  const [first, ...rest] = messageContent.substr(1).split(/(?<=^\S+)\s/)

  return [first.toLowerCase(), rest[0]]
}

export function send(
  message: Message,
  content:
    | APIMessageContentResolvable
    | (MessageOptions & {
        split?: false | undefined
      })
    | MessageAdditions
): Promise<Message> {
  return message.channel.send(content || '_ _')
}

export function sendEmbed(
  message: Message,
  error: string,
  type: 'info' | 'error' = 'info'
): Promise<Message> {
  const colors = {
    info: '#6366F1',
    error: '#B91C1C'
  }

  return message.channel.send({
    embed: {
      color: colors[type],
      description: error
    }
  })
}

export function reply(message: Message, content: string): void {
  message.reply(content || '_ _')
}

export function getRandomPokemon(min = 0, max = pokemonData.length): Pokemon {
  return pokemonData[randomNumber(max, min)]
}

export async function sleep(duration: number): Promise<unknown> {
  return new Promise((resolve) => setTimeout(resolve, duration))
}

export function sortObjectEntries(obj: Obj<number>): Obj<number> {
  return Object.fromEntries(Object.entries(obj).sort((a, b) => b[1] - a[1]))
}
