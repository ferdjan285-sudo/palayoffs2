<?php

namespace Database\Seeders;

use App\Models\Division;
use App\Models\Sport;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Sports
        $mlbb = Sport::create([
            'name' => 'Mobile Legends: Bang Bang',
            'slug' => 'mlbb',
            'icon_path' => '/assets/icons/mlbb.svg',
            'is_active' => true,
        ]);

        $basketball = Sport::create([
            'name' => 'Basketball 3x3',
            'slug' => 'basketball',
            'icon_path' => '/assets/icons/basketball.svg',
            'is_active' => false,
        ]);

        $valorant = Sport::create([
            'name' => 'Valorant',
            'slug' => 'valorant',
            'icon_path' => '/assets/icons/valorant.svg',
            'is_active' => false,
        ]);

        // 2. Seed Divisions with fixed hex codes and operational 0 starting points
        $mauve = Division::create([
            'name' => 'Mauve',
            'color_hex' => '#B784A7',
            'logo_path' => '/assets/divisions/mauve.svg',
            'total_accumulated_points' => 0,
        ]);

        $cyan = Division::create([
            'name' => 'Cyan',
            'color_hex' => '#00E5FF',
            'logo_path' => '/assets/divisions/cyan.svg',
            'total_accumulated_points' => 0,
        ]);

        $mint = Division::create([
            'name' => 'Mint',
            'color_hex' => '#98FF98',
            'logo_path' => '/assets/divisions/mint.svg',
            'total_accumulated_points' => 0,
        ]);

        $peach = Division::create([
            'name' => 'Peach',
            'color_hex' => '#FFCBA4',
            'logo_path' => '/assets/divisions/peach.svg',
            'total_accumulated_points' => 0,
        ]);

        // 3. Seed Users (Tournament Director Admin, Spectator Viewer)
        $admin = User::create([
            'name' => 'Tournament Director',
            'email' => 'admin@palayoffs.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'sport_id' => null,
        ]);

        $viewer = User::create([
            'name' => 'Guest Spectator',
            'email' => 'viewer@palayoffs.com',
            'password' => Hash::make('viewer123'),
            'role' => 'viewer',
            'sport_id' => null,
        ]);

        // 4. Seed an Active Inaugural Tournament with 4-Team Double Elimination Knockout Tree
        $tournament = Tournament::create([
            'sport_id' => $mlbb->id,
            'title' => 'MLBB PalayOffs Invitational Cup 2026',
            'format' => 'double_elimination',
            'status' => 'ongoing',
        ]);

        $baseTime = Carbon::now();
        $stream = 'https://www.youtube.com/watch?v=live-palayoffs';

        // Match 6: Grand Final (Round 4)
        $gf = TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'round_level' => 4,
            'bracket_type' => 'grand_final',
            'match_identifier' => 'GF',
            'division_a_id' => null, // Waiting for Winner of UB-F
            'division_b_id' => null, // Waiting for Winner of LB-F
            'score_a' => 0,
            'score_b' => 0,
            'winner_id' => null,
            'status' => 'scheduled',
            'scheduled_at' => (clone $baseTime)->addHours(5),
            'stream_url' => $stream,
            'next_match_id' => null,
            'loser_match_id' => null,
        ]);

        // Match 5: Lower Bracket Final / Decider (Round 3)
        $lbFinal = TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'round_level' => 3,
            'bracket_type' => 'lower',
            'match_identifier' => 'LB-F',
            'division_a_id' => null, // Loser of UB-F
            'division_b_id' => null, // Winner of LB-R1
            'score_a' => 0,
            'score_b' => 0,
            'winner_id' => null,
            'status' => 'scheduled',
            'scheduled_at' => (clone $baseTime)->addHours(3)->addMinutes(30),
            'stream_url' => $stream,
            'next_match_id' => $gf->id,
            'loser_match_id' => null,
        ]);

        // Match 4: Lower Bracket Round 1 / Elimination (Round 2)
        $lbR1 = TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'round_level' => 2,
            'bracket_type' => 'lower',
            'match_identifier' => 'LB-R1',
            'division_a_id' => null, // Loser of Mauve vs Mint (UB1)
            'division_b_id' => null, // Loser of Peach vs Cyan (UB2)
            'score_a' => 0,
            'score_b' => 0,
            'winner_id' => null,
            'status' => 'scheduled',
            'scheduled_at' => (clone $baseTime)->addHours(2),
            'stream_url' => $stream,
            'next_match_id' => $lbFinal->id,
            'loser_match_id' => null,
        ]);

        // Match 3: Upper Bracket Final / Semifinals (Round 2)
        $ubFinal = TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'round_level' => 2,
            'bracket_type' => 'upper',
            'match_identifier' => 'UB-F',
            'division_a_id' => null, // Winner of Mauve vs Mint (UB1)
            'division_b_id' => null, // Winner of Peach vs Cyan (UB2)
            'score_a' => 0,
            'score_b' => 0,
            'winner_id' => null,
            'status' => 'scheduled',
            'scheduled_at' => (clone $baseTime)->addHours(2)->addMinutes(30),
            'stream_url' => $stream,
            'next_match_id' => $gf->id,
            'loser_match_id' => $lbFinal->id,
        ]);

        // Match 1: Upper Bracket Match 1 (M1: Mauve vs Mint - Scheduled)
        $ub1 = TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'round_level' => 1,
            'bracket_type' => 'upper',
            'match_identifier' => 'M1',
            'division_a_id' => $mauve->id,
            'division_b_id' => $mint->id,
            'score_a' => 0,
            'score_b' => 0,
            'winner_id' => null,
            'status' => 'scheduled',
            'scheduled_at' => clone $baseTime,
            'stream_url' => 'https://www.youtube.com/watch?v=live-palayoffs-mauve-mint',
            'next_match_id' => $ubFinal->id,
            'loser_match_id' => $lbR1->id,
        ]);

        // Match 2: Upper Bracket Match 2 (M2: Peach vs Cyan - Scheduled)
        $ub2 = TournamentMatch::create([
            'tournament_id' => $tournament->id,
            'round_level' => 1,
            'bracket_type' => 'upper',
            'match_identifier' => 'M2',
            'division_a_id' => $peach->id,
            'division_b_id' => $cyan->id,
            'score_a' => 0,
            'score_b' => 0,
            'winner_id' => null,
            'status' => 'scheduled',
            'scheduled_at' => (clone $baseTime)->addMinutes(45),
            'stream_url' => 'https://www.youtube.com/watch?v=live-palayoffs-peach-cyan',
            'next_match_id' => $ubFinal->id,
            'loser_match_id' => $lbR1->id,
        ]);
    }
}
