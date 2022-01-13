import { Client, Message } from 'discord.js'

export type Command = {
  run: (m: Message, as: string[], c: Client) => void
  opts: {
    name: string
    usage: string
    aliases?: string[]
    game?: boolean
  }
  onError?: (m: Message, as: string[], e: Error) => void
}

export enum GameType {
  NONE = 'none',
  ACDRAW = 'acdraw',
  WORDLE = 'wordle'
}

export enum Color {
  DEFAULT = '#6366f1',
  SUCCESS = '#33b136',
  ERROR = '#b91c1c'
}

// import { Fn } from 'tsu'

// export type Gen =
//   | 'gen1'
//   | 'gen2'
//   | 'gen3'
//   | 'gen4'
//   | 'gen5'
//   | 'gen6'
//   | 'gen7'
//   | 'gen8'
//   | 'all'

// export enum GameType {
//   NONE,
//   POKEDRAW,
//   POKEGUESS,
//   ACDRAW
// }

// export type HorizonState = {
//   gameType: GameType
//   timeout: NodeJS.Timeout | null
// }

// export type HorizonActions = {
//   startGame: (type: GameType) => void
//   endGame: () => void
//   setTimeout: (fn: Fn, time: number) => void
//   clearTimeout: () => void
// }

// export type HorizonGetters = {
//   getIsGameActive: () => boolean
//   getGameType: () => GameType
// }

// export type HorizonStore = HorizonActions & HorizonGetters

// export type Pokemon = {
//   name: string
//   number: string
// }
