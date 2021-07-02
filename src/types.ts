import { Fn } from '@eb3n/outils'

export type Gen =
  | 'gen1'
  | 'gen2'
  | 'gen3'
  | 'gen4'
  | 'gen5'
  | 'gen6'
  | 'gen7'
  | 'gen8'
  | 'all'

export enum GameType {
  NONE,
  POKEDRAW,
  POKEGUESS
}

export type HorizonState = {
  gameType: GameType
  timeout: NodeJS.Timeout | null
}

export type HorizonActions = {
  startGame: (type: GameType) => void
  endGame: () => void
  setTimeout: (fn: Fn, time: number) => void
  clearTimeout: () => void
}

export type HorizonGetters = {
  getIsGameActive: () => boolean
  getGameType: () => GameType
}

export type HorizonStore = HorizonActions & HorizonGetters

export type Pokemon = {
  name: string
  number: string
}
