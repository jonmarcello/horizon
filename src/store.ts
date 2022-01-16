import { Obj } from 'tsu'
import { GameType } from './types'

const state = {
  serverGames: <Obj>{}
}

const actions = {
  startGame(serverId: string, type: GameType): void {
    state.serverGames[serverId] = type
  },

  endGame(serverId: string): void {
    state.serverGames[serverId] = GameType.NONE
  }
}

const getters = {
  isGameInProgress: (serverId: string) =>
    Object.keys(state.serverGames).includes(serverId) &&
    state.serverGames[serverId] !== GameType.NONE
}

export const store = {
  ...actions,
  ...getters
}
