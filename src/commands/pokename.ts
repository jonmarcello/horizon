import { Message, MessageEmbedOptions } from 'discord.js'
import { capitaliseWord, randomNumber } from '@eb3n/outils'
import { GameType } from '../types'
import { store } from '../store'
import { send, sendEmbed } from '../utils'
import randomNames from '../assets/randomNames.json'

function generateName(): string {
  const { prefixes, suffixes } = randomNames[randomNumber(randomNames.length)]
  const prefix = prefixes[randomNumber(prefixes.length)].toLowerCase()
  const suffix = suffixes[randomNumber(suffixes.length)].toLowerCase()

  return capitaliseWord(`${prefix}${suffix}`)
}

function getPokemonNameEmbed(): MessageEmbedOptions {
  const name = generateName()
  return {
    color: '#6366F1',
    title: 'Random Pokémon Name',
    fields: [{ name: 'Name', value: name, inline: true }]
  }
}

function parseArgs(args: string): [number, boolean] {
  if (!args?.length) {
    return [90, false]
  }

  const time = args.match(/(?<!gen)(\d+)s?/)?.[1] || 90

  return [Number(time), time < 30 || time > 300]
}

export function pokename(message: Message, args: string): void {
  const [seconds, didParsingFail] = parseArgs(args)

  if (didParsingFail) {
    sendEmbed(
      message,
      'Invalid command. Type `%help` for command usage instructions.',
      'error'
    )
    return
  }

  const pokemonEmbed = getPokemonNameEmbed()

  send(message, { embed: pokemonEmbed })
  store.startGame(GameType.POKENAME)

  sendEmbed(message, `Your **${seconds}** seconds starts... now!`)

  if (seconds > 60) {
    store.setTimeout(() => {
      sendEmbed(message, `⏰ **30 seconds left!** ⏰`)
      store.setTimeout(() => {
        sendEmbed(message, "⏰ **TIME'S UP!** ⏰")
        store.endGame()
      }, 30000)
    }, seconds * 1000 - 30000)
  } else {
    store.setTimeout(() => {
      sendEmbed(message, `⏰ **10 seconds left!** ⏰`)
      store.setTimeout(() => {
        sendEmbed(message, "⏰ **TIME'S UP!** ⏰")
        store.endGame()
      }, 10000)
    }, seconds * 1000 - 10000)
  }
}
