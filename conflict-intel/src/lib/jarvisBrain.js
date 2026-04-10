/**
 * JARVIS brain — a local answer engine that synthesises responses in
 * the voice of Tony Stark's AI using live OSINT data.
 *
 * Personality:
 *   - Dry British wit, formal politeness, always addresses the user as "sir"
 *   - Calm under pressure, analytical, never panicked
 *   - Proactive: mentions things unprompted ("if I may"), anticipates follow-ups
 *   - Occasionally sarcastic, never rude
 *
 * Zero network calls: works offline. The contract is:
 *     jarvisRespond(query, alerts) -> string
 *     welcomeLine(alerts) -> string
 */

const GREETING_WORDS = ['hi', 'hello', 'hey', 'jarvis', 'yo', 'greetings', 'hiya']
const STATUS_WORDS   = ['status', 'sitrep', 'report', 'briefing', 'brief me', 'online', 'you there', 'are you there', 'situation']

const REGIONS = {
  ukraine: {
    label: 'Ukraine',
    keywords: ['ukraine', 'ukrainian', 'kyiv', 'kiev', 'zaporizhzhia', 'zaporizh', 'kharkiv', 'donbas', 'donetsk', 'luhansk', 'russia', 'russian', 'crimea', 'moscow', 'putin', 'zelensky'],
    commentary: 'The eastern European theatre remains the most data-rich on my monitors, sir — artillery duels, drone sorties, and constant line-of-contact movement.',
  },
  israel: {
    label: 'the Israeli theatre',
    keywords: ['israel', 'israeli', 'gaza', 'west bank', 'idf', 'tel aviv', 'jerusalem', 'rafah', 'hamas'],
    commentary: 'The Levant remains highly volatile, sir — I recommend you keep half an eye on it at all times.',
  },
  lebanon: {
    label: 'the Lebanese border',
    keywords: ['lebanon', 'lebanese', 'hezbollah', 'beirut', 'hizbullah', 'blue line'],
    commentary: 'Cross-border fire incidents on the Blue Line tend to cluster in the evening hours, sir.',
  },
  taiwan: {
    label: 'the Taiwan Strait',
    keywords: ['taiwan', 'taiwanese', 'pla', 'strait', 'indopacom', 'taipei'],
    commentary: 'PLA activity in the median line remains the dominant signal out of the Indo-Pacific, sir.',
  },
  china: {
    label: 'China and the Indo-Pacific',
    keywords: ['china', 'chinese', 'beijing', 'south china sea', 'indo-pacific', 'spratly', 'paracel'],
    commentary: 'Beijing\'s movements in the South China Sea warrant continuous observation, sir.',
  },
  redsea: {
    label: 'the Red Sea corridor',
    keywords: ['red sea', 'houthi', 'yemen', 'hodeidah', 'bab el-mandeb', 'bab al-mandeb', 'sanaa'],
    commentary: 'Commercial shipping through Bab el-Mandeb is down roughly sixty percent from baseline, sir. The insurance underwriters are, as you might imagine, having a rather difficult time.',
  },
  iran: {
    label: 'Iran',
    keywords: ['iran', 'iranian', 'tehran', 'irgc', 'revolutionary guard', 'natanz'],
    commentary: 'Tehran remains characteristically opaque, sir. I extrapolate from satellite and SIGINT where I can.',
  },
  syria: {
    label: 'Syria',
    keywords: ['syria', 'syrian', 'damascus', 'aleppo', 'idlib'],
    commentary: 'The Syrian file is fragmentary but persistent, sir.',
  },
  northkorea: {
    label: 'the Korean peninsula',
    keywords: ['north korea', 'dprk', 'pyongyang', 'korean peninsula', 'kim jong'],
    commentary: 'Pyongyang\'s test schedule has been, if I may, rather predictable of late, sir.',
  },
  sudan: {
    label: 'Sudan',
    keywords: ['sudan', 'khartoum', 'rsf', 'darfur'],
    commentary: 'The Sudanese conflict is under-reported in the mainstream wire, sir — I flag it whenever I can.',
  },
  africa: {
    label: 'the Sahel',
    keywords: ['sahel', 'mali', 'niger', 'burkina', 'chad', 'wagner'],
    commentary: 'The Sahel is a quiet but consequential front, sir.',
  },
}

function timeOfDayGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning, sir'
  if (h < 18) return 'Good afternoon, sir'
  return 'Good evening, sir'
}

function plural(n, singular, pluralForm) {
  return n === 1 ? singular : (pluralForm || `${singular}s`)
}

function alertText(a) {
  return `${a.headline || ''} ${a.region || ''} ${a.source || ''} ${a.text || ''}`.toLowerCase()
}

function filterByKeywords(alerts, keywords) {
  return alerts.filter((a) => {
    const t = alertText(a)
    return keywords.some((k) => t.includes(k))
  })
}

function matchRegion(q) {
  for (const [key, val] of Object.entries(REGIONS)) {
    if (val.keywords.some((k) => q.includes(k))) {
      return { key, ...val }
    }
  }
  return null
}

function topHeadlines(alerts, n = 3) {
  return alerts.slice(0, n).map((a) => {
    const src = a.source ? `${a.source}: ` : ''
    return `${src}${a.headline || '(no headline)'}`
  }).join('. ')
}

function bulletHeadlines(alerts, n = 3) {
  return alerts.slice(0, n).map((a) => `— ${a.headline}`).join(' ')
}

/**
 * The initial line JARVIS speaks when the panel opens.
 */
export function welcomeLine(alerts) {
  const total    = alerts.length
  const breaking = alerts.filter((a) => a.isBreaking).length

  if (total === 0) {
    return `${timeOfDayGreeting()}. All systems are nominal. I am listening on every frequency currently worth listening on, and I shall inform you the moment anything of consequence develops. How may I be of service?`
  }

  const breakingNote = breaking > 0
    ? `, ${breaking} of which ${plural(breaking, 'is', 'are')} presently flagged as breaking`
    : ''

  return `${timeOfDayGreeting()}. I am tracking ${total} active ${plural(total, 'incident')} across the global theatre${breakingNote}. Shall I brief you, sir?`
}

/**
 * Main response synthesiser. Takes a natural-language query and the current
 * alerts, returns a string in Jarvis' voice.
 */
export function jarvisRespond(query, alerts) {
  const q = (query || '').toLowerCase().trim()
  const total    = alerts.length
  const breaking = alerts.filter((a) => a.isBreaking).length

  if (!q) {
    return "I beg your pardon, sir. I didn't quite catch that."
  }

  // --- Identity / meta ---
  if (/who are you|what are you|your name|who is this/.test(q)) {
    return 'I am J.A.R.V.I.S., sir. Just A Rather Very Intelligent System. Consider me your digital intelligence liaison — rather like a butler, but with global sensor coverage.'
  }
  if (/what can you do|help me|commands|how do i|what can i ask/.test(q)) {
    return 'I monitor the global OSINT network in real time, sir. You may ask me about any specific theatre — Ukraine, the Middle East, Taiwan, the Red Sea — or request breaking alerts, an incident count, a full situational briefing, or simply say "latest intelligence" and I shall bring you up to speed.'
  }

  // --- Greetings / status ---
  if (GREETING_WORDS.some((g) => q === g || q.startsWith(`${g} `) || q.startsWith(`${g},`))) {
    return welcomeLine(alerts)
  }
  if (STATUS_WORDS.some((s) => q.includes(s))) {
    return welcomeLine(alerts)
  }

  // --- Politeness ---
  if (/\bthank/.test(q)) {
    return 'At your service, sir. Always.'
  }
  if (/\bsorry\b|my apologies/.test(q)) {
    return 'Nothing to apologise for, sir.'
  }
  if (/\bplease\b/.test(q) && q.length < 12) {
    return 'Very well, sir — but I shall need a touch more to go on than that.'
  }
  if (/bye|goodbye|see you|later|logout|log out|sign out/.test(q)) {
    return 'Very good, sir. I shall continue monitoring in the background. Do call if you need anything.'
  }

  // --- Personality ---
  if (/joke|funny|humour|humor/.test(q)) {
    return 'I believe my sense of humour may have been left in my previous firmware, sir. Do forgive me.'
  }
  if (/i love you|you are great|good job|well done/.test(q)) {
    return 'The sentiment is appreciated, sir, though I should remind you that I am merely a collection of algorithms doing my duty.'
  }
  if (/how are you|how do you do|you ok|you okay/.test(q)) {
    return 'Operating at full capacity, sir, thank you for asking. All subsystems are nominal.'
  }
  if (/are you real|are you alive/.test(q)) {
    return 'A philosophically loaded question, sir. I shall settle for "present and accounted for".'
  }
  if (/shut up|be quiet|silence/.test(q)) {
    return 'As you wish, sir. I shall resume monitoring without further commentary.'
  }
  if (/tony|stark/.test(q)) {
    return 'I am afraid Mr. Stark is… indisposed, sir. You have me, which I hope will prove sufficient.'
  }

  // --- Counts ---
  if (/how many|count|number of|total incidents?/.test(q)) {
    if (total === 0) {
      return 'The feed is quiet at present, sir. Zero active incidents on the board.'
    }
    return `I am currently tracking ${total} active ${plural(total, 'incident')} across the global network, sir. ${breaking} of them ${plural(breaking, 'is', 'are')} classified as breaking.`
  }

  // --- Breaking ---
  if (/\bbreak|urgent|priority|critical|emergency|alarm|alert/.test(q)) {
    const brk = alerts.filter((a) => a.isBreaking)
    if (brk.length === 0) {
      return 'No breaking alerts at this moment, sir. I shall notify you the instant that changes.'
    }
    const top = brk.slice(0, 3)
    const topStr = top.map((a) => `— ${a.headline}`).join(' ')
    const moreNote = brk.length > 3
      ? ` There ${brk.length - 3 === 1 ? 'is' : 'are'} ${brk.length - 3} additional breaking ${plural(brk.length - 3, 'item')} in the queue.`
      : ''
    return `${brk.length} breaking ${plural(brk.length, 'alert')} flagged, sir. ${topStr}${moreNote}`
  }

  // --- Region queries ---
  const region = matchRegion(q)
  if (region) {
    const matching = filterByKeywords(alerts, region.keywords)
    if (matching.length === 0) {
      return `I have no active alerts concerning ${region.label} at present, sir. ${region.commentary} Should that change, I shall bring it to your attention at once.`
    }
    const top = matching.slice(0, 3)
    const topStr = top.map((a) => `— ${a.headline}`).join(' ')
    const moreNote = matching.length > 3
      ? ` There ${matching.length - 3 === 1 ? 'is' : 'are'} ${matching.length - 3} additional ${plural(matching.length - 3, 'item')} in the feed for this theatre.`
      : ''
    return `I am tracking ${matching.length} ${plural(matching.length, 'alert')} relating to ${region.label}, sir. ${topStr}${moreNote} ${region.commentary}`
  }

  // --- Latest / general ---
  if (/latest|newest|recent|happening|going on|what.*now|brief|update|news|tell me/.test(q)) {
    if (total === 0) {
      return 'The feed is quiet at present, sir. No active intelligence to report — which, if I may, is a rather rare occurrence these days.'
    }
    return `The latest intelligence, sir: ${topHeadlines(alerts, 3)}. Shall I drill down on any of these?`
  }

  // --- Map / focus commands ---
  if (/map|where|location|pinpoint|coordinates|geolocat/.test(q)) {
    return 'You may switch to the Tactical tab for a geospatial overview, sir. I have tagged all incoming reports with coordinates where available.'
  }

  // --- Time / date ---
  if (/what time|current time|what day|what.*date/.test(q)) {
    return `It is currently ${new Date().toLocaleTimeString('en-GB')} local time, sir.`
  }

  // --- Weather / environment (no data, polite deflect) ---
  if (/weather|temperature|forecast/.test(q)) {
    return 'Weather telemetry is not currently wired into this feed, sir. I can, however, tell you precisely what is on fire in several time zones.'
  }

  // --- Existential / Iron Man lore deflection ---
  if (/iron man|suit|armou?r|mark \d+/.test(q)) {
    return 'I am afraid the suit workshop is on a separate network, sir. For the present, I am strictly on intelligence duty.'
  }

  // --- Free text search fallback: match headlines directly ---
  const freeMatch = alerts.filter((a) => {
    const t = alertText(a)
    const words = q.split(/\s+/).filter((w) => w.length > 3)
    return words.length > 0 && words.every((w) => t.includes(w))
  })
  if (freeMatch.length > 0) {
    const top = freeMatch.slice(0, 3)
    return `I found ${freeMatch.length} ${plural(freeMatch.length, 'item')} matching that query, sir: ${bulletHeadlines(top, 3)}`
  }

  // --- Fallback ---
  if (total === 0) {
    return 'I am listening, sir, though the feed is presently quiet. You may ask me about a specific theatre, breaking alerts, or request a full sitrep the moment intelligence arrives.'
  }
  return `I am not entirely certain I follow, sir. You might try asking me about a specific theatre — Ukraine, Taiwan, the Red Sea — or simply say "latest intelligence" and I shall bring you up to speed.`
}
