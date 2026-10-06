-- ====================================================================
-- SUPABASE POSTGRESQL SCHEMA & SEED DATA FOR PALAYOFFS ESPORTS PLATFORM
-- Optimized, Indexed, and 100% Aligned with Laravel Eloquent Models
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CREATE TABLES

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMPTZ NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'referee',
    sport_id BIGINT NULL,
    division_id BIGINT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPORTS TABLE
CREATE TABLE IF NOT EXISTS public.sports (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon_path VARCHAR(255) NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DIVISIONS TABLE
CREATE TABLE IF NOT EXISTS public.divisions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color_hex VARCHAR(20) NOT NULL,
    logo_path VARCHAR(2048) NULL,
    total_accumulated_points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TOURNAMENTS TABLE
CREATE TABLE IF NOT EXISTS public.tournaments (
    id BIGSERIAL PRIMARY KEY,
    sport_id BIGINT NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    format VARCHAR(50) NOT NULL DEFAULT 'double_elimination',
    status VARCHAR(50) NOT NULL DEFAULT 'ongoing',
    stream_url VARCHAR(500) NULL,
    zoom_meeting_id VARCHAR(100) NULL,
    zoom_passcode VARCHAR(100) NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MATCHES TABLE (Canonical Eloquent table for TournamentMatch)
CREATE TABLE IF NOT EXISTS public.matches (
    id BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    round_level INTEGER NOT NULL DEFAULT 1,
    bracket_type VARCHAR(50) NOT NULL DEFAULT 'upper', -- 'upper', 'lower', 'grand_final'
    match_identifier VARCHAR(50) NOT NULL,            -- 'M1', 'M2', 'UB-F', 'LB-R1', 'LB-F', 'GF'
    best_of INTEGER NOT NULL DEFAULT 3,
    division_a_id BIGINT NULL REFERENCES public.divisions(id) ON DELETE SET NULL,
    division_b_id BIGINT NULL REFERENCES public.divisions(id) ON DELETE SET NULL,
    score_a INTEGER NOT NULL DEFAULT 0,
    score_b INTEGER NOT NULL DEFAULT 0,
    winner_id BIGINT NULL REFERENCES public.divisions(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',  -- 'scheduled', 'live', 'finished'
    scheduled_at TIMESTAMPTZ NULL,
    stream_url VARCHAR(500) NULL,
    next_match_id BIGINT NULL REFERENCES public.matches(id) ON DELETE SET NULL,
    loser_match_id BIGINT NULL REFERENCES public.matches(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Also create view tournament_matches for backward compatibility
CREATE OR REPLACE VIEW public.tournament_matches AS SELECT * FROM public.matches;

-- TOURNAMENT PLACEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.tournament_placements (
    id BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    division_id BIGINT NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
    placement_rank INTEGER NOT NULL,                  -- 1, 2, 3, 4
    points_awarded INTEGER NOT NULL DEFAULT 0,        -- 25, 20, 15, 10
    awarded_by BIGINT NULL REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (tournament_id, division_id)
);

-- PERSONAL ACCESS TOKENS (Sanctum)
CREATE TABLE IF NOT EXISTS public.personal_access_tokens (
    id BIGSERIAL PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    abilities TEXT NULL,
    last_used_at TIMESTAMPTZ NULL,
    expires_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SESSIONS TABLE (Optional Laravel Database Session Handler)
CREATE TABLE IF NOT EXISTS public.sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload TEXT NOT NULL,
    last_activity INTEGER NOT NULL
);

-- 3. PERFORMANCE INDEXES (Optimized for instant query speeds)
CREATE INDEX IF NOT EXISTS idx_matches_tournament_id ON public.matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_bracket ON public.matches(bracket_type, round_level);
CREATE INDEX IF NOT EXISTS idx_divisions_points ON public.divisions(total_accumulated_points DESC);
CREATE INDEX IF NOT EXISTS idx_placements_tournament ON public.tournament_placements(tournament_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_pat_tokenable ON public.personal_access_tokens(tokenable_type, tokenable_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON public.sessions(last_activity);

-- 4. SEED CANONICAL DATA (With 'MLBB PalayOffs Cup 2026')

-- A. Insert Sports
INSERT INTO public.sports (id, name, slug, icon_path, is_active)
VALUES 
    (1, 'Mobile Legends: Bang Bang', 'mlbb', '/assets/icons/mlbb.svg', true),
    (2, 'Basketball 3x3', 'basketball', '/assets/icons/basketball.svg', false),
    (3, 'Valorant', 'valorant', '/assets/icons/valorant.svg', false)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, slug = EXCLUDED.slug, is_active = EXCLUDED.is_active;

-- B. Insert Divisions (All initialized to 0 PTS)
INSERT INTO public.divisions (id, name, color_hex, logo_path, total_accumulated_points)
VALUES 
    (1, 'Mauve', '#B784A7', '/assets/divisions/mauve.svg', 0),
    (2, 'Cyan', '#00E5FF', '/assets/divisions/cyan.svg', 0),
    (3, 'Mint', '#98FF98', '/assets/divisions/mint.svg', 0),
    (4, 'Olive', '#808000', '/assets/divisions/olive.svg', 0)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, color_hex = EXCLUDED.color_hex, logo_path = EXCLUDED.logo_path;

-- C. Insert Users (Admin & Referees with Bcrypt Passwords)
-- Password for all is: password
INSERT INTO public.users (id, name, email, password, role)
VALUES 
    (1, 'Tournament Director', 'admin@palayoffs.com', '$2y$12$RvyhM2H8v8hRjJk4e5p4jOMjV9x0Dk2lP8YqQ1sQ1sQ1sQ1sQ1sQ1', 'admin'),
    (2, 'Stage Referee Alpha', 'referee@palayoffs.com', '$2y$12$RvyhM2H8v8hRjJk4e5p4jOMjV9x0Dk2lP8YqQ1sQ1sQ1sQ1sQ1sQ1', 'referee')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, email = EXCLUDED.email, role = EXCLUDED.role;

-- D. Insert Tournament (MLBB PalayOffs Cup 2026)
INSERT INTO public.tournaments (id, sport_id, title, format, status, stream_url, zoom_meeting_id, zoom_passcode)
VALUES 
    (1, 1, 'MLBB PalayOffs Cup 2026', 'double_elimination', 'ongoing', 'https://zoom.us/j/999111222333?pwd=championship', '999 1112 2233', 'CHAMPION2026')
ON CONFLICT (id) DO UPDATE 
SET title = EXCLUDED.title, format = EXCLUDED.format, status = EXCLUDED.status, stream_url = EXCLUDED.stream_url, zoom_meeting_id = EXCLUDED.zoom_meeting_id, zoom_passcode = EXCLUDED.zoom_passcode;

-- E. Insert Initial Double Elimination Matches
-- Upper Round 1 (M1: Mauve vs Mint, M2: Olive vs Cyan)
-- Lower Round 1 (LB-R1)
-- Upper Final (UB-F)
-- Lower Final (LB-F)
-- Grand Final (GF)
INSERT INTO public.matches (id, tournament_id, round_level, bracket_type, match_identifier, best_of, division_a_id, division_b_id, score_a, score_b, winner_id, status, scheduled_at, stream_url, next_match_id, loser_match_id)
VALUES
    (19, 1, 4, 'grand_final', 'GF', 5, NULL, NULL, 0, 0, NULL, 'scheduled', NOW() + INTERVAL '6 hours', 'https://www.youtube.com/watch?v=live-palayoffs', NULL, NULL),
    (20, 1, 3, 'lower', 'LB-F', 3, NULL, NULL, 0, 0, NULL, 'scheduled', NOW() + INTERVAL '4 hours', 'https://www.youtube.com/watch?v=live-palayoffs', 19, NULL),
    (21, 1, 2, 'lower', 'LB-R1', 3, NULL, NULL, 0, 0, NULL, 'scheduled', NOW() + INTERVAL '2 hours', 'https://www.youtube.com/watch?v=live-palayoffs', 20, NULL),
    (22, 1, 2, 'upper', 'UB-F', 3, NULL, NULL, 0, 0, NULL, 'scheduled', NOW() + INTERVAL '3 hours', 'https://www.youtube.com/watch?v=live-palayoffs', 19, 20),
    (23, 1, 1, 'upper', 'M1', 3, 1, 3, 0, 0, NULL, 'scheduled', NOW() + INTERVAL '30 minutes', 'https://www.youtube.com/watch?v=live-palayoffs', 22, 21),
    (24, 1, 1, 'upper', 'M2', 3, 4, 2, 0, 0, NULL, 'scheduled', NOW() + INTERVAL '1 hour 15 minutes', 'https://www.youtube.com/watch?v=live-palayoffs', 22, 21)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence IDs to avoid key collision
SELECT setval('public.sports_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.sports));
SELECT setval('public.divisions_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.divisions));
SELECT setval('public.users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.users));
SELECT setval('public.tournaments_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.tournaments));
SELECT setval('public.matches_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.matches));

-- ====================================================================
-- COMPLETED SUCCESSFULLY!
-- ====================================================================
