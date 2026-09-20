// Light/dark mode toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// Code snippets collection
// Add your snippets here following this format:

const snippets = [
  {
    id: 1,
    title: 'Jenkins CI/CD Deployment Script',
    description:
      'Complete Jenkins server setup with Java, Gradle, MariaDB, and Git SSH configuration for automated SpringBoot deployment',
    language: 'bash',
    tags: ['jenkins', 'ci-cd', 'java', 'gradle', 'mariadb', 'deployment'],
    date: '2025-01-28',
    code: `#!/bin/bash
# Exit on first error
# This is a script for springboot application - to setup and deploy on a Jenkins server.
# There are a few missing bits like passwords and private key, and they are to fill in yourself :)
set -e
echo "cd to /root directory..."
cd /root
echo "whoami..."
whoami
echo "pwd..."
pwd
# Upgrade first off
echo "upgrading..."
sudo dnf upgrade -y -q
# Create directory for Java installation
sudo mkdir -p /opt/java
cd /opt/java
# Download Java JDK
sudo curl -sLO https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.14%2B7/OpenJDK17U-jdk_x64_linux_hotspot_17.0.14_7.tar.gz
# Extract the downloaded archive
sudo tar xvfz OpenJDK17U-jdk_x64_linux_hotspot_17.0.14_7.tar.gz
# Set up environment variables
echo 'export PATH=/opt/java/jdk-17.0.14+7/bin:$PATH' | sudo tee -a /etc/profile.d/java.sh
echo 'export JAVA_HOME=/opt/java/jdk-17.0.14+7' | sudo tee -a /etc/profile.d/java.sh
# Source the new environment variables
source /etc/profile.d/java.sh
# Verify Java installation
java --version
javac --version
# Setup Gradle
sudo mkdir -p /opt/gradle
cd /opt/gradle
sudo wget -q https://services.gradle.org/distributions/gradle-8.1.1-bin.zip -O gradle.zip
sudo unzip -q gradle.zip
sudo rm gradle.zip
echo 'export PATH=/opt/gradle/gradle-8.1.1/bin:$PATH' | sudo tee -a /etc/profile.d/gradle.sh
source /etc/profile.d/gradle.sh
gradle --version
# MariaDB setup
echo "setting up mariadb"
sudo dnf install mariadb-server -y
echo "starting and enabling MariaDB service"
sudo systemctl start mariadb
sudo systemctl enable mariadb
sudo mysql -e "CREATE DATABASE springboot_demo;"
sudo mysql -e "CREATE USER 'springuser'@'localhost' IDENTIFIED BY '<password>';"
sudo mysql -e "GRANT ALL ON springboot_demo.* TO 'springuser'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES"
# Install git
echo "Installing git"
sudo dnf install git -y
# Ensure .ssh directory exists
mkdir -p ~/.ssh
chmod 700 ~/.ssh
# Add the private key
<priv_key>
echo "$PRIVATE_KEY" >~/.ssh/id_rsa
sudo chmod 400 ~/.ssh/id_rsa
echo "hi"
sudo ssh-keyscan git.cardiff.ac.uk >>~/.ssh/known_hosts
echo "hi hi"
# Attempt to clone the repository with error handling
git clone <repo_url> || {
    echo "Git clone failed. Checking SSH connection..."
    ssh -vT git@git.cardiff.ac.uk || true
    exit 1
}
cd <directory> || exit 1
# Build and run the project
if [ -f "./gradlew" ]; then
    ./gradlew build
    ./gradlew bootRun
else
    gradle build
    gradle bootRun
fi
echo "Changing to the project directory..."
echo "end of script..."`,
  },
  {
    id: 2,
    title: 'Cache-Busted Static Deploy to Object Storage + CDN',
    description:
      "Version-stamps css/js references, mirrors the site to Cloudflare R2, then purges the edge cache. Solves the stale-asset problem where fresh HTML loads yesterday's stylesheet.",
    language: 'bash',
    tags: ['bash', 'cloudflare', 'deployment', 'ci-cd', 'caching'],
    date: '2026-08-03',
    code: `#!/bin/bash
# Static-site deploy: version-stamp assets, mirror to object storage, purge CDN.
# The stamp matters because the CDN caches css/js far longer than html, so a
# fresh page can otherwise load yesterday's stylesheet.
set -e

STAMP=$(date +%Y%m%d%H%M)
echo "Stamping asset versions (?v=$STAMP)..."
python3 - "$STAMP" <<'PYEOF'
import glob, re, sys

stamp = sys.argv[1]
for f in glob.glob("*.html"):
    s = open(f).read()
    out = re.sub(
        r'((?:href|src)="[a-z0-9-]+\\.(?:css|js))(\\?v=[^"]*)?"',
        rf'\\g<1>?v={stamp}"',
        s,
    )
    if out != s:
        open(f, "w").write(out)
        print(f"  stamped {f}")
PYEOF

# Publish only website content. A public .git/ in particular would expose
# the full source history, so exclude it explicitly rather than by accident.
echo "Mirroring to object storage..."
mc mirror --overwrite \\
  --exclude ".git/*" \\
  --exclude "node_modules/*" \\
  --exclude "*.DS_Store" \\
  --exclude "deploy.sh" \\
  --exclude "package*.json" \\
  . r2/website

# Purge the edge cache. Token lives outside the repo and needs only
# Zone -> Cache Purge, so a leak can't do anything else.
TOKEN_FILE="$HOME/.config/cloudflare/purge-token"
if [ -f "$TOKEN_FILE" ]; then
  TOKEN=$(cat "$TOKEN_FILE")
  ZONE_ID=$(curl -s -H "Authorization: Bearer $TOKEN" \\
    "https://api.cloudflare.com/client/v4/zones?name=example.com" |
    python3 -c "import json,sys; r=json.load(sys.stdin); print(r['result'][0]['id'] if r.get('result') else '')")
  if [ -n "$ZONE_ID" ]; then
    curl -s -X POST \\
      -H "Authorization: Bearer $TOKEN" \\
      -H "Content-Type: application/json" \\
      --data '{"purge_everything":true}' \\
      "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" >/dev/null
    echo "Cache purged."
  fi
else
  echo "Purge skipped: no token. Asset versioning still protects css/js."
fi`,
  },
  {
    id: 4,
    title: 'Loopback-Only Compose Services Behind Host nginx',
    description:
      "Binding published ports to 127.0.0.1 so containers are reachable only through the host's nginx. The common '3005:3000' form binds 0.0.0.0 and quietly exposes the app straight to the internet.",
    language: 'docker',
    tags: ['docker', 'compose', 'nginx', 'security', 'self-hosting'],
    date: '2026-07-20',
    code: `# Containers bound to loopback only, with the host's existing nginx doing TLS
# and reverse proxying. Publishing "3005:3000" would bind 0.0.0.0 and expose the
# app straight to the internet, bypassing nginx and the firewall rules with it.
#   weather.example.com -> 127.0.0.1:3005 -> container :3000
#   surf.example.com    -> 127.0.0.1:3006 -> container :3001
services:
  weather:
    build: ../uk-weather-poc
    restart: unless-stopped
    environment:
      - PORT=3000
      - DB_PATH=/app/data/weather.db
    volumes:
      - weather-data:/app/data   # persist the SQLite DB across restarts
    ports:
      - "127.0.0.1:3005:3000"    # loopback only; nginx fronts it

  surf:
    build: ../uk-surf-poc
    restart: unless-stopped
    environment:
      - PORT=3001
    ports:
      - "127.0.0.1:3006:3001"

volumes:
  weather-data:`,
  },
  {
    id: 8,
    title: 'Inverse-Error Weighting for Multi-Model Forecasts',
    description:
      'Scores each weather model against real observations and converts skill into blend weights. Sharpened inverse-MAE so a clearly better model wins, with a neutral fallback so unscored models still participate.',
    language: 'typescript',
    tags: ['typescript', 'forecasting', 'statistics', 'ensemble'],
    date: '2026-07-18',
    code: `// Turn recent forecast accuracy into blend weights, per variable.
//
// Several weather models cover the UK and none is best at everything. Rather
// than averaging them (which drags a good model down toward a bad one), score
// each against real observations and weight by inverse error.

const MIN_N = 3;      // matched forecast/observation pairs before a score is trusted
const EPS = 0.5;      // smoothing, so a model with ~0 error can't take infinite weight
const SHARPNESS = 3;  // weight is proportional to 1/(mae+EPS)^SHARPNESS.
                      // Higher follows the best model harder instead of averaging
                      // toward mediocrity. 0 is a plain average, which loses badly
                      // when one model is clearly superior - the usual case here.

export function computeScores(
  location: string,
  stations: string[],
  allModels: string[],
  variables: string[]
): Scores {
  const pairs = matchedPairs(location, stations);

  // Mean absolute error per (variable, model).
  const acc = new Map<string, { sum: number; n: number }>();
  for (const p of pairs) {
    const k = \`\${p.variable}|\${p.model}\`;
    const a = acc.get(k) ?? { sum: 0, n: 0 };
    a.sum += Math.abs(p.forecast - p.observed);
    a.n += 1;
    acc.set(k, a);
  }

  const scores: Scores = {};
  for (const variable of variables) {
    const rawWeight = new Map<string, number | null>();
    const scoredWeights: number[] = [];
    let sufficient = false;

    for (const model of allModels) {
      const a = acc.get(\`\${variable}|\${model}\`);
      const n = a?.n ?? 0;
      if (a && n >= MIN_N) {
        const mae = a.sum / n;
        const w = 1 / Math.pow(mae + EPS, SHARPNESS);
        rawWeight.set(model, w);
        scoredWeights.push(w);
        sufficient = true;
      } else {
        rawWeight.set(model, null); // too little data to judge; neutral below
      }
    }

    // A model we can't score yet gets the mean of the scored weights, so it
    // still participates instead of being silently dropped. With no scores at
    // all this degrades cleanly to a plain average.
    const neutral =
      scoredWeights.length > 0
        ? scoredWeights.reduce((s, w) => s + w, 0) / scoredWeights.length
        : 1;

    let total = 0;
    const finalW = new Map<string, number>();
    for (const model of allModels) {
      const w = rawWeight.get(model) ?? neutral;
      finalW.set(model, w);
      total += w;
    }

    // Normalise so weights sum to 1 for this variable.
    const models: Record<string, ModelScore> = {};
    for (const model of allModels) {
      models[model] = {
        weight: total > 0 ? finalW.get(model)! / total : 1 / allModels.length,
      };
    }
    scores[variable] = { sufficient, models };
  }

  return scores;
}`,
  },
  {
    id: 9,
    title: 'Two Things to Get Right When Blending Model Outputs',
    description:
      'Categorical variables need a weighted vote, not a mean (the average of fog and heavy rain is drizzle, which nobody forecast). And spread stays unweighted, or a confident model talks over the disagreement.',
    language: 'typescript',
    tags: ['typescript', 'forecasting', 'statistics', 'ensemble'],
    date: '2026-07-18',
    code: `// Combining model outputs, with two details that are easy to get wrong.

// 1. Not every variable is a number you can average. weather_code is
//    categorical - the mean of "fog" and "heavy rain" is "light drizzle",
//    which is a forecast nobody made. Vote on those instead.
const CATEGORICAL = new Set(["weather_code"]);

for (let i = 0; i < times.length; i++) {
  const present = models
    .map((m) => ({ w: weightOf(m.model), v: m.values[i] }))
    .filter(
      (x): x is { w: number; v: number } =>
        typeof x.v === "number" && !Number.isNaN(x.v)
    );

  if (present.length === 0) {
    consensus.push(null);
    spread.push(null);
    continue;
  }

  if (CATEGORICAL.has(variable)) {
    consensus.push(weightedVote(present));
    spread.push(null);
    continue;
  }

  const wSum = present.reduce((s, x) => s + x.w, 0) || 1;
  const mean = present.reduce((s, x) => s + x.w * x.v, 0) / wSum;
  consensus.push(round(mean));

  // 2. Spread is deliberately an UNWEIGHTED standard deviation. Weighting it
  //    would let a confident model talk over the disagreement, and the whole
  //    point of spread is to show how shaky the consensus really is.
  const vals = present.map((x) => x.v);
  const plain = vals.reduce((s, v) => s + v, 0) / vals.length;
  spread.push(round(stddev(vals, plain)));
}

// Weighted majority vote for categorical values.
function weightedVote(present: { w: number; v: number }[]): number {
  const tally = new Map<number, number>();
  let best = present[0].v;
  let bestW = -1;
  for (const { w, v } of present) {
    const nw = (tally.get(v) ?? 0) + w;
    tally.set(v, nw);
    if (nw > bestW) {
      bestW = nw;
      best = v;
    }
  }
  return best;
}`,
  },
  {
    id: 10,
    title: 'Compass Bearing Maths (and a Surf Rating Heuristic)',
    description:
      'Wraparound-safe angle difference, onshore/offshore wind classification, degrees to 16-point compass, and the readable-thresholds scoring function they feed.',
    language: 'typescript',
    tags: ['typescript', 'geometry', 'weather', 'heuristics'],
    date: '2026-07-22',
    code: `// Compass bearing helpers, from a surf forecast tool. Every one of these exists
// because 359 and 1 degrees are two degrees apart, and naive subtraction says 358.

// Smallest angle between two bearings, always 0..180.
export function angleDiff(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

// Both bearings here are the direction the weather comes FROM, which is the
// meteorological convention and the opposite of what you'd guess.
//
// A beach "facing" 270 has open sea to the west. Wind FROM the west blows off
// the sea into the waves and makes them messy (onshore); wind FROM the east
// blows off the land and holds the waves up (offshore).
export function windType(windFromDeg: number, facing: number): WindType {
  const d = angleDiff(windFromDeg, facing);
  if (d <= 67.5) return "onshore";
  if (d >= 112.5) return "offshore";
  return "cross-shore";
}

// 360 / 16 = 22.5 degrees per point. Round to the nearest point and wrap,
// so 350 and 10 both land on N.
export function compass(deg: number): string {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE",
                "S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

// How square-on the swell hits the beach, 0..1. Beyond 90 degrees off the
// beach's facing the swell is arriving from behind the headland, so clamp to 0
// rather than letting it go negative.
const exposure =
  swellDir == null ? 0.5 : Math.max(0, 1 - angleDiff(swellDir, beach.facing) / 90);

// The whole surf-quality heuristic, deliberately kept as readable thresholds
// rather than a fitted curve. Period matters most (long-period groundswell is
// organised, short-period windswell is chop), then wind, then size.
function rate(
  swellHeight: number | null,
  period: number | null,
  wt: WindType | null,
  exposure: number
): { stars: number; word: string } {
  if (swellHeight == null || swellHeight < 0.2) return { stars: 1, word: "Flat" };

  let s = 0;
  if (period != null) {
    if (period >= 12) s += 2;
    else if (period >= 9) s += 1.2;
    else if (period >= 7) s += 0.6;
  }
  if (wt === "offshore") s += 1.6;
  else if (wt === "cross-shore") s += 0.8;

  if (swellHeight >= 1.5) s += 1;
  else if (swellHeight >= 0.8) s += 0.6;
  else if (swellHeight >= 0.4) s += 0.3;

  s += exposure * 0.8;

  const stars = Math.max(1, Math.min(5, Math.round(s)));
  return { stars, word: ["", "Flat", "Poor", "Fair", "Good", "Epic"][stars] };
}`,
  },
  {
    id: 11,
    title: 'Tauri Command: Fetching a CORS-Blocked API from Rust',
    description:
      "Steam's inventory endpoint sends no CORS headers, so fetch() from the webview is blocked. Doing it in the Rust core sidesteps that and allows a real User-Agent, a timeout, and status codes translated into human errors.",
    language: 'rust',
    tags: ['rust', 'tauri', 'cors', 'desktop', 'steam'],
    date: '2026-08-10',
    code: `// A Tauri command that does the HTTP work in Rust rather than the webview.
//
// Steam's inventory endpoint sends no CORS headers, so fetch() from the
// frontend is blocked outright. Moving the call into the Rust core sidesteps
// that entirely, and lets us set a real User-Agent and a sane timeout - neither
// of which the browser would allow us to control.

#[tauri::command]
async fn fetch_inventory(steamid64: String) -> Result<Vec<InventoryItem>, String> {
    let steamid = steamid64.trim();
    if steamid.is_empty() || !steamid.chars().all(|c| c.is_ascii_digit()) {
        return Err("Enter a numeric SteamID64 (the 17-digit one).".into());
    }

    let url = format!(
        "https://steamcommunity.com/inventory/{steamid}/{CS2_APPID}/{CS2_CONTEXTID}?l=english&count=2000"
    );

    let client = reqwest::Client::builder()
        .user_agent("cs2price-desktop/0.1")
        .timeout(Duration::from_secs(25))
        .build()
        .map_err(|e| e.to_string())?;

    let resp = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Network error talking to Steam: {e}"))?;

    // Steam signals the two failures users actually hit through status codes,
    // so translate them into something a person can act on instead of
    // surfacing "HTTP 403" in the UI.
    match resp.status().as_u16() {
        403 => return Err("Steam returned 403 - your inventory privacy is not set to Public.".into()),
        429 => return Err("Steam returned 429 - rate limited. Wait a minute and try again.".into()),
        s if !(200..300).contains(&s) => return Err(format!("Steam returned HTTP {s}.")),
        _ => {}
    }

    let body = resp.text().await.map_err(|e| e.to_string())?;
    let inv: SteamInventory = serde_json::from_str(&body).map_err(|e| {
        // Steam serves an HTML error page on some failures. Log the first bytes
        // so the real cause isn't hidden behind "expected value at line 1".
        let preview: String = body.chars().take(200).collect();
        eprintln!("[fetch_inventory] parse error: {e}; body starts: {preview}");
        format!("Could not parse Steam response: {e}")
    })?;

    if inv.success != 1 {
        return Err("Steam reported no inventory (private, empty, or not yet cached).".into());
    }

    // The response is normalised: \`assets\` are the individual stack entries and
    // \`descriptions\` hold the item metadata, joined on (classid, instanceid).
    let mut desc: HashMap<(&str, &str), &SteamDescription> = HashMap::new();
    for d in &inv.descriptions {
        desc.insert((d.classid.as_str(), d.instanceid.as_str()), d);
    }

    // Roll duplicate assets up into per-item counts before crossing into JS -
    // a 2000-item inventory is mostly repeats.
    let mut counts: HashMap<(String, String), i64> = HashMap::new();
    for a in &inv.assets {
        let amount = a.amount.parse::<i64>().unwrap_or(1);
        *counts.entry((a.classid.clone(), a.instanceid.clone())).or_insert(0) += amount;
    }

    let mut items: Vec<InventoryItem> = Vec::new();
    for ((cid, iid), count) in counts {
        if let Some(d) = desc.get(&(cid.as_str(), iid.as_str())) {
            if d.market_hash_name.is_empty() {
                continue;
            }
            items.push(InventoryItem {
                market_hash_name: d.market_hash_name.clone(),
                count,
                icon_url: format!("{STEAM_IMG_BASE}/{}/96fx96f", d.icon_url),
                item_type: d.item_type.clone(),
                marketable: d.marketable == 1,
            });
        }
    }

    items.sort_by(|a, b| a.market_hash_name.cmp(&b.market_hash_name));
    Ok(items)
}`,
  },
];

// DOM elements
const snippetsGrid = document.getElementById('snippets-grid');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');
const noResults = document.getElementById('no-results');
const scrollProgress = document.getElementById('scroll-progress');

// State
let currentFilter = 'all';
let currentSearch = '';
let visibleSnippets = [];

// Render snippets
function renderSnippets() {
  const filteredSnippets = snippets.filter((snippet) => {
    const matchesFilter =
      currentFilter === 'all' ||
      snippet.language === currentFilter ||
      snippet.tags.includes(currentFilter);

    const matchesSearch =
      currentSearch === '' ||
      snippet.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
      snippet.description.toLowerCase().includes(currentSearch.toLowerCase()) ||
      snippet.tags.some((tag) => tag.toLowerCase().includes(currentSearch.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  if (filteredSnippets.length === 0) {
    snippetsGrid.style.display = 'none';
    noResults.style.display = 'block';
    visibleSnippets = [];
    return;
  }

  snippetsGrid.style.display = 'grid';
  noResults.style.display = 'none';

  visibleSnippets = filteredSnippets;

  snippetsGrid.innerHTML = filteredSnippets
    .map(
      (snippet, i) => `
        <div class="snippet-card" data-id="${snippet.id}" style="transition-delay: ${Math.min(i, 8) * 0.06}s">
            <div class="snippet-header">
                <div class="snippet-title-section">
                    <h3>${snippet.title}</h3>
                    <p class="snippet-description">${snippet.description}</p>
                </div>
                <div class="snippet-header-side">
                    <span class="snippet-language">${snippet.language}</span>
                    <button class="snippet-expand" data-expand="${snippet.id}" aria-label="Open full code for ${escapeAttr(snippet.title)}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <polyline points="9 21 3 21 3 15"></polyline>
                            <line x1="21" y1="3" x2="14" y2="10"></line>
                            <line x1="3" y1="21" x2="10" y2="14"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="snippet-code-wrapper">
                <button class="copy-button" data-copy="${snippet.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy
                </button>
                <div class="snippet-code">
                    <pre><code>${escapeHtml(snippet.code)}</code></pre>
                </div>
            </div>
            <div class="snippet-footer">
                <div class="snippet-tags">
                    ${snippet.tags.map((tag) => `<span class="snippet-tag">${tag}</span>`).join('')}
                </div>
                <span class="snippet-date">${snippet.date}</span>
            </div>
        </div>
    `
    )
    .join('');
}

// Reveal cards on scroll.
//
// styles.css hides .snippet-card until .snippets-section gains .in-view, but
// the observer that adds it lives in script.js, which this page does not load.
// Without this the cards stay at opacity 0 forever.
const snippetsSection = document.querySelector('.snippets-section');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      // Add once and stop watching - re-adding on every scroll would replay
      // the stagger each time the section re-enters the viewport.
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.05 }
);
revealObserver.observe(snippetsSection);

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Copy code to clipboard, swapping the given button's label as feedback.
function copyToClipboard(code, button) {
  navigator.clipboard.writeText(code).then(() => {
    const originalText = button.innerHTML;

    button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Copied!
        `;
    button.classList.add('copied');

    setTimeout(() => {
      button.innerHTML = originalText;
      button.classList.remove('copied');
    }, 2000);
  });
}

// Escape a string for use inside an HTML attribute.
function escapeAttr(text) {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// ── Full-code viewer ──────────────────────────────────────────────────
const viewer = document.getElementById('snippet-viewer');
const viewerTitle = document.getElementById('viewer-title');
const viewerDescription = document.getElementById('viewer-description');
const viewerLanguage = document.getElementById('viewer-language');
const viewerMeta = document.getElementById('viewer-meta');
const viewerCode = document.getElementById('viewer-code');
const viewerCodeScroll = document.getElementById('viewer-code-scroll');
const viewerTags = document.getElementById('viewer-tags');
const viewerDate = document.getElementById('viewer-date');
const viewerPrev = document.getElementById('viewer-prev');
const viewerNext = document.getElementById('viewer-next');
const viewerCopy = document.getElementById('viewer-copy');
const viewerClose = document.getElementById('viewer-close');

let viewerIndex = -1;
let lastFocused = null;

function showInViewer(index) {
  const snippet = visibleSnippets[index];
  if (!snippet) return;
  viewerIndex = index;

  viewerTitle.textContent = snippet.title;
  viewerDescription.textContent = snippet.description;
  viewerLanguage.textContent = snippet.language;
  viewerDate.textContent = snippet.date;

  // Expand tabs before rendering: the line-number column shifts the tab stops,
  // so a leading tab collapses to almost nothing and Go/Makefile indentation
  // comes out ragged.
  const lines = snippet.code.replace(/\t/g, '    ').split('\n');
  viewerMeta.textContent = `${lines.length} lines - ${index + 1} of ${visibleSnippets.length}`;

  // One block element per line so the sticky number column stays put while
  // long lines scroll horizontally underneath it.
  viewerCode.innerHTML = lines
    .map(
      (line, i) =>
        `<span class="code-line"><span class="line-no">${i + 1}</span>${escapeHtml(line)}</span>`
    )
    .join('');

  viewerTags.innerHTML = snippet.tags
    .map((tag) => `<span class="snippet-tag">${escapeHtml(tag)}</span>`)
    .join('');

  viewerPrev.disabled = index === 0;
  viewerNext.disabled = index === visibleSnippets.length - 1;
  viewerCodeScroll.scrollTop = 0;
  viewerCodeScroll.scrollLeft = 0;
}

function openViewer(id) {
  const index = visibleSnippets.findIndex((s) => s.id === id);
  if (index === -1) return;

  lastFocused = document.activeElement;
  showInViewer(index);
  viewer.hidden = false;
  document.body.style.overflow = 'hidden';
  viewerClose.focus();
}

function closeViewer() {
  viewer.hidden = true;
  document.body.style.overflow = '';
  viewerIndex = -1;
  // Send focus back where it came from, or a keyboard user is dumped at the
  // top of the document.
  if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
}

viewerClose.addEventListener('click', closeViewer);
viewerPrev.addEventListener('click', () => showInViewer(viewerIndex - 1));
viewerNext.addEventListener('click', () => showInViewer(viewerIndex + 1));
viewerCopy.addEventListener('click', () => {
  copyToClipboard(visibleSnippets[viewerIndex].code, viewerCopy);
});

// Backdrop click closes; clicks inside the panel do not.
viewer.addEventListener('click', (e) => {
  if (e.target === viewer) closeViewer();
});

document.addEventListener('keydown', (e) => {
  if (viewer.hidden) return;

  if (e.key === 'Escape') {
    closeViewer();
    return;
  }
  if (e.key === 'ArrowLeft' && viewerIndex > 0) showInViewer(viewerIndex - 1);
  if (e.key === 'ArrowRight' && viewerIndex < visibleSnippets.length - 1) {
    showInViewer(viewerIndex + 1);
  }

  // Keep Tab inside the dialog.
  if (e.key === 'Tab') {
    const focusable = [...viewer.querySelectorAll('button:not(:disabled)')];
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

// Card interactions, delegated so they survive re-renders.
snippetsGrid.addEventListener('click', (e) => {
  const copyBtn = e.target.closest('[data-copy]');
  if (copyBtn) {
    const snippet = snippets.find((s) => s.id === Number(copyBtn.dataset.copy));
    if (snippet) copyToClipboard(snippet.code, copyBtn);
    return;
  }

  const expandBtn = e.target.closest('[data-expand]');
  if (expandBtn) {
    openViewer(Number(expandBtn.dataset.expand));
    return;
  }

  // Anywhere else on the card opens it too - unless the click was the end of a
  // drag-select, in which case the user wanted the text, not a modal.
  if (window.getSelection().toString()) return;
  const card = e.target.closest('.snippet-card');
  if (card) openViewer(Number(card.dataset.id));
});

// Search handler
searchInput.addEventListener('input', (e) => {
  currentSearch = e.target.value;
  renderSnippets();
});

// Filter handlers
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((btn) => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');
    currentFilter = button.dataset.filter;
    renderSnippets();
  });
});

// Scroll progress bar
function updateScrollProgress() {
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight - windowHeight;
  const scrolled = window.scrollY;
  const progress = (scrolled / documentHeight) * 100;
  scrollProgress.style.width = progress + '%';
}

window.addEventListener('scroll', updateScrollProgress);
window.addEventListener('resize', updateScrollProgress);

// Mobile menu
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
  hamburger.setAttribute('aria-expanded', hamburger.classList.contains('active').toString());
});

document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  });
});

// Initialize
renderSnippets();
updateScrollProgress();
