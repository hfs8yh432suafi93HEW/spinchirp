/**
 * filter.js
 * Keeps only music-relevant jobs from companies that also hire outside music
 * (Spotify, Apple, Amazon, Live Nation etc all hire engineers, lawyers, etc)
 */

// Job titles that are clearly music/entertainment industry roles
const MUSIC_TITLE_KEYWORDS = [
  // A&R
  'a&r', 'artist', 'repertoire', 'scouting',
  // Publishing / licensing / sync
  'sync', 'licensing', 'licens', 'publishing', 'rights', 'royalt', 'copyright', 'clearance', 'copyright',
  // Label / release
  'label', 'release', 'catalogue', 'catalog', 'roster', 'signing', 'a&r',
  // Marketing
  'music marketing', 'label marketing', 'artist marketing', 'campaign', 'dsps', 'streaming',
  'playlist', 'editorial', 'music editorial', 'radio', 'promotions',
  // Live / events
  'tour', 'touring', 'live music', 'events', 'venue', 'booker', 'booking', 'promoter', 'festival',
  'production manager', 'stage manager', 'stage',
  // Management
  'artist manager', 'talent manager', 'music manager', 'band manager',
  // PR / comms
  'music pr', 'music publicist', 'music communications',
  // Legal
  'music lawyer', 'entertainment lawyer', 'music counsel', 'music legal',
  // Data / analytics (music-specific)
  'music analyst', 'streaming analyst', 'royalties analyst', 'music data', 'chart',
  // Distribution
  'distribution', 'digital distribution', 'music distribution',
  // Content / editorial
  'music content', 'music editor', 'music journalist', 'music writer',
  // General music roles
  'music industry', 'music business', 'record label',
];

// Departments that indicate music roles at tech/multi-sector companies
const MUSIC_DEPARTMENTS = [
  'music', 'entertainment', 'content', 'editorial', 'artist', 'label',
  'publishing', 'licensing', 'live', 'touring', 'events',
];

// Job titles to always EXCLUDE even if they match music keywords
// (These are support roles that aren't music-industry-specific)
const EXCLUDE_TITLES = [
  'software engineer', 'frontend engineer', 'backend engineer', 'fullstack',
  'devops', 'data engineer', 'machine learning', 'security engineer',
  'finance manager', 'accountant', 'payroll', 'facilities',
  'office manager', 'executive assistant', 'receptionist',
  'customer support', 'customer service', 'it support', 'help desk',
  'supply chain', 'logistics coordinator',
];

function isMusicJob(job) {
  const title = (job.title || '').toLowerCase();
  const dept = (job.sector || '').toLowerCase();
  const company = (job.company || '').toLowerCase();

  // Explicitly exclude generic support roles
  if (EXCLUDE_TITLES.some(e => title.includes(e))) return false;

  // Pure music companies — keep everything
  const pureMusicCompanies = [
    'prs', 'ppl', 'mcps', 'kobalt', 'bmg', 'rough trade', 'beggars',
    'domino', 'secretly', '4ad', 'concord', 'reservoir', 'hipgnosis',
    'wixen', 'sesac', 'ascap', 'sentric', 'audio network',
    'sco talent', 'primary talent', 'atc management', 'paradigm',
    'sjm', 'kilimanjaro', 'broadwick', 'dice', 'festival republic',
    'nme', 'mixmag', 'dj mag', 'music week',
  ];
  if (pureMusicCompanies.some(c => company.includes(c))) return true;

  // For large multi-sector companies, require a music keyword in title or dept
  if (MUSIC_TITLE_KEYWORDS.some(k => title.includes(k))) return true;
  if (MUSIC_DEPARTMENTS.some(k => dept.includes(k))) return true;

  return false;
}

function filterJobs(jobs) {
  return jobs.filter(isMusicJob);
}

module.exports = { filterJobs, isMusicJob };
