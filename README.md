# Fantasy Football Tiers

Weekly fantasy football tier rankings — a static Jekyll site deployed on GitHub Pages.

**Live site:** https://mglusker.github.io/fantasy-football-tiers/

## How It Works

The frontend is a static Jekyll site. Tier data lives in JSON files under `_data/tiers/`. At build time, Jekyll injects each position's JSON into the page as a `window.__tierData` global. The client-side JS (`tiers.js`) reads that object and renders tier rows, handling scoring-format tab switches without a page reload.

Currently the JSON files contain **sample data**. The backend (not yet built) should generate these JSON files — either by writing them directly into `_data/tiers/` and triggering a rebuild, or by serving them from an API that the frontend fetches at runtime.

## Project Structure

```
.
├── _config.yml                  # Jekyll config (baseurl, title, excludes)
├── _data/
│   └── tiers/
│       ├── qb.json              # One JSON file per position
│       ├── rb.json
│       ├── wr.json
│       ├── te.json
│       ├── k.json
│       └── dst.json
├── _includes/
│   ├── head.html                # <head> tag (meta, CSS)
│   ├── header.html              # Sticky nav bar with position links
│   ├── footer.html              # Site footer
│   └── scoring-tabs.html        # Standard / Half PPR / PPR tab buttons
├── _layouts/
│   ├── default.html             # Base HTML shell
│   └── position.html            # Position page layout (injects JSON + tiers.js)
├── assets/
│   ├── css/style.css            # All styles (no preprocessor)
│   └── js/tiers.js              # Client-side tier rendering & tab switching
├── positions/
│   ├── qb.html                  # One page per position (front matter only)
│   ├── rb.html
│   ├── wr.html
│   ├── te.html
│   ├── k.html
│   └── dst.html
├── index.html                   # Landing page with 6 position cards
├── Gemfile
├── Gemfile.lock
├── .gitignore
└── .github/
    └── workflows/
        └── pages.yml            # GitHub Actions deploy workflow
```

## Data Format

Each file in `_data/tiers/<position>.json` must follow this schema. The filename (without extension) must match the `position_key` in the corresponding `positions/<pos>.html` front matter.

```json
{
  "position": "QB",
  "week": 6,
  "season": 2026,
  "last_updated": "2026-09-15T12:00:00Z",
  "formats": {
    "standard": {
      "tiers": [
        {
          "tier": 1,
          "players": [
            { "name": "Josh Allen", "team": "BUF", "rank": 1 },
            { "name": "Jalen Hurts", "team": "PHI", "rank": 2 }
          ]
        },
        {
          "tier": 2,
          "players": [
            { "name": "Patrick Mahomes", "team": "KC", "rank": 3 }
          ]
        }
      ]
    },
    "half_ppr": {
      "tiers": [ ... ]
    },
    "ppr": {
      "tiers": [ ... ]
    }
  }
}
```

### Field Reference

| Field | Type | Description |
|---|---|---|
| `position` | string | Position abbreviation: `QB`, `RB`, `WR`, `TE`, `K`, `DST` |
| `week` | integer | NFL week number (displayed in "last updated" line) |
| `season` | integer | NFL season year |
| `last_updated` | string | ISO 8601 timestamp |
| `formats` | object | Keys must be `standard`, `half_ppr`, and `ppr` |
| `formats.<fmt>.tiers` | array | Ordered list of tier objects |
| `tiers[].tier` | integer | Tier number (1 = best). Supports up to 12 color-coded tiers |
| `tiers[].players` | array | Players in this tier |
| `players[].name` | string | Player full name |
| `players[].team` | string | Team abbreviation (e.g. `BUF`, `KC`) |
| `players[].rank` | integer | Overall position rank |

### Positions and Keys

| Position Page | `position_key` | JSON File | `position_label` |
|---|---|---|---|
| `positions/qb.html` | `qb` | `_data/tiers/qb.json` | Quarterback |
| `positions/rb.html` | `rb` | `_data/tiers/rb.json` | Running Back |
| `positions/wr.html` | `wr` | `_data/tiers/wr.json` | Wide Receiver |
| `positions/te.html` | `te` | `_data/tiers/te.json` | Tight End |
| `positions/k.html` | `k` | `_data/tiers/k.json` | Kicker |
| `positions/dst.html` | `dst` | `_data/tiers/dst.json` | Defense / ST |

## Backend Integration

The backend needs to produce 6 JSON files matching the schema above. Two integration approaches:

### Option A: Static rebuild (recommended for weekly updates)

The backend writes JSON files into `_data/tiers/`, commits, and pushes to `main`. GitHub Actions will automatically rebuild and deploy.

```bash
# Example: backend script writes files then triggers deploy
python generate_tiers.py --output ./_data/tiers/
git add _data/tiers/
git commit -m "update tiers: week 6"
git push
```

### Option B: Runtime API fetch

Modify `tiers.js` to fetch from an API instead of reading `window.__tierData`. The API response should match the same JSON schema. This avoids Jekyll rebuilds but requires a running backend server.

To switch to this approach, update `_layouts/position.html` to replace the inline `<script>` tag:

```html
<!-- Replace this: -->
<script>
  window.__tierData = {{ site.data.tiers[page.position_key] | jsonify }};
</script>

<!-- With this: -->
<script>
  window.__tierDataUrl = "https://your-api.com/tiers/{{ page.position_key }}";
</script>
```

Then update `tiers.js` to fetch from `window.__tierDataUrl` instead of reading `window.__tierData` directly.

## Frontend Behavior

- **Scoring tabs** (`Standard`, `Half PPR`, `PPR`) switch tiers client-side using the `formats` object — no page reload
- **Tier colors** go from green (tier 1) to red (tier 12) via CSS classes `.tier-color-1` through `.tier-color-12`
- **Last updated** line renders from `week` and `last_updated` fields
- **Responsive** layout: on mobile (<600px), tier rows stack vertically and nav wraps

## Local Development

```bash
# Install dependencies (macOS may need SDKROOT for native extensions)
CPLUS_INCLUDE_PATH="$(xcrun --show-sdk-path)/usr/include/c++/v1" bundle install

# Serve locally with live reload
bundle exec jekyll serve

# Build only (output to _site/)
bundle exec jekyll build
```

Local server runs at `http://127.0.0.1:4000/fantasy-football-tiers/`.

## Deployment

Pushes to `main` trigger the GitHub Actions workflow (`.github/workflows/pages.yml`) which builds the Jekyll site and deploys to GitHub Pages automatically.
