import {
  getRandomPokemon,
  send,
  sendEmbed,
  sleep,
  sortObjectEntries,
  DEX_NUMBERS
} from '../old_utils'
import { Collection, Message, MessageEmbedOptions } from 'discord.js'
import { GameType, Gen, Pokemon } from '../types'
import { store } from '../old_store'
import { Obj, capitalise } from 'tsu'

function pargeArgs(args: string): [Gen, number, boolean] {
  if (!args?.length) {
    return ['all', 10, false]
  }

  const gen = (args.match(/gen[12345678]|all/)?.[0] || 'all') as Gen
  const rounds = args.match(/(?<!gen)(\d+)/)?.[1] || 10

  return [gen, Number(rounds), rounds < 1 || rounds > 25]
}

function getPokemonEmbed(
  pokemon: Pokemon,
  currentRound: number,
  totalRounds: number
): MessageEmbedOptions {
  return {
    color: '#6366F1',
    title: "Who's that Pokémon?",
    description: `Round ${currentRound} out of ${totalRounds}.`,
    image: {
      url: `https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${pokemon.number}.png`
    }
  }
}

function getHints(name: string): [string, string] {
  const first = name.charAt(0)
  const last = name.charAt(name.length - 1)
  const rest = name.slice(1, name.length - 1)

  const noVowels = first + rest.replace(/[aeiou]/g, '#') + last
  const noMiddle = first + '#'.repeat(rest.length) + last

  return [noVowels, noMiddle]
}

function getFinalScoresString(scores: Obj<number>): string {
  return Object.entries(scores).reduce((finalScoresString, [person, score]) => {
    return `${finalScoresString}\n${person}: ${score}`
  }, '')
}

function getGameOverEmbed(scores: Obj<number>): MessageEmbedOptions {
  const sortedScores = sortObjectEntries(scores)
  const finalScoresString = getFinalScoresString(sortedScores)

  return {
    color: '#6366F1',
    title: 'Game over!',
    fields: finalScoresString
      ? [{ name: 'Final Scores', value: finalScoresString }]
      : undefined
  }
}

function filter(message: Message, pokemon: Pokemon): boolean {
  const guess = message.content.toLowerCase()
  return guess === pokemon.name || guess === '%stop' || guess === '%end'
}

function updateScores(scores: Obj<number>, winner: string) {
  if (!Object.keys(scores).includes(winner)) {
    return { ...scores, [winner]: 1 }
  }

  return { ...scores, [winner]: scores[winner] + 1 }
}

async function playRound(
  message: Message,
  scores: Obj<number>,
  currentRound: number,
  totalRounds: number,
  gen: Gen
): Promise<Obj<number>> {
  const { min, max } = DEX_NUMBERS[gen]
  const pokemon = getRandomPokemon(min, max)
  const [noVowels, noMiddle] = getHints(pokemon.name)
  const pokemonEmbed = getPokemonEmbed(pokemon, currentRound, totalRounds)
  let answers: Collection<string, Message>

  send(message, { embed: pokemonEmbed })

  let hintTimeout: NodeJS.Timeout

  hintTimeout = setTimeout(() => {
    sendEmbed(message, `Hint: ${noMiddle}`)
    hintTimeout = setTimeout(() => {
      sendEmbed(message, `Hint: ${noVowels}`)
    }, 10000)
  }, 20000)

  try {
    answers = await message.channel.awaitMessages(
      (message) => filter(message, pokemon),
      { max: 1, time: 40000, errors: ['time'] }
    )
    clearTimeout(hintTimeout)
  } catch (_) {
    sendEmbed(
      message,
      `Shoot, no one got it! The answer was **${pokemon.name}**!`
    )
    return scores
  }

  const answer = answers.first()!

  if (answer.content.includes('%')) {
    return scores
  }

  const roundWinner = answer.author.username
  const updatedScores = updateScores(scores, roundWinner)

  sendEmbed(
    message,
    `\`${roundWinner}\` got it! The answer was **${capitalise(
      pokemon.name,
      true
    )}**!\nTheir score is now **${updatedScores[roundWinner]}**!`
  )

  return updatedScores
}

export async function pokeguess(message: Message, args: string): Promise<void> {
  const [gen, totalRounds, didParsingFail] = pargeArgs(args)

  if (didParsingFail) {
    sendEmbed(
      message,
      'Invalid command. Type `%help` for command usage instructions.',
      'error'
    )
    return
  }

  let scores: Obj<number> = {}
  let currentRound = 1

  store.startGame(GameType.POKEGUESS)

  while (
    currentRound <= totalRounds &&
    store.getGameType() === GameType.POKEGUESS
  ) {
    scores = await playRound(message, scores, currentRound, totalRounds, gen)
    currentRound = currentRound + 1
    await sleep(5000)
  }

  await sleep(2000)

  if (store.getGameType() === GameType.POKEGUESS) {
    send(message, { embed: getGameOverEmbed(scores) })
    store.endGame()
  }
}
