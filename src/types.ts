import { Client, Message, MessageAttachment } from 'discord.js'

/* enums */

export enum GameType {
  NONE = 'none',
  PIXELMON = 'pixelmon',
  WORDLE = 'wordle'
}

export enum Color {
  DEFAULT = '#6366f1',
  SUCCESS = '#33b136',
  ERROR = '#b91c1c'
}

export enum PokemonGen {
  GEN_I = 'gen1',
  GEN_II = 'gen2',
  GEN_III = 'gen3',
  GEN_IV = 'gen4',
  GEN_V = 'gen5',
  GEN_VI = 'gen6',
  GEN_VII = 'gen7',
  GEN_VIII = 'gen8',
  GEN_ALL = 'all'
}

/* interfaces */

export interface CommandOpts {
  description: string
  usage: string
  aliases?: string[]
}

export interface Command {
  run: (m: Message, as: string[], c: Client) => void
  onError?: (m: Message, as: string[], e: Error) => void
  opts: CommandOpts
}

export interface MessageContents {
  title?: string
  description?: string
  fields?: { name: string; value: string; inline?: boolean }[]
  image?: { url?: string }
  footer?: string
  color?: Color
  files?: MessageAttachment[]
}

export interface Pokemon {
  name: string
  number: string
  type: string
  generation: number
  pixels: string[]
}
