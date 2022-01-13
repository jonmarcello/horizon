import { Message, MessageEmbedOptions } from 'discord.js'
import { capitalise, randomNumber } from 'tsu'
import { GameType, Gen } from '../types'
import { store } from '../old_store'
import { getRandomPokemon, send, sendEmbed, DEX_NUMBERS } from '../old_utils'
import { fakemon } from '../assets/pokemon.json'

function generateRandomName(): string {
  const { prefixes, suffixes } = fakemon[randomNumber(fakemon.length)]
  const prefix = prefixes[randomNumber(prefixes.length)].toLowerCase()
  const suffix = suffixes[randomNumber(suffixes.length)].toLowerCase()

  return capitalise(`${prefix}${suffix}`)
}

function getFakePokemonEmbed(): MessageEmbedOptions {
  const name = generateRandomName()
  return {
    color: '#6366F1',
    title: 'Random Pokémon Name',
    fields: [{ name: 'Name', value: name, inline: true }]
  }
}

function getRealPokemonEmbed(gen: Gen): MessageEmbedOptions {
  const { min, max } = DEX_NUMBERS[gen]
  const pokemon = getRandomPokemon(min, max)

  return {
    color: '#6366F1',
    title: 'Random Pokémon',
    fields: [
      { name: 'Name', value: capitalise(pokemon.name, true), inline: true },
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

function pargeArgs(args: string): [Gen | 'fake', number, boolean] {
  if (!args?.length) return ['all', 300, false]

  const time = args.match(/(?<!gen)(\d+)s?/)?.[1] || 300
  const gen = (args.match(/gen[12345678]|fake|all/)?.[0] || 'all') as
    | Gen
    | 'fake'

  return [gen, Number(time), time < 30 || time > 600]
}

export function pokedraw(message: Message, args: string): void {
  const [gen, seconds, didParsingFail] = pargeArgs(args)

  if (didParsingFail) {
    sendEmbed(
      message,
      'Invalid command. Type `%help` for command usage instructions.',
      'error'
    )
    return
  }

  if (gen === 'fake') {
    send(message, { embed: getFakePokemonEmbed() })
  } else {
    send(message, { embed: getRealPokemonEmbed(gen) })
  }

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
