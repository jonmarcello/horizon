import { Client, Message, MessageAttachment } from 'discord.js'
import { Color, MessageContents, Pokemon } from '../types'
import { send } from '../utils'
import { pokemon as pokemonData } from '../assets/pokemon.json'
import { Canvas, createCanvas } from 'canvas'

function getCanvasDrawing(pixels: string[]): Canvas {
  const canvas = createCanvas(99, 99)
  const ctx = canvas.getContext('2d')
  const SQUARE_SIZE = 33

  pixels.forEach((color, idx) => {
    const topLeft = [(idx % 3) * SQUARE_SIZE, Math.floor(idx / 3) * SQUARE_SIZE]

    if (color !== 'transparent') {
      ctx.fillStyle = color
      ctx.fillRect(topLeft[0], topLeft[1], SQUARE_SIZE, SQUARE_SIZE)
    }
  })

  return canvas
}

export async function run(
  message: Message,
  args: string[],
  client: Client
): Promise<void> {
  const name = args[0].toLowerCase().trim()
  const pokemon = pokemonData.find((p) => p.name === name)

  if (!pokemon) {
    throw new Error('Pokémon not found')
  }

  const drawing = getCanvasDrawing(pokemon.pixels)
  const attachment = new MessageAttachment(drawing.toBuffer(), `pixels.png`)

  message.reply(attachment)
}

export function onError(message: Message, args: string, error: Error): void {
  send(message, {
    title: 'Error:',
    description: error.message,
    color: Color.ERROR
  })
}

export const opts = {
  description: "Display a Pokémon's pixels.",
  usage: '%pixelmon <rounds> <gen/all>',
  aliases: ['d:pm']
}
