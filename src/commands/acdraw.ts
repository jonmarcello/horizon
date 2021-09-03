import { capitalise, randomChance, randomNumber } from 'tsu'
import { Message, MessageEmbedOptions } from 'discord.js'
import { GameType } from '../types'
import { store } from '../store'
import { send, sendEmbed } from '../utils'
import { species, personalities, accessories, colours } from '../assets/ac.json'

function getRandomCharacter(): [string, string, string] {
  const randomSpecies = species[randomNumber(species.length)].toLowerCase()
  const randomPersonality = personalities[
    randomNumber(personalities.length)
  ].toLowerCase()

  if (randomChance(2)) {
    const randomAccessory = accessories[randomNumber(accessories.length)]
    return [randomSpecies, randomPersonality, randomAccessory]
  } else {
    const randomColour = colours[randomNumber(colours.length)]
    return [randomSpecies, randomPersonality, randomColour]
  }
}

function getCharacterEmbed(): MessageEmbedOptions {
  const [species, personality, colourAccessory] = getRandomCharacter()

  return {
    color: '#6366F1',
    title: 'Random A.C. Character',
    fields: [
      { name: 'Species', value: capitalise(species), inline: true },
      { name: 'Personality', value: capitalise(personality), inline: true },
      {
        name: 'Colour/Accessory',
        value: capitalise(colourAccessory),
        inline: true
      }
    ]
  }
}

function parseArgs(args: string): [number, boolean] {
  if (!args?.length) return [300, false]

  const time = args.match(/(\d+)s?/)?.[1] || 300

  return [Number(time), time < 30 || time > 600]
}

export function acdraw(message: Message, args: string): void {
  const [seconds, didParsingFail] = parseArgs(args)

  if (didParsingFail) {
    sendEmbed(
      message,
      'Invalid command. Type `%help` for command usage instructions.',
      'error'
    )
    return
  }

  send(message, { embed: getCharacterEmbed() })

  store.startGame(GameType.ACDRAW)

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
