/**
 * spinchirp-scraper/targets.js
 *
 * Master list of music industry companies and their ATS details.
 * Add new companies here — the scraper picks them up automatically.
 *
 * Format:
 * { company, platform, slug, sector, notes? }
 *
 * Platforms: 'greenhouse' | 'workable' | 'lever' | 'teamtailor' | 'ashby' | 'html'
 * For 'html': slug is the full careers page URL
 */

const targets = [

  // ── MAJOR LABELS ──────────────────────────────────────────────────────────
  { company: 'Universal Music Group',    platform: 'greenhouse',  slug: 'universalmusicgroup',  sector: 'Labels and Publishing' },
  { company: 'Sony Music Entertainment', platform: 'greenhouse',  slug: 'sonymusic',            sector: 'Labels and Publishing' },
  { company: 'Warner Music Group',       platform: 'greenhouse',  slug: 'warnermusicgroup',     sector: 'Labels and Publishing' },
  { company: 'BMG',                      platform: 'greenhouse',  slug: 'bmg',                  sector: 'Labels and Publishing' },
  { company: 'Beggars Group',            platform: 'workable',    slug: 'beggars',              sector: 'Labels and Publishing' },
  { company: 'Domino Recording Co',      platform: 'workable',    slug: 'dominorecordingco',    sector: 'Labels and Publishing' },
  { company: 'Secretly Group',           platform: 'lever',       slug: 'secretlygroup',        sector: 'Labels and Publishing' },
  { company: 'Rough Trade',              platform: 'workable',    slug: 'roughtrade',           sector: 'Labels and Publishing' },
  { company: '4AD',                      platform: 'greenhouse',  slug: 'universalmusicgroup',  sector: 'Labels and Publishing', notes: 'Part of UMG' },

  // ── PUBLISHING ────────────────────────────────────────────────────────────
  { company: 'Kobalt Music',             platform: 'greenhouse',  slug: 'kobalt',               sector: 'Sync and Licensing' },
  { company: 'UMPG',                     platform: 'greenhouse',  slug: 'universalmusicgroup',  sector: 'Sync and Licensing' },
  { company: 'Sony Music Publishing',    platform: 'greenhouse',  slug: 'sonymusic',            sector: 'Sync and Licensing' },
  { company: 'Warner Chappell Music',    platform: 'greenhouse',  slug: 'warnermusicgroup',     sector: 'Sync and Licensing' },
  { company: 'Concord Music',            platform: 'greenhouse',  slug: 'concordmusic',         sector: 'Sync and Licensing' },
  { company: 'Reservoir Media',          platform: 'greenhouse',  slug: 'reservoirmedia',       sector: 'Sync and Licensing' },
  { company: 'Hipgnosis Songs',          platform: 'workable',    slug: 'hipgnosis',            sector: 'Sync and Licensing' },
  { company: 'Wixen Music Publishing',   platform: 'html',        slug: 'https://www.wixenmusic.com/careers', sector: 'Sync and Licensing' },

  // ── RIGHTS / ROYALTIES ────────────────────────────────────────────────────
  { company: 'PRS for Music',            platform: 'workable',    slug: 'prsformusic',          sector: 'Sync and Licensing' },
  { company: 'PPL',                      platform: 'workable',    slug: 'ppluk',                sector: 'Sync and Licensing' },
  { company: 'MCPS',                     platform: 'workable',    slug: 'prsformusic',          sector: 'Sync and Licensing', notes: 'MCPS is part of PRS' },
  { company: 'SESAC',                    platform: 'greenhouse',  slug: 'sesac',                sector: 'Sync and Licensing' },
  { company: 'ASCAP',                    platform: 'html',        slug: 'https://www.ascap.com/about-us/careers', sector: 'Sync and Licensing' },

  // ── STREAMING ─────────────────────────────────────────────────────────────
  { company: 'Spotify',                  platform: 'greenhouse',  slug: 'spotify',              sector: 'Streaming and Tech' },
  { company: 'Apple Music / Apple',      platform: 'html',        slug: 'https://jobs.apple.com/en-gb/search?search=music', sector: 'Streaming and Tech' },
  { company: 'Amazon Music',             platform: 'html',        slug: 'https://www.amazon.jobs/en/search?base_query=music', sector: 'Streaming and Tech' },
  { company: 'Tidal',                    platform: 'lever',       slug: 'tidal',                sector: 'Streaming and Tech' },
  { company: 'Deezer',                   platform: 'workable',    slug: 'deezer',               sector: 'Streaming and Tech' },
  { company: 'SoundCloud',               platform: 'greenhouse',  slug: 'soundcloud',           sector: 'Streaming and Tech' },
  { company: 'Bandcamp',                 platform: 'greenhouse',  slug: 'bandcamp',             sector: 'Streaming and Tech' },
  { company: 'Beatport',                 platform: 'greenhouse',  slug: 'beatport',             sector: 'Streaming and Tech' },

  // ── MUSIC TECH ────────────────────────────────────────────────────────────
  { company: 'Splice',                   platform: 'greenhouse',  slug: 'splice',               sector: 'Streaming and Tech' },
  { company: 'Native Instruments',       platform: 'teamtailor',  slug: 'native-instruments',   sector: 'Streaming and Tech' },
  { company: 'Ableton',                  platform: 'teamtailor',  slug: 'ableton',              sector: 'Streaming and Tech' },
  { company: 'Sonos',                    platform: 'greenhouse',  slug: 'sonos',                sector: 'Streaming and Tech' },
  { company: 'Shazam / Apple',           platform: 'html',        slug: 'https://jobs.apple.com/en-gb/search?search=shazam', sector: 'Streaming and Tech' },
  { company: 'Boomplay',                 platform: 'workable',    slug: 'boomplay',             sector: 'Streaming and Tech' },
  { company: 'Distrokid',               platform: 'greenhouse',  slug: 'distrokid',            sector: 'Streaming and Tech' },
  { company: 'TuneCore',                 platform: 'greenhouse',  slug: 'tunecore',             sector: 'Streaming and Tech' },
  { company: 'AWAL',                     platform: 'greenhouse',  slug: 'awal',                 sector: 'Streaming and Tech' },
  { company: 'Believe',                  platform: 'teamtailor',  slug: 'believe',              sector: 'Streaming and Tech' },
  { company: 'Amuse',                    platform: 'ashby',       slug: 'amuse',                sector: 'Streaming and Tech' },

  // ── LIVE AND TOURING ──────────────────────────────────────────────────────
  { company: 'Live Nation',              platform: 'greenhouse',  slug: 'livenation',           sector: 'Live and Touring' },
  { company: 'AEG Presents',             platform: 'greenhouse',  slug: 'aegpresents',          sector: 'Live and Touring' },
  { company: 'SJM Concerts',             platform: 'html',        slug: 'https://www.sjmconcerts.com/jobs', sector: 'Live and Touring' },
  { company: 'Kilimanjaro Live',         platform: 'html',        slug: 'https://www.kilimanjaro.co.uk/about/jobs', sector: 'Live and Touring' },
  { company: 'Ticketmaster',             platform: 'greenhouse',  slug: 'ticketmaster',         sector: 'Live and Touring' },
  { company: 'See Tickets',              platform: 'workable',    slug: 'seetickets',           sector: 'Live and Touring' },
  { company: 'Dice',                     platform: 'greenhouse',  slug: 'dice',                 sector: 'Live and Touring' },
  { company: 'Eventbrite',               platform: 'greenhouse',  slug: 'eventbrite',           sector: 'Live and Touring' },
  { company: 'NEC Group',                platform: 'teamtailor',  slug: 'nec-group',            sector: 'Live and Touring' },
  { company: 'Broadwick Live',           platform: 'workable',    slug: 'broadwicklive',        sector: 'Live and Touring' },
  { company: 'Festival Republic',        platform: 'greenhouse',  slug: 'livenation',           sector: 'Live and Touring', notes: 'Part of Live Nation' },

  // ── BOOKING AGENCIES ─────────────────────────────────────────────────────
  { company: 'CAA',                      platform: 'greenhouse',  slug: 'caa',                  sector: 'Management' },
  { company: 'WME',                      platform: 'greenhouse',  slug: 'wme',                  sector: 'Management' },
  { company: 'UTA',                      platform: 'greenhouse',  slug: 'unitedtalentagency',   sector: 'Management' },
  { company: 'Primary Talent',           platform: 'html',        slug: 'https://www.primarytalent.com/about/careers', sector: 'Management' },
  { company: 'Paradigm Talent Agency',   platform: 'greenhouse',  slug: 'paradigmtalent',       sector: 'Management' },
  { company: 'ATC Management',           platform: 'html',        slug: 'https://atcmanagement.com/careers', sector: 'Management' },

  // ── MANAGEMENT ────────────────────────────────────────────────────────────
  { company: 'Maverick Management',      platform: 'html',        slug: 'https://maverickmanagement.com/careers', sector: 'Management' },
  { company: 'Sco Talent',              platform: 'html',        slug: 'https://scotalent.com/jobs', sector: 'Management' },

  // ── MEDIA AND PR ─────────────────────────────────────────────────────────
  { company: 'NME Networks',             platform: 'workable',    slug: 'nmenetworks',          sector: 'Marketing and PR' },
  { company: 'Mixmag',                   platform: 'workable',    slug: 'mixmag',               sector: 'Marketing and PR' },
  { company: 'DJ Mag',                   platform: 'html',        slug: 'https://djmag.com/jobs', sector: 'Marketing and PR' },
  { company: 'Music Week',               platform: 'workable',    slug: 'musicweek',            sector: 'Marketing and PR' },
  { company: 'Secretly Group',           platform: 'lever',       slug: 'secretlygroup',        sector: 'Marketing and PR' },
  { company: 'The Orchard',              platform: 'greenhouse',  slug: 'theorchard',           sector: 'Marketing and PR' },

  // ── SYNC AGENCIES ─────────────────────────────────────────────────────────
  { company: 'Music床 (Music Bed)',       platform: 'greenhouse',  slug: 'musicbed',             sector: 'Sync and Licensing' },
  { company: 'Musicalize',               platform: 'html',        slug: 'https://www.musicalize.co.uk/careers', sector: 'Sync and Licensing' },
  { company: 'Sentric Music',            platform: 'workable',    slug: 'sentricmusic',         sector: 'Sync and Licensing' },
  { company: 'Audio Network',            platform: 'workable',    slug: 'audionetwork',         sector: 'Sync and Licensing' },
  { company: 'Musichouse',               platform: 'html',        slug: 'https://www.musichouse.co.uk/jobs', sector: 'Sync and Licensing' },
  { company: 'Extreme Music',            platform: 'greenhouse',  slug: 'sonymusic',            sector: 'Sync and Licensing', notes: 'Sony subsidiary' },

];

module.exports = targets;
