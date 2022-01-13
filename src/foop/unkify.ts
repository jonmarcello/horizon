import { randomNumber } from 'tsu'
import { send } from '../old_utils'
import { dictionary, typos } from '../assets/unkie.json'
import { Message } from 'discord.js'

/* utils */

function randomArrayItem<T>(array: T[]): T {
  return array[randomNumber(array.length)]
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffledArray = [...array]

  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = randomNumber(i + 1)
    const tmp = shuffledArray[i]
    shuffledArray[i] = shuffledArray[j]
    shuffledArray[j] = tmp
  }

  return shuffledArray
}

function splitOnFirstSpace(str: string): [string, string] {
  if (!str || !str.length) {
    return ['', '']
  }

  const [firstWord, ...rest] = str.split(/(?<=^\S+)\s/)
  return [firstWord, rest[0]]
}

/* corruptors */
function typoWord(word: string, shouldReplaceChar: boolean): string {
  const typoPosition = randomNumber(word.length)
  const letterToTypo = word[typoPosition] as keyof typeof typos
  const typo = /[a-zA-Z]/.test(letterToTypo)
    ? randomArrayItem(typos[letterToTypo])
    : letterToTypo

  return (
    word.slice(0, typoPosition) +
    typo +
    word.slice(typoPosition + +shouldReplaceChar)
  )
}

function deleteChar(word: string): string {
  const deletePosition = randomNumber(word.length)
  return word.slice(0, deletePosition) + word.slice(deletePosition + 1)
}

function shuffleWord(word: string): string {
  const wordMiddle = word.slice(1, word.length - 1)
  const shuffledWordMiddle = shuffleArray(wordMiddle.split('')).join('')
  return word[0] + shuffledWordMiddle + word[word.length - 1]
}

/* main functions */
function corrupt(word: string): string {
  // if word has been predefined, skip corruptions
  const isInDictionary = Object.keys(dictionary).includes(word.toLowerCase())
  if (isInDictionary) {
    return dictionary[word.toLowerCase() as keyof typeof dictionary]
  }

  // ensure _some_ readability
  if (word.length <= 2) return word

  switch (randomNumber(15)) {
    case 0:
      return typoWord(word, false)
    case 1:
      return typoWord(word, true)
    case 2:
      return deleteChar(word)
    case 3:
      return shuffleWord(word)
    default:
      return word
  }
}

function unkifyContent(content: string, timesToRepeat: number): string {
  let unkifiedContent = content

  for (let i = 0; i < timesToRepeat; i++) {
    unkifiedContent = unkifiedContent.split(' ').map(corrupt).join(' ')
  }

  return unkifiedContent
}

export function unkify(message: Message, content: string): void {
  if (!content) {
    send(message, '[unkify]: Please provide a phrase to unkify.')
    return
  }

  const [unkifyArg, restOfContent] = splitOnFirstSpace(content)
  let unkifiedContent = ''

  if (isNaN(Number(unkifyArg))) {
    unkifiedContent = unkifyContent(`${unkifyArg} ${restOfContent || ''}`, 1)
  } else if (Number(unkifyArg) <= 0) {
    unkifiedContent = unkifyContent(restOfContent, 1)
  } else if (Number(unkifyArg) > 100) {
    unkifiedContent = unkifyContent(restOfContent, 100)
  } else {
    unkifiedContent = unkifyContent(restOfContent, Number(unkifyArg))
  }

  send(message, '📣<:kneel:868571832549265449>📣 ' + unkifiedContent)
}
