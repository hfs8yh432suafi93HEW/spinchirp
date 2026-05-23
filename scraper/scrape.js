#!/usr/bin/env node
/**
 * SpinChirp Scraper — main orchestrator
 *
 * Usage:
 *   node scrape.js               — scrape all targets, write jobs.json
 *   node scrape.js --dry-run     — scrape but don't write, just log counts
 *   node scrape.js --target Spotify  — scrape one company only
 *   node scrape.js --html-only   — only scrape HTML targets (no ATS APIs)
 *
 * Output: jobs.json — array of normalised job objects
 */

const fs = require('fs');
const path = require('path');
const pLimit = require('p-limit');

const { scrapeGreenhouse, scrapeWorkable, scrapeLever, scrapeTeamtailor, scrapeAshby, scrapeHTML } = require('./scrapers/ats');
const targets = require('./targets');
const { filterJobs } = require('./filter');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const HTML_ONLY = args.includes('--html-only');
const TARGET_FILTER = (() => {
  const idx = args.indexOf('--target');
  return idx !== -1 ? args[idx + 1]?.toLowerCase() : null;
})();

// Max concurrent requests — be polite
const limit = pLimit(4);

const DISPATCH = {
  greenhouse: (t) => scrapeGreenhouse(t.company, t.slug),
  workable:   (t) => scrapeWorkable(t.company, t.slug),
  lever:      (t) => scrapeLever(t.company, t.slug),
  teamtailor: (t) => scrapeTeamtailor(t.company, t.slug),
  ashby:      (t) => scrapeAshby(t.company, t.slug),
  html:       (t) => scrapeHTML(t.company, t.slug),
};

function deduplicate(jobs) {
  const seen = new Set();
  return jobs.filter(j => {
    // Dedupe by URL first, then by id
    const key = j.url || j.id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function classifySector(job) {
  // If the target already has a sector, keep it
  if (job.sector && job.sector.length > 3) return job;
  const title = (job.title || '').toLowerCase();
  if (/sync|licens|publishing|rights|royalt|copyright/.test(title)) return { ...job, sector: 'Sync and Licensing' };
  if (/tour|live|event|venue|festival|stage|promoter|booker/.test(title)) return { ...job, sector: 'Live and Touring' };
  if (/stream|platform|tech|product|data|engineer|developer/.test(title)) return { ...job, sector: 'Streaming and Tech' };
  if (/manag|agent|talent|booking/.test(title)) return { ...job, sector: 'Management' };
  if (/market|pr|publicist|campaign|promo|radio|editorial|playlist/.test(title)) return { ...job, sector: 'Marketing and PR' };
  if (/a&r|artist|label|roster|signing|catalogue/.test(title)) return { ...job, sector: 'Labels and Publishing' };
  return job;
}

async function run() {
  console.log('\n🎵  SpinChirp Scraper starting...\n');

  let activeTargets = targets;

  if (HTML_ONLY) {
    activeTargets = activeTargets.filter(t => t.platform === 'html');
    console.log(`  Mode: HTML only (${activeTargets.length} targets)\n`);
  }

  if (TARGET_FILTER) {
    activeTargets = activeTargets.filter(t => t.company.toLowerCase().includes(TARGET_FILTER));
    console.log(`  Mode: Single target — "${TARGET_FILTER}" (${activeTargets.length} match)\n`);
  }

  const results = { success: [], failed: [] };

  const tasks = activeTargets.map(target =>
    limit(async () => {
      const fn = DISPATCH[target.platform];
      if (!fn) {
        console.warn(`  SKIP  ${target.company} — unknown platform: ${target.platform}`);
        return;
      }
      try {
        const jobs = await fn(target);
        // Attach sector from target if not already set
        const withSector = jobs.map(j => classifySector({ ...j, sector: j.sector || target.sector }));
        results.success.push(...withSector);
        console.log(`  OK    ${target.company.padEnd(35)} ${jobs.length} jobs`);
      } catch (err) {
        results.failed.push({ company: target.company, error: err.message });
        console.warn(`  FAIL  ${target.company.padEnd(35)} ${err.message.slice(0, 60)}`);
      }
    })
  );

  await Promise.all(tasks);

  // Filter, deduplicate, sort
  const filtered = filterJobs(results.success);
  const deduped = deduplicate(filtered);
  const sorted = deduped.sort((a, b) => {
    // Sort by posted_at descending, nulls last
    if (!a.posted_at && !b.posted_at) return 0;
    if (!a.posted_at) return 1;
    if (!b.posted_at) return -1;
    return new Date(b.posted_at) - new Date(a.posted_at);
  });

  console.log(`\n  ─────────────────────────────────────────`);
  console.log(`  Raw scraped:    ${results.success.length}`);
  console.log(`  After filter:   ${filtered.length}`);
  console.log(`  After dedup:    ${sorted.length}`);
  console.log(`  Failed targets: ${results.failed.length}`);
  console.log(`  ─────────────────────────────────────────\n`);

  if (results.failed.length > 0) {
    console.log('  Failed:');
    results.failed.forEach(f => console.log(`    - ${f.company}: ${f.error}`));
    console.log('');
  }

  if (DRY_RUN) {
    console.log('  Dry run — not writing jobs.json\n');
    return;
  }

  const outPath = path.join(__dirname, 'jobs.json');
  const meta = {
    scraped_at: new Date().toISOString(),
    total: sorted.length,
    failed: results.failed.length,
    sources: [...new Set(sorted.map(j => j.company))].length,
  };

  fs.writeFileSync(outPath, JSON.stringify({ meta, jobs: sorted }, null, 2));
  console.log(`  Written to jobs.json — ${sorted.length} jobs from ${meta.sources} companies\n`);

  // Also write a summary of sectors
  const bySector = {};
  sorted.forEach(j => {
    const s = j.sector || 'Other';
    bySector[s] = (bySector[s] || 0) + 1;
  });
  console.log('  By sector:');
  Object.entries(bySector).sort((a,b) => b[1]-a[1]).forEach(([s,n]) => {
    console.log(`    ${s.padEnd(30)} ${n}`);
  });
  console.log('');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
