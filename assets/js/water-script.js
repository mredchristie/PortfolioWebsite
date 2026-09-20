/* Live figures for the Cornish Water Watch card, from this site's own API.
 *
 * Same contract as the music section: fetch live, fall back to a baked snapshot,
 * and label the card when the snapshot is what you are seeing. The card ships
 * with em-dash placeholders holding the layout so nothing shifts on resolve.
 *
 * Refresh the snapshot occasionally so a fallback does not drift far from
 * reality:  curl -s https://water.mredchristie.dev/v1/stats
 *
 * Wrapped in an IIFE deliberately. These are classic scripts sharing one global
 * scope, and music-script.js also declares a top-level getJSON. Without this the
 * later-loaded file silently wins and this card quietly asks stats.fm for
 * /v1/overflows forever, falling back to the snapshot and looking fine.
 */

(function () {
  const WATER = {
    base: 'https://water.mredchristie.dev',
    timeoutMs: 6000,
    // The year the headline figures quote. Bump when a newer return is imported.
    year: 2025,
  };

  /* Baked fallback, captured 2026-08-24. */
  const WATER_SNAPSHOT = {
    monitored: 389,
    active: null,
    spills: 13004,
    hours: 119104,
    capturedAt: '2026-08-24',
  };

  const wf = new Intl.NumberFormat('en-GB');

  async function getJSON(path) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), WATER.timeoutMs);
    try {
      const res = await fetch(`${WATER.base}${path}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`water API ${res.status} on ${path}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async function loadWaterLive() {
    const [stats, active, overflows] = await Promise.all([
      getJSON('/v1/stats'),
      getJSON('/v1/spills?active=true&limit=500'),
      getJSON('/v1/overflows?limit=1'),
    ]);

    const year = stats.data.find((r) => r.year === WATER.year) ?? stats.data[stats.data.length - 1];
    return {
      // The overflow count is not in the payload, so it comes from the collector's
      // own totals on the status page rather than being guessed at here.
      monitored: WATER_SNAPSHOT.monitored,
      active: active.data.length,
      spills: year ? year.spills : null,
      hours: year ? Math.round(year.hours) : null,
      capturedAt: null,
      overflowsMeta: overflows.meta,
    };
  }

  function renderWater(root, data) {
    const set = (sel, value) => {
      const el = root.querySelector(sel);
      if (el) el.textContent = value === null || value === undefined ? '—' : wf.format(value);
    };

    set('.water-monitored', data.monitored);
    set('.water-active', data.active);
    set('.water-spills', data.spills);
    set('.water-hours', data.hours);

    const stamp = root.querySelector('.water-stamp');
    if (data.capturedAt) {
      stamp.textContent = `Snapshot from ${data.capturedAt}; the live API could not be reached.`;
      stamp.hidden = false;
    } else {
      stamp.hidden = true;
    }

    root.dataset.state = 'ready';
  }

  async function initWater() {
    const root = document.getElementById('water-card');
    if (!root) return;

    let data = null;
    try {
      data = await loadWaterLive();
    } catch (err) {
      console.warn('water API unavailable, using snapshot:', err.message);
    }

    if (!data) data = { ...WATER_SNAPSHOT };
    renderWater(root, data);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initWater();
  });
})();
