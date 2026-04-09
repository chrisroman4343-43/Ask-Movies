import express from 'express'
import { Server } from 'socket.io'
import cors from 'cors'
import RSSParser from 'rss-parser'

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

const parser = new RSSParser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; ConflictIntel/1.0)',
  },
})

const RSS_FEEDS = [
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
  { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World' },
  { url: 'https://www.defensenews.com/arc/outboundfeeds/rss/category/global/', source: 'Defense News' },
]

const emittedIds = new Set()

async function fetchFeed(feed) {
  try {
    const result = await parser.parseURL(feed.url)
    return result.items.map(item => ({
      id: item.guid || item.link || item.id,
      source: feed.source,
      headline: item.title,
      timestamp: item.pubDate || item.isoDate || new Date().toISOString(),
      link: item.link,
      isBreaking: false,
    }))
  } catch (err) {
    console.error(`Failed to fetch ${feed.source}: ${err.message}`)
    return []
  }
}

async function fetchAndEmitFeeds() {
  console.log('Polling RSS feeds...')
  const results = await Promise.allSettled(RSS_FEEDS.map(fetchFeed))

  const allItems = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .filter(item => item.id && item.headline)

  let newCount = 0
  for (const item of allItems) {
    if (!emittedIds.has(item.id)) {
      emittedIds.add(item.id)
      io.emit('intelAlert', item)
      newCount++
    }
  }

  console.log(`Emitted ${newCount} new articles (${emittedIds.size} total seen)`)
}

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

// Initial fetch on startup, then every 2 minutes
fetchAndEmitFeeds()
setInterval(fetchAndEmitFeeds, 120_000)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', seenArticles: emittedIds.size })
})

app.listen(PORT, () => {
  console.log(`Shadow Wire server listening on port ${PORT}`)
})
