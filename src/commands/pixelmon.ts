import { Client, Collection, Message, MessageAttachment } from 'discord.js'
import { capitalise, Obj, randomNumber, sleep } from 'tsu'
import { Color, GameType, MessageContents, Pokemon, PokemonGen } from '../types'
import {
  isHorizonBotOrAdminChannel,
  send,
  sendActiveGameError,
  sortObjectEntries
} from '../utils'
import { store } from '../store'
import { pokemon } from '../assets/pokemon.json'
import { Canvas, createCanvas } from 'canvas'

function parseArgsOrThrow(args: string[]): [number, PokemonGen] | never {
  const MAX_ROUNDS = Number(args[0] || 5)
  const gen = (args[1] as PokemonGen) || PokemonGen.GEN_ALL

  if (isNaN(MAX_ROUNDS) || MAX_ROUNDS < 1 || MAX_ROUNDS > 10) {
    throw new Error('The first argument must be a number between [1-10].')
  }

  if (!Object.values(PokemonGen).includes(gen)) {
    throw new Error(
      `The second argument must be one of the following: ${Object.values(
        PokemonGen
      )
        .map((v) => `\`${v}\``)
        .join(', ')}`
    )
  }

  return [MAX_ROUNDS, gen]
}

function generatePokemon(gen: PokemonGen): Pokemon {
  if (gen === PokemonGen.GEN_ALL) {
    return pokemon[randomNumber(pokemon.length)]
  }

  const genPokemon = pokemon.filter(
    // extract number from 'genX' string
    (p) => p.generation === Number(gen.slice(3))
  )
  // return genPokemon[randomNumber(genPokemon.length)]
  return genPokemon[randomNumber(genPokemon.length)]
}

function getCanvasDrawing(pixels: string[]): Canvas {
  const canvas = createCanvas(99, 99)
  const ctx = canvas.getContext('2d')
  const SQUARE_SIZE = 33

  pixels.forEach((color, idx) => {
    const topLeft = [(idx % 3) * SQUARE_SIZE, Math.floor(idx / 3) * SQUARE_SIZE]

    if (color !== 'transparent') {
      ctx.fillStyle = color
      ctx.fillRect(topLeft[0], topLeft[1], SQUARE_SIZE, SQUARE_SIZE)
    }
  })

  return canvas
}

function getRoundEmbed(
  round: number,
  maxRounds: number,
  solution: Pokemon
): MessageContents {
  const drawing = getCanvasDrawing(solution.pixels)
  const attachment = new MessageAttachment(drawing.toBuffer(), `pixels.png`)

  return {
    title: `Round ${round} of ${maxRounds}`,
    fields: [
      {
        name: 'Generation',
        value: String(solution.generation),
        inline: true
      },
      { name: 'Type', value: solution.type, inline: true }
    ],
    footer: 'Hint: remember to put a = before your guess!',
    image: {
      url: 'attachment://pixels.png'
    },
    files: [attachment]
  }
}

function getTimeoutEmbed(solution: Pokemon, hasNextRound: boolean) {
  return {
    title: 'Too bad!',
    description: `You didn't guess the pokemon in time. The correct answer was **${capitalise(
      solution.name,
      true
    )}**.`,
    footer: hasNextRound
      ? 'The next round will begin in 15 seconds...'
      : 'The game will end in 10 seconds...',
    color: Color.ERROR
  }
}

function getSuccessEmbed(
  winner: string,
  solution: Pokemon,
  hasNextRound: boolean
): MessageContents {
  return {
    title: 'Correct!',
    description: `**${winner}** guessed the pokémon correctly! The correct answer was **${capitalise(
      solution.name,
      true
    )}**.`,
    footer: hasNextRound
      ? 'The next round will begin in 15 seconds...'
      : 'The game will end in 10 seconds...',
    color: Color.SUCCESS
  }
}

function getResultsEmbed(scores: Obj<number>): MessageContents {
  const sortedScores = sortObjectEntries(scores)
  const finalScoresString = Object.entries(sortedScores).reduce(
    (finalScoresString, [person, score]) =>
      `${finalScoresString}\n**${person}**: ${score}`,
    ''
  )

  return {
    title: 'Game over!',
    description: finalScoresString
      ? `**Final Scores**\n${finalScoresString}`
      : ''
  }
}

function gameFilter(message: Message, solution: Pokemon): boolean {
  if (message.author.bot) return false

  const content = message.content.toLowerCase().trim()

  if (['%stop', '%end'].includes(content)) {
    return true
  } else if (!/^=\s*[a-z]+/.test(content)) {
    return false
  } else if (content.slice(1) === solution.name) {
    return true
  }

  message.react('❌')
  return false
}

async function playRound(
  message: Message,
  round: number,
  maxRounds: number,
  gen: PokemonGen
): Promise<string | undefined> {
  const solution = generatePokemon(gen)
  const roundEmbed = getRoundEmbed(round, maxRounds, solution)
  const guildId = message.guild!.id

  const withoutMiddle = `${solution.name[0].toUpperCase()}${solution.name
    .slice(1, -1)
    .replace(/[a-z]/g, '#')}${solution.name[solution.name.length - 1]}`

  const withoutVowels = `${solution.name[0].toUpperCase()}${solution.name
    .slice(1, -1)
    .replace(/[aeiou]/g, '#')}${solution.name[solution.name.length - 1]}`

  console.log({ solution: solution.name })

  let answers: Collection<string, Message>
  let hintTimeout: NodeJS.Timeout

  // send round embed
  send(message, roundEmbed)

  // begin hint timeouts
  hintTimeout = setTimeout(() => {
    send(message, {
      title: 'Hint 1 of 2',
      description: withoutMiddle
    })
    hintTimeout = setTimeout(() => {
      send(message, {
        title: 'Hint 2 of 2',
        description: withoutVowels
      })
    }, 15000)
  }, 20000)

  // wait for answers
  try {
    answers = await message.channel.awaitMessages(
      (msg) => gameFilter(msg, solution),
      { max: 1, time: 60000, errors: ['time'] }
    )

    clearTimeout(hintTimeout)
  } catch (_) {
    // executes on time over with no correct guesses
    const timeoutEmbed = getTimeoutEmbed(solution, round < maxRounds)
    send(message, timeoutEmbed)

    return
  }

  const answer = answers.first()!

  // if stop or end, end game
  if (answer.content.includes('%')) {
    clearTimeout(hintTimeout)
    store.endGame(guildId)
    return
  }

  const winner = answer.author.username
  const successEmbed = getSuccessEmbed(winner, solution, round < maxRounds)

  send(message, successEmbed)

  return winner
}

export async function run(
  message: Message,
  args: string[],
  client: Client
): Promise<void> {
  const guildId = message.guild!.id

  // prevent command from running in non-permitted Horizon Bound channels
  if (guildId === process.env.SERVER_HB) {
    const channelId = message.channel.id

    if (!isHorizonBotOrAdminChannel(channelId)) {
      throw new Error("This command isn't allowed in this channel.")
    }
  }

  // prevent command from running if there's already an active game
  if (store.isGameInProgress(guildId)) {
    sendActiveGameError(message)
    return
  }

  const [MAX_ROUNDS, gen] = parseArgsOrThrow(args)
  const scores: Obj<number> = {}
  let round = 1

  store.startGame(guildId, GameType.PIXELMON)

  send(message, {
    title: 'Pixelmon',
    description:
      'Can you guess the Pokémon from the 3x3 pixel art?\nMake your guesses with `=NAME`!',
    footer: 'The game will begin in 5 seconds...'
  })

  while (round <= MAX_ROUNDS && store.isGameInProgress(guildId)) {
    await sleep(5000)

    const winner = await playRound(message, round, MAX_ROUNDS, gen)

    if (winner) {
      scores[winner] = (scores[winner] || 0) + 1
    }

    round++
    await sleep(10000)
  }

  if (store.isGameInProgress(guildId)) {
    const resultsEmbed = getResultsEmbed(scores)
    send(message, resultsEmbed)
    store.endGame(guildId)
  }
}

export function onError(message: Message, args: string, error: Error): void {
  send(message, {
    title: 'Error:',
    description: error.message,
    color: Color.ERROR
  })
}

export const opts = {
  description: 'Play a game of Pixelmon!',
  usage: '%pixelmon <rounds> <gen/all>',
  aliases: ['pm']
}
