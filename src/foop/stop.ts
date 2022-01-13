import { Message } from 'discord.js'
import { store } from '../old_store'
import { sendEmbed } from '../old_utils'

export function stop(message: Message): void {
  sendEmbed(
    message,
    `${message.author.username} has ended the game early. Boo them!`
  )
  store.endGame()
}
