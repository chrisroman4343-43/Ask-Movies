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

// Keyword → approximate centroid coordinates for known conflict theatres
const GEO_RULES = [
  { keywords: ['Gaza', 'Hamas', 'Palestinian', 'West Bank'], lat: 31.5, lng: 34.4 },
  { keywords: ['Israel', 'Israeli', 'Tel Aviv', 'Jerusalem', 'IDF'], lat: 31.7, lng: 35.2 },
  { keywords: ['Lebanon', 'Hezbollah', 'Beirut'], lat: 33.8, lng: 35.5 },
  { keywords: ['Ukraine', 'Ukrainian', 'Kyiv', 'Kharkiv', 'Donbas', 'Zelensky'], lat: 48.4, lng: 31.2 },
  { keywords: ['Russia', 'Russian', 'Moscow', 'Kremlin', 'Putin'], lat: 55.7, lng: 37.6 },
  { keywords: ['Syria', 'Damascus', 'Syrian'], lat: 33.5, lng: 36.3 },
  { keywords: ['Iran', 'Tehran', 'Iranian', 'IRGC'], lat: 35.7, lng: 51.4 },
  { keywords: ['Yemen', 'Houthi', 'Sanaa'], lat: 15.4, lng: 44.2 },
  { keywords: ['Red Sea', 'Bab-el-Mandeb'], lat: 15.3, lng: 42.8 },
  { keywords: ['Taiwan', 'Taipei', 'Strait'], lat: 25.0, lng: 121.5 },
  { keywords: ['China', 'Beijing', 'Chinese', 'PLA', 'CCP'], lat: 39.9, lng: 116.4 },
  { keywords: ['North Korea', 'Kim Jong', 'Pyongyang', 'DPRK'], lat: 39.0, lng: 125.8 },
  { keywords: ['Iraq', 'Baghdad', 'Iraqi'], lat: 33.3, lng: 44.4 },
  { keywords: ['Afghanistan', 'Kabul', 'Taliban'], lat: 34.5, lng: 69.2 },
  { keywords: ['Pakistan', 'Islamabad', 'Pakistani'], lat: 33.7, lng: 73.1 },
  { keywords: ['Sudan', 'Khartoum', 'RSF'], lat: 15.5, lng: 32.5 },
  { keywords: ['Libya', 'Tripoli', 'Benghazi'], lat: 32.9, lng: 13.2 },
  { keywords: ['Somalia', 'Mogadishu', 'Al-Shabaab'], lat: 2.0, lng: 45.3 },
  { keywords: ['Ethiopia', 'Addis', 'Tigray', 'Amhara'], lat: 9.0, lng: 38.7 },
  { keywords: ['Myanmar', 'Burma', 'Rangoon', 'Naypyidaw'], lat: 16.8, lng: 96.2 },
  { keywords: ['Kosovo', 'Belgrade', 'Serbia'], lat: 42.7, lng: 21.2 },
  { keywords: ['India', 'Kashmir', 'New Delhi'], lat: 34.0, lng: 74.8 },
]

function assignCoordinates(headline) {
  if (!headline) return {}
  for (const rule of GEO_RULES) {
    if (rule.keywords.some(kw => headline.includes(kw))) {
      return { lat: rule.lat, lng: rule.lng }
    }
  }
  return {}
}

const emittedIds = new Set()

async function fetchFeed(feed) {
  try {
    const result = await parser.parseURL(feed.url)
    return result.items.map(item => {
      const headline = item.title || ''
      return {
        id: item.guid || item.link || item.id,
        source: feed.source,
        headline,
        timestamp: item.pubDate || item.isoDate || new Date().toISOString(),
        link: item.link,
        isBreaking: false,
        ...assignCoordinates(headline),
      }
    })
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

fetchAndEmitFeeds()
setInterval(fetchAndEmitFeeds, 120_000)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', seenArticles: emittedIds.size })
})

app.listen(PORT, () => {
  console.log(`Shadow Wire server listening on port ${PORT}`)
})
