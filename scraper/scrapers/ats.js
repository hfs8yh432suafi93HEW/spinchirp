/**
 * ATS platform scrapers
 * One function per platform — each returns an array of normalised job objects
 */

const axios = require('axios');
const cheerio = require('cheerio');

// ─── NORMALISED JOB SHAPE ────────────────────────────────────────────────────
// {
//   id:          string   — unique per source, e.g. "greenhouse-warner-12345"
//   title:       string
//   company:     string
//   location:    string
//   url:         string   — direct link to apply
//   salary:      string|null
//   work_type:   'remote'|'hybrid'|'onsite'|'touring'|null
//   contract:    'permanent'|'freelance'|'parttime'|null
//   sector:      string|null
//   posted_at:   string   — ISO date string or null
//   source:      string   — "sourced" label shown on the card
//   source_url:  string   — company careers page URL
// }

function normalise(partial) {
  return {
    id: partial.id || null,
    title: partial.title || 'Untitled',
    company: partial.company || 'Unknown',
    location: partial.location || null,
    url: partial.url || null,
    salary: partial.salary || null,
    work_type: partial.work_type || null,
    contract: partial.contract || null,
    sector: partial.sector || null,
    posted_at: partial.posted_at || null,
    source: partial.source || partial.company,
    source_url: partial.source_url || null,
  };
}

// Guess work type from location string
function guessWorkType(location = '') {
  const l = location.toLowerCase();
  if (l.includes('remote')) return 'remote';
  if (l.includes('hybrid')) return 'hybrid';
  if (l.includes('tour')) return 'touring';
  return 'onsite';
}

// Guess contract type from title/department
function guessContract(text = '') {
  const t = text.toLowerCase();
  if (t.includes('freelance') || t.includes('contract') || t.includes('temp')) return 'freelance';
  if (t.includes('part-time') || t.includes('part time')) return 'parttime';
  return 'permanent';
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; SpinChirpBot/1.0; +https://spinchirp.com/bot)',
  'Accept': 'application/json, text/html',
};

const get = (url, params = {}) =>
  axios.get(url, { headers: HEADERS, params, timeout: 15000 });

// ─── GREENHOUSE ───────────────────────────────────────────────────────────────
// API: https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true
async function scrapeGreenhouse(company, boardToken) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs`;
  const { data } = await get(url, { content: true });
  return (data.jobs || []).map(j => normalise({
    id: `greenhouse-${boardToken}-${j.id}`,
    title: j.title,
    company,
    location: j.location?.name || null,
    url: j.absolute_url,
    work_type: guessWorkType(j.location?.name || ''),
    contract: guessContract(j.title + ' ' + (j.departments?.[0]?.name || '')),
    sector: j.departments?.[0]?.name || null,
    posted_at: j.updated_at || null,
    source: company,
    source_url: `https://boards.greenhouse.io/${boardToken}`,
  }));
}

// ─── WORKABLE ─────────────────────────────────────────────────────────────────
// API: https://{subdomain}.workable.com/api/v3/jobs
async function scrapeWorkable(company, subdomain) {
  const url = `https://apply.workable.com/api/v3/accounts/${subdomain}/jobs`;
  const { data } = await get(url);
  const jobs = data.results || [];
  return jobs.map(j => normalise({
    id: `workable-${subdomain}-${j.shortcode}`,
    title: j.title,
    company,
    location: j.location || null,
    url: `https://apply.workable.com/${subdomain}/j/${j.shortcode}`,
    work_type: j.remote ? 'remote' : guessWorkType(j.location || ''),
    contract: guessContract(j.title + ' ' + (j.employment_type || '')),
    sector: j.department || null,
    posted_at: j.published_on || null,
    source: company,
    source_url: `https://apply.workable.com/${subdomain}`,
  }));
}

// ─── LEVER ────────────────────────────────────────────────────────────────────
// API: https://api.lever.co/v0/postings/{company}?mode=json
async function scrapeLever(company, leverSlug) {
  const url = `https://api.lever.co/v0/postings/${leverSlug}?mode=json`;
  const { data } = await get(url);
  return (Array.isArray(data) ? data : []).map(j => normalise({
    id: `lever-${leverSlug}-${j.id}`,
    title: j.text,
    company,
    location: j.categories?.location || j.workplaceType || null,
    url: j.hostedUrl,
    work_type: j.workplaceType === 'remote' ? 'remote' : guessWorkType(j.categories?.location || ''),
    contract: guessContract(j.text + ' ' + (j.categories?.commitment || '')),
    sector: j.categories?.team || j.categories?.department || null,
    posted_at: j.createdAt ? new Date(j.createdAt).toISOString() : null,
    source: company,
    source_url: `https://jobs.lever.co/${leverSlug}`,
  }));
}

// ─── TEAMTAILOR ───────────────────────────────────────────────────────────────
// Public XML feed: https://{company}.teamtailor.com/feed.xml
async function scrapeTeamtailor(company, subdomain) {
  const url = `https://${subdomain}.teamtailor.com/feed.xml`;
  const { data } = await get(url);
  const $ = cheerio.load(data, { xmlMode: true });
  const jobs = [];
  $('job').each((_, el) => {
    const $el = $(el);
    jobs.push(normalise({
      id: `teamtailor-${subdomain}-${$el.find('id').text()}`,
      title: $el.find('title').text(),
      company,
      location: $el.find('locations > location > city').first().text() || null,
      url: $el.find('url').text(),
      work_type: guessWorkType($el.find('remote').text() === 'true' ? 'remote' : $el.find('locations > location > city').first().text()),
      contract: guessContract($el.find('title').text() + ' ' + $el.find('employment-type').text()),
      sector: $el.find('department').text() || null,
      posted_at: $el.find('created-at').text() || null,
      source: company,
      source_url: `https://${subdomain}.teamtailor.com/jobs`,
    }));
  });
  return jobs;
}

// ─── ASHBY ────────────────────────────────────────────────────────────────────
// API: https://jobs.ashbyhq.com/api/non-user-graphql (POST)
async function scrapeAshby(company, orgSlug) {
  const url = 'https://jobs.ashbyhq.com/api/non-user-graphql';
  const query = `{ jobBoard(organizationHostedJobsPageName: "${orgSlug}") { jobPostings { id title locationName isRemote employmentType department { name } publishedDate externalLink } } }`;
  const { data } = await axios.post(url, { query }, { headers: HEADERS, timeout: 15000 });
  const postings = data?.data?.jobBoard?.jobPostings || [];
  return postings.map(j => normalise({
    id: `ashby-${orgSlug}-${j.id}`,
    title: j.title,
    company,
    location: j.locationName || null,
    url: j.externalLink || `https://jobs.ashbyhq.com/${orgSlug}/${j.id}`,
    work_type: j.isRemote ? 'remote' : guessWorkType(j.locationName || ''),
    contract: guessContract(j.title + ' ' + (j.employmentType || '')),
    sector: j.department?.name || null,
    posted_at: j.publishedDate || null,
    source: company,
    source_url: `https://jobs.ashbyhq.com/${orgSlug}`,
  }));
}

// ─── GENERIC HTML SCRAPER (fallback for custom career pages) ─────────────────
// Tries common patterns: JSON-LD, schema.org JobPosting, and heuristic selectors
async function scrapeHTML(company, url) {
  const { data } = await get(url);
  const $ = cheerio.load(data);
  const jobs = [];

  // Try JSON-LD first
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).html());
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      arr.forEach(item => {
        if (item['@type'] === 'JobPosting') {
          jobs.push(normalise({
            id: `html-${company.replace(/\s+/g, '-').toLowerCase()}-${Buffer.from(item.title || '').toString('base64').slice(0,8)}`,
            title: item.title,
            company,
            location: item.jobLocation?.address?.addressLocality || item.jobLocation?.address?.addressCountry || null,
            url: item.url || url,
            salary: item.baseSalary?.value?.value ? `${item.baseSalary.currency} ${item.baseSalary.value.value}` : null,
            work_type: item.jobLocationType === 'TELECOMMUTE' ? 'remote' : guessWorkType(item.jobLocation?.address?.addressLocality || ''),
            contract: guessContract(item.title + ' ' + (item.employmentType || '')),
            posted_at: item.datePosted || null,
            source: company,
            source_url: url,
          }));
        }
      });
    } catch (_) {}
  });

  return jobs;
}

module.exports = { scrapeGreenhouse, scrapeWorkable, scrapeLever, scrapeTeamtailor, scrapeAshby, scrapeHTML, normalise, guessWorkType, guessContract };
