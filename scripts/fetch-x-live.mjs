import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src', 'data');
const cachePath = path.join(dataDir, 'x-live.cache.json');
const generatedPath = path.join(dataDir, 'x-live.generated.ts');

function loadEnvFile(text) {
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]]) continue;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

for (const name of ['.env.local', '.env.production', '.env']) {
  try { loadEnvFile(await readFile(path.join(root, name), 'utf8')); } catch { /* optional env file */ }
}

async function readJson(file, fallback = {}) {
  try { return JSON.parse(await readFile(file, 'utf8')); } catch { return fallback; }
}

function finiteMetric(value, previous) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : (typeof previous === 'number' && Number.isFinite(previous) ? previous : null);
}

function formatDuration(seconds) {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) return '';
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function pickMp4(video) {
  if (!video || typeof video !== 'object') return '';
  const formats = Array.isArray(video.formats) ? video.formats : [];
  const mp4 = formats.filter(item => item && typeof item.url === 'string' &&
    (String(item.container || '').toLowerCase() === 'mp4' || item.url.toLowerCase().includes('.mp4')));
  const lowerBandwidth = mp4.filter(item => !Number(item.width) || Number(item.width) <= 960);
  const candidates = lowerBandwidth.length ? lowerBandwidth : mp4;
  candidates.sort((a, b) => {
    const aBitrate = Number.isFinite(Number(a.bitrate)) ? Number(a.bitrate) : Number.MAX_SAFE_INTEGER;
    const bBitrate = Number.isFinite(Number(b.bitrate)) ? Number(b.bitrate) : Number.MAX_SAFE_INTEGER;
    return aBitrate - bBitrate;
  });
  if (candidates[0]?.url) return candidates[0].url;
  if (typeof video.url === 'string' && video.url.toLowerCase().includes('.mp4')) return video.url;
  if (typeof video.transcode_url === 'string' && video.transcode_url.toLowerCase().includes('.mp4')) return video.transcode_url;
  return '';
}

async function supabaseGet(base, key, resource) {
  const response = await fetch(`${base}/rest/v1/${resource}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error(`Supabase ${resource} returned HTTP ${response.status}`);
  return response.json();
}

async function fetchPublicPostSnapshot(project, url, previous) {
  const id = /\/status\/(\d+)/.exec(url || '')?.[1];
  if (!id) {
    console.log(`[X DATA SKIP] ${project.id}: URL is not a public X status link.`);
    return previous[project.id] || null;
  }

  try {
    const response = await fetch(`https://api.fxtwitter.com/i/status/${id}`, {
      headers: { 'User-Agent': 'DRIPXELPortfolio/2.0', Accept: 'application/json' },
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error(`FxTwitter returned HTTP ${response.status}`);
    const payload = await response.json();
    const tweet = payload?.tweet || payload?.status;
    if (!tweet || tweet.type === 'tombstone') throw new Error('Post data unavailable');

    const media = tweet.media && typeof tweet.media === 'object' ? tweet.media : {};
    const videos = Array.isArray(media.videos) ? media.videos : [];
    const allMedia = Array.isArray(media.all) ? media.all : [];
    const video = videos[0] || allMedia.find(item => item?.type === 'video' || item?.type === 'gif') || null;
    const photos = Array.isArray(media.photos) ? media.photos : [];
    const previewVideo = pickMp4(video);

    const result = {
      views: finiteMetric(tweet.views, previous[project.id]?.views),
      likes: finiteMetric(tweet.likes, previous[project.id]?.likes),
      comments: finiteMetric(tweet.replies, previous[project.id]?.comments),
      reposts: finiteMetric(tweet.reposts, previous[project.id]?.reposts),
      bookmarks: finiteMetric(tweet.bookmarks, previous[project.id]?.bookmarks),
      thumbnail: video?.thumbnail_url || photos[0]?.url || previous[project.id]?.thumbnail || '',
      previewVideo: previewVideo || previous[project.id]?.previewVideo || '',
      videoUrl: previewVideo || previous[project.id]?.videoUrl || previous[project.id]?.previewVideo || '',
      duration: formatDuration(video?.duration) || previous[project.id]?.duration || '',
      fetchedAt: new Date().toISOString(),
      source: 'FxTwitter public post snapshot (unofficial)'
    };

    const hasUsefulData = Object.values(result).some(value =>
      typeof value === 'number' || (typeof value === 'string' && value.length > 0));
    if (!hasUsefulData) throw new Error('No public metrics or media were returned');

    console.log(`[X DATA] ${project.id}: views=${result.views ?? 'n/a'}, likes=${result.likes ?? 'n/a'}, replies=${result.comments ?? 'n/a'}, video=${result.previewVideo ? 'yes' : 'no'}`);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (previous[project.id]) {
      console.log(`[X DATA CACHE] ${project.id}: keeping last successful snapshot (${message})`);
      return previous[project.id];
    }
    console.log(`[X DATA SKIP] ${project.id}: ${message}`);
    return null;
  }
}

const previous = await readJson(cachePath, {});
const next = { ...previous };
const supabaseUrl = (process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.log('[X DATA] Supabase public build variables are unavailable; keeping the last saved metrics snapshot.');
} else {
  try {
    const [contentRows, projects] = await Promise.all([
      supabaseGet(supabaseUrl, supabaseKey, 'site_content?select=value&key=eq.homepage'),
      supabaseGet(supabaseUrl, supabaseKey, 'projects?select=id,title,published,sort_order&published=eq.true&order=sort_order.asc')
    ]);
    const content = contentRows?.[0]?.value || {};
    const links = content.projectXLinks && typeof content.projectXLinks === 'object' ? content.projectXLinks : {};
    const linkedProjects = (Array.isArray(projects) ? projects : []).filter(project =>
      typeof project.id === 'string' && typeof links[project.id] === 'string' && links[project.id].trim());

    if (!linkedProjects.length) {
      console.log('[X DATA] No project X post URLs configured. Add them in Studio → Content → Work.');
    } else {
      console.log(`\nDRIPXEL — refreshing public X engagement snapshots (${linkedProjects.length} linked projects)\n`);
      let cursor = 0;
      const workers = Array.from({ length: Math.min(3, linkedProjects.length) }, async () => {
        while (cursor < linkedProjects.length) {
          const project = linkedProjects[cursor++];
          const result = await fetchPublicPostSnapshot(project, links[project.id].trim(), previous);
          if (result) next[project.id] = result;
        }
      });
      await Promise.all(workers);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`[X DATA] Refresh unavailable; retaining cached snapshots (${message}).`);
  }
}

await mkdir(dataDir, { recursive: true });
await writeFile(cachePath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
const generated = `import type { XLiveSnapshot } from "../types";\n\nconst xLiveGenerated: Record<string, XLiveSnapshot> = ${JSON.stringify(next, null, 2)};\n\nexport default xLiveGenerated;\n`;
await writeFile(generatedPath, generated, 'utf8');
console.log('\nDRIPXEL X engagement snapshot ready.');
console.log('Source: best-effort public FxTwitter snapshot (unofficial; not the official X API).');
console.log('Missing metrics are omitted by the UI; last successful values are retained when refresh fails.\n');
