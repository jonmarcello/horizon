import { Message } from 'discord.js'
import { capitalise, randomNumber } from 'tsu'
import { send, sendEmbed } from '../old_utils'

export function choose(message: Message, args: string): void {
  if (!args || !args.includes('/')) {
    sendEmbed(
      message,
      'Please provide a list of choices, separated by `/`s (eg. `%choose choice1 / choice2`).',
      'error'
    )

    return
  }

  const options = args
    .replace(/^\/|\/$/g, '')
    .split('/')
    .map((s) => s.trim())
    .map((s) => (s === '' ? '<empty>' : s))

  console.log(options)

  const option = options[randomNumber(options.length)]
  const embed = {
    color: '#6366F1',
    title: 'A decision has been made...',
    description: capitalise(option)
  }

  send(message, { embed })
}
