import { Message } from 'discord.js'
import { store } from '../store'
import { sendEmbed } from '../utils'

export function stop(message: Message): void {
  sendEmbed(
    message,
    `${message.author.username} has ended the game early. Boo them!`
  )
  store.endGame()
}
