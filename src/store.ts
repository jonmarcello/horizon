import { Fn } from 'tsu'
import { GameType } from './types'

const state = {
  currentGame: GameType.NONE,
  timeout: null as NodeJS.Timeout | null
}

const actions = {
  startGame(type: GameType): void {
    state.currentGame = type
  },

  endGame(): void {
    state.currentGame = GameType.NONE
    this.clearTimeout()
  },

  setTimeout(fn: Fn, duration: number): void {
    state.timeout = setTimeout(fn, duration)
  },

  clearTimeout(): void {
    if (state.timeout) {
      clearTimeout(state.timeout)
    }
  }
}

const getters = {
  isGameInProgress: () => state.currentGame !== GameType.NONE,
  currentGame: () => state.currentGame
}

export const store = {
  ...actions,
  ...getters
}
