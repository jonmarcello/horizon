import { Message } from 'discord.js'
import { capitalise, randomNumber } from 'tsu'
import { send, sendEmbed } from '../utils'

export function choose(message: Message, args: string): void {
  if (!args || !args.includes('/')) {
    sendEmbed(
      message,
      'Please provide a list of choices, separated by `/`s (eg. `%choose choice1 / choice2`).',
      'error'
    )
  }

  const options = args.split('/').map((s) => s.trim())

  const option = options[randomNumber(options.length)]
  const embed = {
    color: '#6366F1',
    title: 'A decision has been made...',
    description: capitalise(option)
  }

  send(message, { embed })
}
