import { Message } from 'discord.js'
import { capitalise, randomNumber } from 'tsu'
import { send, sendEmbed } from '../utils'
const _quotesRegex = /\s*((?:\w(?!\s+")+|\s(?!\s*"))+\w)\s*/g

export function choose(message: Message, args: string): void {
  const options = args.match(_quotesRegex)

  if (!options) {
    sendEmbed(
      message,
      'Please provide a list of choices inside double quotes (eg. `%choose "choice1" "choice2"`).',
      'error'
    )
  } else {
    const option = options[randomNumber(options.length)]
    const embed = {
      color: '#6366F1',
      title: 'A decision has been made...',
      description: capitalise(option)
    }

    send(message, { embed })
  }
}
