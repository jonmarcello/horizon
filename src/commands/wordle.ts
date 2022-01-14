import { Client, Message } from 'discord.js'
import { chars, randomNumber } from 'tsu'
import { Color, GameType } from '../types'
import {
  isPermittedHorizonChannel,
  prettySend,
  removeItemFromArray,
  sendActiveGameError
} from '../utils'
import { store } from '../store'
import { qwerty, solutions, validGuesses } from '../assets/wordle.json'

enum KeyState {
  CLEAN,
  NOT_IN_WORD,
  IN_WORD
}

enum Emoji {
  GREEN = ':green_square:',
  YELLOW = ':yellow_square:',
  BLACK = ':black_large_square:'
}

interface Guess {
  word: string
  infoEmojis: Emoji[]
}

interface EvaluationResults {
  emojis: Emoji[]
  keyStates: { key: string; state: KeyState }[]
}

type Keyboard = Record<string, KeyState>

/* * */

function toLetterEmoji(letter: string): string {
  return `:regional_indicator_${letter}:`
}

function printGuesses(
  message: Message,
  {
    round,
    guesses,
    keyboard
  }: { round: number; guesses: Guess[]; keyboard: Keyboard }
): void {
  const roundStr = `Round: ${round} / 10`

  const emojisStr = guesses.reduce((acc, guess) => {
    const wordEmojis = chars(guess.word).map(toLetterEmoji).join(' ')
    const infoEmojis = guess.infoEmojis.join(' ')

    return `${acc}\n\n${wordEmojis}\n${infoEmojis}`
  }, '')

  const keyboardStr = Object.entries(keyboard).reduce(
    (acc, [key, state], idx) => {
      const isNewLine = idx === 10 || idx === 19
      let formattedKey

      if (state === KeyState.IN_WORD) {
        formattedKey = `**\`${key.toUpperCase()}\`**`
      } else if (state === KeyState.NOT_IN_WORD) {
        formattedKey = `~~\`${key.toUpperCase()}\`~~`
      } else {
        formattedKey = key
      }

      return `${acc}${isNewLine ? '\n' : ''}${formattedKey} `
    },
    ''
  )

  prettySend(message, {
    title: 'Wordle',
    description: `${roundStr}\n${emojisStr}\n\n${keyboardStr}`
  })
}

function evaluateGuess(guess: string, solution: string): EvaluationResults {
  const guessChars = chars(guess)
  const solutionChars = chars(solution)
  let potentialChars = solutionChars.filter(
    (_, i) => guessChars[i] !== solutionChars[i]
  )

  return guessChars.reduce<EvaluationResults>(
    (acc, char, idx) => {
      if (guess[idx] === solutionChars[idx]) {
        // it's in the word, in RIGHT place

        potentialChars = removeItemFromArray(char, potentialChars)

        return {
          emojis: [...acc.emojis, Emoji.GREEN],
          keyStates: [...acc.keyStates, { key: char, state: KeyState.IN_WORD }]
        }
      } else if (potentialChars.includes(char)) {
        // it's in the word, in WRONG place

        potentialChars = removeItemFromArray(char, potentialChars)

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

function filter(message: Message): boolean {
  const content = message.content.toLowerCase().replace(/\s/g, '')

  return (
    ['%stop', '%end'].includes(content) || /^=[a-z]+/.test(content)
    // /^=[a-z][a-z][a-z][a-z][a-z]$/.test(content)
  )
}

export function run(message: Message, args: string[], client: Client): void {
  const guildId = message.guild!.id

  if (guildId === process.env.SERVER_HB) {
    const channelId = Number(message.channel.id)

    if (!isPermittedHorizonChannel(channelId)) {
      throw new Error("This command isn't allowed in this channel.")
    }
  }

  if (store.isGameInProgress(guildId)) {
    sendActiveGameError(message)
    return
  }

  const solution = solutions[randomNumber(solutions.length)]
  // const solution = 'still' // guess: SILLY
  // const solution = 'sober' // guess: SEWER
  // const solution = 'folio' // guess: FOLLY
  console.log(`WORDLE SOLUTION: ${solution}`)

  const guesses: Guess[] = []
  const keyboard = qwerty.reduce<Keyboard>(
    (acc, letter) => ({ ...acc, [letter]: KeyState.CLEAN }),
    {}
  )

  let round = 1

  const collector = message.channel.createMessageCollector(filter)

  prettySend(message, {
    title: 'Wordle',
    description: 'Game started! Make your guesses with `=WORD`!',
    footer: 'Hint: Bold letters are correct, linethrough letters are incorrect!'
  })

  collector.on('collect', (m) => {
    const content = m.content.toLowerCase().replace(/\s/g, '')
    if (['%stop', '%end'].includes(content)) {
      collector.stop('CANCEL')
      return
    }

    const guess = content.slice(1)

    if (
      (!solutions.includes(guess) && !validGuesses.includes(guess)) ||
      guess.length !== 5
    ) {
      // not valid word
      prettySend(message, {
        title: 'Invalid Word',
        description: `"${guess.toUpperCase()}" is not a valid word.`,
        color: Color.ERROR
      })

      return
    }

    if (guess === solution) {
      // correct guess
      guesses.push({
        word: guess,
        // prettier-ignore
        infoEmojis: [Emoji.GREEN, Emoji.GREEN, Emoji.GREEN, Emoji.GREEN, Emoji.GREEN]
      })
      collector.stop('WIN')
      store.endGame(guildId)
    } else {
      // valid, incorrect guess
      const { emojis, keyStates } = evaluateGuess(guess, solution)

      // YUCKY MUTABLE EW
      updateKeyboard(keyboard, keyStates)

      guesses.push({ word: guess, infoEmojis: emojis })

      printGuesses(message, {
        guesses,
        keyboard,
        round
      })
    }

    round++

    if (round > 10) {
      collector.stop('LOSE')
      store.endGame(guildId)
    }
  })

  collector.on('end', (_, reason) => {
    switch (reason) {
      case 'WIN':
        prettySend(message, {
          title: 'Congration, you done it!',
          description: `Word: **${solution.toUpperCase()}**\nRounds: ${round} / 10\n${guesses.reduce(
            (acc, guess) => `${acc}\n${guess.infoEmojis.join('')}`,
            ''
          )}`,
          color: Color.SUCCESS
        })
        break

      case 'LOSE':
        prettySend(message, {
          title: 'Game over!',
          description: `Oh no, no one got it!\nThe word was: ||${solution.toUpperCase()}||.`,
          color: Color.ERROR
        })
        break

      default:
        break
    }
  })

  store.startGame(guildId, GameType.WORDLE)
}

export function onError(message: Message, args: string, error: Error): void {
  prettySend(message, {
    title: 'Error:',
    description: error.message,
    // footer: 'Hint: ',
    color: Color.ERROR
  })
}

export const opts = {
  name: 'wordle',
  description: '',
  aliases: []
}
