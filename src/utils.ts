import { Message, MessageAttachment } from 'discord.js'
import { Obj } from 'tsu'
import { Color, MessageContents } from './types'

/* general */

const reactions = require('./assets/reactions.json')

export function removeItemFromArray<T>(item: T, array: T[]): T[] {
  if (!array.includes(item) || array.length < 1) {
    return array
  }

  const idx = array.indexOf(item)
  return [...array.slice(0, idx), ...array.slice(idx + 1)]
}

export function sortObjectEntries(obj: Obj<number>): Obj<number> {
  return Object.fromEntries(Object.entries(obj).sort((a, b) => b[1] - a[1]))
}

/*  discord */

export function send(
  message: Message,
  {
    title,
    description,
    fields = [],
    image = {},
    footer,
    color = Color.DEFAULT,
    files = []
  }: MessageContents = {}
): void {
  message.channel.send({
    embed: {
      title,
      description,
      fields,
      image,
      color,
      footer: { text: footer }
    },
    files
  })
}

export function sendActiveGameError(message: Message): void {
  send(message, {
    title: 'Error:',
    description: 'A game is already in progress.',
    footer: 'Hint: you can end an active game with %stop!',
    color: Color.ERROR
  })
}

export function isHorizonBotOrAdminChannel(channelId: string): boolean {
  return [
    process.env?.CHANNEL_HB_DISCORDGAMES,
    process.env?.CHANNEL_HB_HORIZONLIKES,
    process.env?.CHANNEL_HB_TESTING,
    process.env?.CHANNEL_HB_ADMIN
  ].includes(channelId)
}

export function arrayToSentence(list: Array<string> | undefined): string {
  if (!list) {
    return '';
  }

  if (list.length === 1) {
    return list.toString();
  }

  return list.slice(0, list.length - 1).join(', ') + ", and " + list.slice(-1)
}

export function fetchRandomReaction(reactionType: string): string {
  if (!reactions[reactionType]) {
    return '';
  }

  return reactions[reactionType][Math.floor(Math.random() * reactions[reactionType].length)] || ''
}