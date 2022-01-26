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
  number: string
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
function toNumberEmoji(
  number: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
): string {
  const numberEmojis = {
    '0': ':zero:',
    '1': ':one:',
    '2': ':two:',
    '3': ':three:',
    '4': ':four:',
    '5': ':five:',
    '6': ':six:',
    '7': ':seven:',
    '8': ':eight:',
    '9': ':nine:'
  }

  return numberEmojis[number]
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
    // (this is good code)
    const wordEmojis = (
      chars(guess.number) as (
        | '0'
        | '1'
        | '2'
        | '3'
        | '4'
        | '5'
        | '6'
        | '7'
        | '8'
        | '9'
      )[]
    )
      .map(toNumberEmoji)
      .join(' ')
    const infoEmojis = guess.infoEmojis.join(' ')

    return `${acc}\n\n${wordEmojis}\n${infoEmojis}`
  }, '')

  const keyboardStr = Object.entries(keyboard).reduce((acc, [key, state]) => {
    let formattedKeyStr = ''

    if (key === '5') {
      formattedKeyStr += '\n'
    }

    if (state === KeyState.IN_WORD) {
      formattedKeyStr += `**\`${key}\`**`
    } else if (state === KeyState.NOT_IN_WORD) {
      formattedKeyStr += `||\`${key}\`||`
    } else {
      formattedKeyStr += key
    }

    return `${acc}${formattedKeyStr} `
  }, '')

  send(message, {
    title: 'Numble',
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

  return ['%stop', '%end'].includes(content) || /^=\s*[0-9]+/.test(content)
}

export function run(message: Message, args: string[], client: Client): void {
  const guildId = message.guild!.id
  const timeStarted = Date.now()

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
  const solution = String(randomNumber(10000, 1000))
  const guesses: Guess[] = []
  const keyboard = [...new Array(10)]
    .map((_, i) => String(i))
    .reduce<Keyboard>(
      (acc, letter) => ({ ...acc, [letter]: KeyState.CLEAN }),
      {}
    )

  const collector = message.channel.createMessageCollector(collectorFilter)

  store.startGame(guildId, GameType.WORDLE)

  send(message, {
    title: 'Numble',
    description:
      'Can you guess the secret 4 digit number?\nMake your guesses with `=NUMBER`!',
    footer: 'Hint: all solutions are 4 numbers long, and CANNOT start with a 0!'
  })

  collector.on('collect', (m) => {
    const content = m.content.replace(/\s/g, '')

    // end game if user sends %stop / %end
    if (['%stop', '%end'].includes(content)) {
      collector.stop('CANCEL')
      return
    }

    const guess = content.slice(1)

    // ignore duplicate guesses
    // (tmp: not using onError due to collector.on handling thrown errors)
    if (guesses.some((g) => g.number === guess)) {
      send(message, {
        title: 'Error:',
        description: `"${guess}" has already been guessed.`,
        color: Color.ERROR
      })

      return
    }

    // ignore invalid guesses (added to explain 5 character guess limitation)
    // (tmp: not using onError due to collector.on handling thrown errors)
    if (guess.length !== 4) {
      // not valid word
      send(message, {
        title: 'Error:',
        description: `"${guess}" is not a valid number.`,
        color: Color.ERROR
      })

      return
    }

    if (guess === solution) {
      guesses.push({
        number: guess,
        // prettier-ignore
        infoEmojis: [Emoji.GREEN, Emoji.GREEN, Emoji.GREEN, Emoji.GREEN]
      })
      collector.stop('WIN')
      store.endGame(guildId)
    } else {
      const { emojis, keyStates } = evaluateGuess(guess, solution)

      updateKeyboard(keyboard, keyStates)
      guesses.push({ number: guess, infoEmojis: emojis })
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
          description: `Number: **${solution}**\nRounds: ${round} / ${MAX_ROUNDS}\nTime: ${timeStr}\n${guesses.reduce(
            (acc, guess) => `${acc}\n${guess.infoEmojis.join('')}`,
            ''
          )}`,
          color: Color.SUCCESS
        })
        break

      case 'LOSE':
        send(message, {
          title: 'Game over!',
          description: `Oh no, no one got it!\nThe number was: ||${solution.toUpperCase()}||.`,
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
  description: 'Play a game of numble!',
  usage: '%numble',
  aliases: ['n']
}
