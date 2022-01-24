import { Client, Message } from 'discord.js'
import { chars, randomNumber } from 'tsu'
import { Color, GameType } from '../types'
import {
  isHorizonBotOrAdminChannel,
  removeItemFromArray,
  send,
  sendActiveGameError
} from '../utils'
import { store } from '../store'
import { qwerty, solutions, validGuesses } from '../assets/wordle.json'

enum Emoji {
  GREEN = ':green_square:',
  YELLOW = ':yellow_square:',
  BLACK = ':black_large_square:'
}

enum KeyState {
  CLEAN,
  NOT_IN_WORD,
  IN_WORD
}

interface Guess {
  word: string
  infoEmojis: Emoji[]
}

interface Keyboard {
  [key: string]: KeyState
}

interface EvaluationResults {
  emojis: Emoji[]
  keyStates: { key: string; state: KeyState }[]
}

/* * */

// convert a letter to its respective regional indicator emoji
function toLetterEmoji(letter: string): string {
  return `:regional_indicator_${letter.toLowerCase()}:`
}

// display current round, previous guesses (and their results), and the keyboard
function printGuesses(
  message: Message,
  {
    round,
    maxRounds,
    guesses,
    keyboard
  }: { round: number; maxRounds: number; guesses: Guess[]; keyboard: Keyboard }
): void {
  const roundStr = `Round: ${round} / ${maxRounds}`

  const emojisStr = guesses.reduce((acc, guess) => {
    const wordEmojis = chars(guess.word).map(toLetterEmoji).join(' ')
    const infoEmojis = guess.infoEmojis.join(' ')

    return `${acc}\n\n${wordEmojis}\n${infoEmojis}`
  }, '')

  const keyboardStr = Object.entries(keyboard).reduce((acc, [key, state]) => {
    let formattedKeyStr = ''

    if (key === 'a') {
      formattedKeyStr += '\n  '
    } else if (key === 'z') {
      formattedKeyStr += '\n    '
    }

    if (state === KeyState.IN_WORD) {
      formattedKeyStr += `**\`${key.toUpperCase()}\`**`
    } else if (state === KeyState.NOT_IN_WORD) {
      formattedKeyStr += `||\`${key.toUpperCase()}\`||`
    } else {
      formattedKeyStr += key
    }

    return `${acc}${formattedKeyStr} `
  }, '')

  send(message, {
    title: 'Wordle',
    description: `${roundStr}\n${emojisStr}\n\n${keyboardStr}`
  })
}

// compare the user's guess to the solution
function evaluateGuess(guess: string, solution: string): EvaluationResults {
  const guessChars = chars(guess)
  const solutionChars = chars(solution)
  let potentialIncorrectChars = solutionChars.filter(
    (_, i) => guessChars[i] !== solutionChars[i]
  )

  return guessChars.reduce<EvaluationResults>(
    (acc, char, idx) => {
      if (guess[idx] === solutionChars[idx]) {
        // it's in the word, in RIGHT place
        return {
          emojis: [...acc.emojis, Emoji.GREEN],
          keyStates: [...acc.keyStates, { key: char, state: KeyState.IN_WORD }]
        }
      } else if (potentialIncorrectChars.includes(char)) {
        // it's in the word, in WRONG place
        potentialIncorrectChars = removeItemFromArray(
          char,
          potentialIncorrectChars
        )

        return {
          emojis: [...acc.emojis, Emoji.YELLOW],
          keyStates: [...acc.keyStates, { key: char, state: KeyState.IN_WORD }]
        }
      } else {
        // it's not in the word
        return {
          emojis: [...acc.emojis, Emoji.BLACK],
          keyStates: [
            ...acc.keyStates,
            { key: char, state: KeyState.NOT_IN_WORD }
          ]
        }
      }
    },
    { emojis: [], keyStates: [] }
  )
}

// update the keyboard with used keys
// (mutates keyboard)
function updateKeyboard(
  keyboard: Keyboard,
  keyStates: { key: string; state: KeyState }[]
): void {
  keyStates.forEach(({ key, state }) => {
    if (keyboard[key] === KeyState.CLEAN) {
      keyboard[key] = state
    } else if (
      keyboard[key] === KeyState.NOT_IN_WORD &&
      state === KeyState.IN_WORD
    ) {
      keyboard[key] = state
    }
  })
}

// filter valid guesses (= followed by a-z characters)
function collectorFilter(message: Message): boolean {
  const content = message.content.toLowerCase().replace(/\s/g, '')

  return ['%stop', '%end'].includes(content) || /^=\s*[a-z]+/.test(content)
}

export function run(message: Message, args: string[], client: Client): void {
  const guildId = message.guild!.id
  const timeStarted = Date.now()

  if (process.env.NODE_ENV === 'development') {
    return
  }

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

  // initialise game
  const MAX_ROUNDS = 6
  let round = 1
  const solution = solutions[randomNumber(solutions.length)]
  const guesses: Guess[] = []
  const keyboard = qwerty.reduce<Keyboard>(
    (acc, letter) => ({ ...acc, [letter]: KeyState.CLEAN }),
    {}
  )

  const collector = message.channel.createMessageCollector(collectorFilter)

  store.startGame(guildId, GameType.WORDLE)

  send(message, {
    title: 'Wordle',
    description: 'Game started! Make your guesses with `=WORD`!',
    footer: 'Hint: all solutions are 5 letters long!'
  })

  collector.on('collect', (m) => {
    const content = m.content.toLowerCase().replace(/\s/g, '')

    // end game if user sends %stop / %end
    if (['%stop', '%end'].includes(content)) {
      collector.stop('CANCEL')
      return
    }

    const guess = content.slice(1)

    // ignore duplicate guesses
    // (tmp: not using onError due to collector.on handling thrown errors)
    if (guesses.some((g) => g.word === guess)) {
      send(message, {
        title: 'Error:',
        description: `"${guess.toUpperCase()}" has already been guessed.`,
        color: Color.ERROR
      })

      return
    }

    // ignore invalid guesses (added to explain 5 character guess limitation)
    // (tmp: not using onError due to collector.on handling thrown errors)
    if (
      (!solutions.includes(guess) && !validGuesses.includes(guess)) ||
      guess.length !== 5
    ) {
      // not valid word
      send(message, {
        title: 'Error:',
        description: `"${guess.toUpperCase()}" is not a valid word.`,
        color: Color.ERROR
      })

      return
    }

    if (guess === solution) {
      guesses.push({
        word: guess,
        // prettier-ignore
        infoEmojis: [Emoji.GREEN, Emoji.GREEN, Emoji.GREEN, Emoji.GREEN, Emoji.GREEN]
      })
      collector.stop('WIN')
      store.endGame(guildId)
    } else {
      const { emojis, keyStates } = evaluateGuess(guess, solution)

      updateKeyboard(keyboard, keyStates)
      guesses.push({ word: guess, infoEmojis: emojis })
      printGuesses(message, { guesses, keyboard, round, maxRounds: MAX_ROUNDS })
    }

    round++

    if (round > MAX_ROUNDS) {
      collector.stop('LOSE')
      store.endGame(guildId)
    }
  })

  collector.once('end', (_, reason) => {
    const timeEnded = Date.now()
    const timeDiff = Math.floor((timeEnded - timeStarted) / 1000)
    const minutes = Math.floor(timeDiff / 60)
    const seconds = timeDiff % 60

    const timeStr = minutes
      ? `${minutes}:${String(seconds).padStart(2, '0')}`
      : `0:${String(seconds).padStart(2, '0')}`

    switch (reason) {
      case 'WIN':
        send(message, {
          title: 'Congration, you done it!',
          description: `Word: **${solution.toUpperCase()}**\nRounds: ${round} / ${MAX_ROUNDS}\nTime: ${timeStr}\n${guesses.reduce(
            (acc, guess) => `${acc}\n${guess.infoEmojis.join('')}`,
            ''
          )}`,
          color: Color.SUCCESS
        })
        break

      case 'LOSE':
        send(message, {
          title: 'Game over!',
          description: `Oh no, no one got it!\nThe word was: ||${solution.toUpperCase()}||.`,
          color: Color.ERROR
        })
        break

      default:
        break
    }
  })
}

export function onError(message: Message, args: string, error: Error): void {
  send(message, {
    title: 'Error:',
    description: error.message,
    color: Color.ERROR
  })
}

export const opts = {
  description: 'Play a game of wordle!',
  usage: '%wordle',
  aliases: ['w']
}
