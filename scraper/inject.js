#!/usr/bin/env node
/**
 * inject.js
 * Reads jobs.json and injects job cards into spinchirp.html
 *
 * Usage:
 *   node inject.js                          — inject into ../spinchirp.html
 *   node inject.js --input path/to/html     — specify HTML file
 *   node inject.js --max 200                — cap number of injected jobs
 *   node inject.js --preview                — just log what would be injected
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const PREVIEW = args.includes('--preview');
const MAX = (() => {
  const idx = args.indexOf('--max');
  return idx !== -1 ? parseInt(args[idx + 1]) : 500;
})();
const HTML_PATH = (() => {
  const idx = args.indexOf('--input');
  return idx !== -1 ? args[idx + 1] : path.join(__dirname, '../index.html');
})();

const JOBS_PATH = path.join(__dirname, 'jobs.json');

// ── HELPERS ───────────────────────────────────────────────────────────────────

function escape(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// Map sector to data-cat value used by the filter JS
const SECTOR_CAT = {
  'Labels and Publishing': 'labels',
  'Sync and Licensing':    'sync',
  'Live and Touring':      'live',
  'Streaming and Tech':    'streaming',
  'Management':            'management',
  'Marketing and PR':      'marketing',
};

// Map work_type to tag HTML
function workTag(type) {
  const map = {
    remote:  '<div class="tag tag-remote">Remote</div>',
    hybrid:  '<div class="tag tag-hybrid">Hybrid</div>',
    onsite:  '<div class="tag tag-onsite">On-site</div>',
    touring: '<div class="tag tag-onsite">On tour</div>',
  };
  return map[type] || '<div class="tag tag-onsite">On-site</div>';
}

// Company initials for logo placeholder
function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3);
}

// Colour palette cycles through sangria tones
const LOGO_COLOURS = [
  { bg: '#F5E8EC', fg: '#7B2D42' },
  { bg: '#E8F5E9', fg: '#2E7D32' },
  { bg: '#E3F2FD', fg: '#1565C0' },
  { bg: '#FFF3E0', fg: '#BF360C' },
  { bg: '#F3E5F5', fg: '#6A1B9A' },
  { bg: '#E0F2F1', fg: '#00695C' },
];

// Relative time string
function timeAgo(dateStr) {
  if (!dateStr) return 'Recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days/7)}w ago`;
  return `${Math.floor(days/30)}mo ago`;
}

// Expiry date — 30 days from posted_at or from now
function expiryDate(postedAt) {
  const base = postedAt ? new Date(postedAt) : new Date();
  const exp = new Date(base.getTime() + 30 * 86400000);
  return exp.toISOString().split('T')[0];
}

// Build a single job card HTML string
function buildCard(job, index) {
  const colour = LOGO_COLOURS[index % LOGO_COLOURS.length];
  const cat = SECTOR_CAT[job.sector] || 'labels';
  const id = `scraped-${index}`;
  const salaryStr = job.salary ? ` · ${escape(job.salary)}` : '';
  const locationStr = job.location ? ` · ${escape(job.location)}` : '';
  const sourceLabel = escape(job.source || job.company);
  const applyUrl = escape(job.url || '#');
  const deadline = expiryDate(job.posted_at);

  return `
      <div class="job-card" data-id="${id}"
        data-cat="${cat}"
        data-level="mid"
        data-salary="${job.salary_min || 0}"
        data-work="${job.work_type || 'onsite'}"
        data-contract="${job.contract || 'permanent'}"
        data-city="${(job.location || 'worldwide').toLowerCase().replace(/[^a-z ]/g,'').split(',')[0].trim()}"
        data-title="${escape((job.title + ' ' + job.company).toLowerCase())}"
        data-company="${escape(job.company)}"
        data-deadline="${deadline}"
        onclick="openJob('${id}')">
        <div class="job-logo" style="background:${colour.bg};color:${colour.fg};">${initials(job.company)}</div>
        <div>
          <div class="job-title">${escape(job.title)}</div>
          <div class="job-meta">${escape(job.company)}<span class="dot">·</span>${escape(job.location || 'Location TBC')}${salaryStr}</div>
          <div class="job-deadline" id="dl-${id}"></div>
        </div>
        <div class="job-right">
          ${workTag(job.work_type)}
          <div class="job-date">${timeAgo(job.posted_at)}</div>
          <button class="save-btn" onclick="event.stopPropagation();toggleSave('${id}','${escape(job.title)}')" id="save-${id}" title="Save job">Save</button>
        </div>
      </div>`;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

function run() {
  if (!fs.existsSync(JOBS_PATH)) {
    console.error('jobs.json not found. Run node scrape.js first.');
    process.exit(1);
  }
  if (!fs.existsSync(HTML_PATH)) {
    console.error(`HTML file not found: ${HTML_PATH}`);
    process.exit(1);
  }

  const { meta, jobs } = JSON.parse(fs.readFileSync(JOBS_PATH, 'utf8'));
  const toInject = jobs.slice(0, MAX);

  console.log(`\n  SpinChirp Injector`);
  console.log(`  Jobs available: ${jobs.length}`);
  console.log(`  Jobs to inject: ${toInject.length} (max: ${MAX})`);
  console.log(`  Scraped at:     ${meta.scraped_at}\n`);

  if (PREVIEW) {
    console.log('  Preview mode — first 5 jobs:');
    toInject.slice(0, 5).forEach((j, i) => console.log(`    ${i+1}. ${j.company} — ${j.title} (${j.location || 'no location'})`));
    return;
  }

  let html = fs.readFileSync(HTML_PATH, 'utf8');

  // Build all cards
  const cards = toInject.map((job, i) => buildCard(job, i)).join('\n');

  // Also register jobs in the JOBS object for the detail page
  // We inject a script tag that merges scraped jobs into the JOBS object
  const jobsScript = `
  // Scraped jobs injected by inject.js at ${new Date().toISOString()}
  (function() {
    const scrapedJobs = ${JSON.stringify(
      toInject.map((j, i) => ({
        id: `scraped-${i}`,
        title: j.title,
        company: j.company,
        meta: `${j.company} · ${j.location || 'Location TBC'}${j.salary ? ' · '+j.salary : ''}`,
        logo: `<div class="job-logo" style="background:${LOGO_COLOURS[i % LOGO_COLOURS.length].bg};color:${LOGO_COLOURS[i % LOGO_COLOURS.length].fg};">${initials(j.company)}</div>`,
        deadline: expiryDate(j.posted_at),
        cat: SECTOR_CAT[j.sector] || 'labels',
        work: j.work_type || 'onsite',
        applyUrl: j.url || '#',
        sourced: true,
        source: j.source || j.company,
        source_url: j.source_url || '',
      }))
    , null, 0)};
    scrapedJobs.forEach(j => { JOBS[j.id] = j; });
    console.log('SpinChirp: loaded ' + scrapedJobs.length + ' scraped jobs');
  })();`;

  // Insert cards after the last hardcoded job card, before no-results div
  const insertMarker = '<div class="no-results" id="no-results">';
  if (!html.includes(insertMarker)) {
    console.error('Could not find insertion point in HTML. Has the file structure changed?');
    process.exit(1);
  }

  // Remove any previously injected scraped jobs
  html = html.replace(/<!-- SCRAPED JOBS START -->[\s\S]*?<!-- SCRAPED JOBS END -->\n?/g, '');

  // Insert new scraped jobs
  html = html.replace(
    insertMarker,
    `<!-- SCRAPED JOBS START -->\n${cards}\n      <!-- SCRAPED JOBS END -->\n      ${insertMarker}`
  );

  // Remove any previously injected scraped jobs script
  html = html.replace(/\/\/ Scraped jobs injected by inject\.js[\s\S]*?}\)\(\);/g, '');

  // Insert the jobs registration script just before </script> of main script block
  html = html.replace(
    /(\s*\/\/ Init\s*\nminSalaryVal)/,
    `\n${jobsScript}\n$1`
  );

  // Write output
  fs.writeFileSync(HTML_PATH, html);
  console.log(`  Injected ${toInject.length} job cards into ${HTML_PATH}`);
  console.log(`  Done.\n`);
}

run();
