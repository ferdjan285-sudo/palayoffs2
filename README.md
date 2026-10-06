# PalayOffs Esports Tournament Platform & Bracketing Engine

A full-stack esports tournament platform and automated matchmaking bracketing engine built with **Laravel 12**, **MySQL / MariaDB**, **React 19**, and **Tailwind CSS 4**.

---

## 🎮 Platform Features & Architecture

### 1. The Outside (Public Gaming HUD & Landing Canvas)
- **Interactive Knockout Tree Flowchart:** SVG hybrid directed acyclic graph (DAG) connecting Semifinal 1 and Semifinal 2 to Grand Finals. Automatically calculates bezier connectors and applies dynamic neon illumination with winning team hex colors (`#B784A7` for Mauve, `#00E5FF` for Cyan, `#98FF98` for Mint, `#FFCBA4` for Peach) and drop shadow filters.
- **Featured Match Spotlight:** Dynamic dual-color gradient backdrop shifting diagonally between opposing factions, start time countdown, and pulsating "Watch Live Stream" broadcast CTA.
- **Live Division Leaderboard:** 4 divisions ordered strictly by `total_accumulated_points` descending with gold crown, silver, bronze, and slate badges, authoritatively tinted borders, and relative margin progress bars.
- **Chronological Match Schedule Table:** Filterable fixtures (All, Live, Scheduled, Completed) with colored division tags, score boxes, live indicators, and referee sign-offs.

### 2. The Inside (Role-Protected Gateways)
- **Admin Control Center (`/admin`):**
  - Tournament Wizard: Create tournaments for MLBB and multi-sport titles.
  - Visual Bracket Builder: Allocate seed divisions (A vs B, C vs D) into 3 linked database rows via `next_match_id` adjacency list.
  - Match Schedule Manager: Inline schedule editor and live stream URL router.
- **Referee Scoring Portal (`/referee`):**
  - Real-time score incrementing/decrementing.
  - Match status toggle (`Scheduled` $\rightarrow$ `Live` $\rightarrow$ `Finished`) that auto-resolves winners and advances winners to Grand Finals.
  - Transactional Finalization Modal: Strict `DB::transaction` assigning Rank 1 = 25 pts, Rank 2 = 20 pts, Rank 3 = 15 pts, Rank 4 = 10 pts, recalculating accumulated points, and locking tournament data against tampering.

---

## 🔑 Demo Access Accounts

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@palayoffs.com` | `admin123` | Full Bracket Engine & Tournament Management |
| **Referee** | `referee@palayoffs.com` | `referee123` | MLBB Live Scoring & Placement Finalization |
| **Spectator** | `viewer@palayoffs.com` | `viewer123` | Public View Only |

---

## 🚀 Running Locally

```bash
# 1. Start MySQL (e.g., via XAMPP)
# 2. Run database migrations & seeders
php artisan migrate:fresh --seed

# 3. Build frontend assets
npm run build
# Or start Vite dev server
npm run dev

# 4. Start Laravel server
php artisan serve --port=8000
```
Open **`http://127.0.0.1:8000`** in your browser.

---

## ☁️ Vercel Deployment Guide

This project is configured out-of-the-box for **Vercel** serverless hosting:

1. **Vercel Serverless Configuration:**
   - [`vercel.json`](file:///d:/palayoffs/PalayOffs2/vercel.json): Configured with `vercel-php@0.7.4`, static routes for `/build/*` and `/assets/*`, and fallback to `/api/index.php`.
   - [`api/index.php`](file:///d:/palayoffs/PalayOffs2/api/index.php): Auto-initializes ephemeral `/tmp/storage` directories for views, cache, logs, and sessions.
   - `package.json`: Contains `"vercel-build": "vite build"`.

2. **Environment Variables on Vercel Dashboard:**
   Set the following under **Project Settings $\rightarrow$ Environment Variables**:
   - `APP_KEY`: Your 32-character base64 Laravel app key.
   - `APP_URL`: Your Vercel domain (e.g., `https://palayoffs.vercel.app`).
   - `DB_CONNECTION`: `mysql` (or remote MySQL / PostgreSQL / TiDB).
   - `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`: Remote database credentials (e.g. PlanetScale, Supabase, AWS RDS, Neon, or TiDB Cloud).
   - `SESSION_DRIVER`: `cookie`
   - `CACHE_STORE`: `array`
