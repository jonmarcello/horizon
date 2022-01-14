import { GameType } from './types'

const state = {
  currentGame: GameType.NONE,
  serverGames: {
    [process.env.SERVER_HB!]: GameType.NONE,
    [process.env.SERVER_MR!]: GameType.NONE
  }
}

const actions = {
  startGame(serverId: string, type: GameType): void {
    state.serverGames[serverId] = type
    console.log('Updated', JSON.stringify(state.serverGames))
  },

  endGame(serverId: string): void {
    state.serverGames[serverId] = GameType.NONE
  }
}

const getters = {
  isGameInProgress: (serverId: string) =>
    state.serverGames[serverId] !== GameType.NONE,
  currentGame: () => state.currentGame
}

export const store = {
  ...actions,
  ...getters
}
