import { Message, MessageEmbedOptions } from 'discord.js'
import { capitaliseWords } from '@eb3n/outils'
import { GameType, Pokemon, Gen } from '../types'
import { store } from '../store'
import { getRandomPokemon, send, sendEmbed, DEX_NUMBERS } from '../utils'

function getPokemonEmbed(pokemon: Pokemon): MessageEmbedOptions {
  return {
    color: '#6366F1',
    title: 'Random Pokémon',
    fields: [
      { name: 'Name', value: capitaliseWords(pokemon.name), inline: true },
      {
        name: 'Pokédex Number',
        value: `#${pokemon.number}`,
        inline: true
      }
    ],
    image: {
      url: `https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${pokemon.number}.png`
    }
  }
}

function parsePokedrawArgs(args: string): [Gen, number, boolean] {
  if (!args?.length) {
    return ['all', 90, false]
  }

  const gen = (args.match(/gen[12345678]|all/)?.[0] || 'all') as Gen
  const time = args.match(/(?<!gen)(\d+)s?/)?.[1] || 90

  return [gen, Number(time), time < 30 || time > 300]
}

export function pokedraw(message: Message, args: string): void {
  const [gen, seconds, didParsingFail] = parsePokedrawArgs(args)

  if (didParsingFail) {
    sendEmbed(
      message,
      'Usage: `%pokedraw [gen1/.../gen8/all] [30-300]s`',
      'error'
    )
    return
  }

  const { min, max } = DEX_NUMBERS[gen]

  const pokemon = getRandomPokemon(min, max)
  const pokemonEmbed = getPokemonEmbed(pokemon)

  send(message, { embed: pokemonEmbed })
  store.startGame(GameType.POKEDRAW)

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
