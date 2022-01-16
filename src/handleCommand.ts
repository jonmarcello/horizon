import { Client, Message, NewsChannel, TextChannel } from 'discord.js'
import { Obj } from 'tsu'

function log({
  command,
  args,
  channelName,
  author
}: {
  command: string
  args: string[]
  channelName: string
  author: string
}): void {
  const timestamp = new Date().toLocaleString('en-GB')
  const commandStr = `[${timestamp}]: ${author} ran [${command}] in [#${channelName}]`
  const argsStr = args.length
    ? `\n${' '.repeat(13)}arguments: [${args.join(', ')}]`
    : ''

  console.log(`${commandStr}${argsStr}`)
}

export function handleCommand(client: Client, message: Message): void {
  const [commandName, ...args] = message.content.slice(1).split(' ') // args: string[]
  const command = client.commands.get(commandName)

  // exit if command doesn't exist, or is invoked in DMs
  if (!command || !message.guild) return

  // see who broke it this time
  log({
    command: commandName,
    args,
    channelName: (<TextChannel | NewsChannel>message.channel).name,
    author: message.author.username
  })

  try {
    command.run(message, args, client)
  } catch (err) {
    if (command.onError) {
      command.onError(message, args, <Error>err)
    }
  }
}
