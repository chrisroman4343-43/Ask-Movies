import express from 'express'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

const io = new Server(app, {
  cors: {
    origin: 'http://localhost:5174',
    methods: ['GET', 'POST'],
  },
})

// Mock alert templates
const mockHeadlines = [
  'Unverified reports of localized disruptions detected in Eastern sectors',
  'Intelligence chatter elevated across multiple monitored frequencies',
  'Civilian displacement signals detected in border region monitoring',
  'Strategic asset positioning changes observed via satellite imagery',
  'Encrypted communications spike detected in surveillance network',
  'Cross-border movement patterns showing unusual activity',
  'Supply line disruptions reported by field assets',
  'Telecommunications infrastructure degradation in theater zone',
]

const mockSources = [
  'SIGINT Monitor',
  'HUMINT Network',
  'Satellite Feed',
  'Telegram Channel Monitor',
  'Scanner Audio Relay',
]

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

// Emit mock alerts every 15 seconds
setInterval(() => {
  const headline =
    mockHeadlines[Math.floor(Math.random() * mockHeadlines.length)]
  const source = mockSources[Math.floor(Math.random() * mockSources.length)]

  const alert = {
    id: Date.now(),
    source,
    headline,
    timestamp: new Date().toISOString(),
    isBreaking: Math.random() > 0.6, // 40% chance of breaking
  }

  console.log(`Emitting alert: ${alert.headline}`)
  io.emit('intelAlert', alert)
}, 15000)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Shadow Wire server listening on port ${PORT}`)
})
