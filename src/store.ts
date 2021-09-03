import {
  GameType,
  HorizonActions,
  HorizonGetters,
  HorizonState,
  HorizonStore
} from './types'
import { Fn } from 'tsu'

const state: HorizonState = {
  gameType: GameType.NONE,
  timeout: null
}

const actions: HorizonActions = {
  startGame(type: GameType): void {
    state.gameType = type
  },
  endGame(): void {
    state.gameType = GameType.NONE
    this.clearTimeout()
  },

  setTimeout(fn: Fn, time: number): void {
    state.timeout = setTimeout(fn, time)
  },
  clearTimeout(): void {
    if (state.timeout) {
      clearTimeout(state.timeout)
    }
  }
}

const getters: HorizonGetters = {
  getIsGameActive: () => state.gameType !== GameType.NONE,
  getGameType: () => state.gameType
}

export const store: HorizonStore = {
  ...actions,
  ...getters
}
