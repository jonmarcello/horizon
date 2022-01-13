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

function filter(message: Message, pokemon: Pokemon): boolean {
  const guess = message.content.toLowerCase()
  return guess === pokemon.name || guess === '%stop' || guess === '%end'
}

async function playRound(
  message: Message,
  scores: Obj<number>,
  currentRound: number,
  totalRounds: number,
  gen: Gen
): Promise<Obj<number>> {
  let answers: Collection<string, Message>

  send(message, { embed: pokemonEmbed })

  try {
    answers = await message.channel.awaitMessages(
      (message) => filter(message, pokemon),
      { max: 1, time: 40000, errors: ['time'] }
    )
  } catch (_) {
    sendEmbed(
      message,
      `Shoot, no one got it! The answer was **${pokemon.name}**!`
    )
    return scores
  }

  const answer = answers.first()!

  if (answer.content.includes('%')) {
    // end
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
