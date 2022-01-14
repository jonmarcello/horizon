import { MessageOptions } from 'child_process'
import {
  APIMessageContentResolvable,
  Message,
  MessageAdditions
} from 'discord.js'
import { Color } from './types'

/* general */

export function removeItemFromArray<T>(item: T, array: T[]): T[] {
  if (!array.includes(item) || array.length < 1) {
    return array
  }

  const idx = array.indexOf(item)
  return [...array.slice(0, idx), ...array.slice(idx + 1)]
}

/*  discord */
export function prettySend(
  message: Message,
  {
    title,
    description,
    footer,
    color = Color.DEFAULT
  }: {
    title?: string
    description?: string
    footer?: string
    color?: Color
  } = {}
): void {
  message.channel.send({
    embed: {
      title,
      description,
      color,
      footer: {
        text: footer
      }
    }
  })
}

export function send(
  message: Message,
  content:
    | APIMessageContentResolvable
    | (MessageOptions & {
        split?: false | undefined
      })
    | MessageAdditions
): void {
  message.channel.send(content || '_ _')
}

export function sendActiveGameError(message: Message): void {
  prettySend(message, {
    title: 'Error:',
    description: 'A game is already in progress.',
    footer: 'Hint: you can end an active game with %stop!',
    color: Color.ERROR
  })
}

export function isPermittedHorizonChannel(channelId: number): boolean {
  return [
    Number(process.env?.CHANNEL_HB_DISCORDGAMES),
    Number(process.env?.CHANNEL_HB_TESTING),
    Number(process.env?.CHANNEL_HB_HORIZONLIKES)
  ].includes(channelId)
}
