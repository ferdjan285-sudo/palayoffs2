<?php

namespace App\Services;

use App\Models\Tournament;
use App\Models\TournamentMatch;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BracketService
{
    /**
     * Generate 4-team Double Elimination (Upper + Lower Brackets + Grand Finals).
     *
     * Flow:
     * - UB1: Seed A vs Seed B (Winner -> UB-F slot A, Loser -> LB-R1 slot A)
     * - UB2: Seed C vs Seed D (Winner -> UB-F slot B, Loser -> LB-R1 slot B)
     * - UB-F (Upper Semifinal): Winner UB1 vs Winner UB2 (Winner -> GF slot A, Loser -> LB-F slot A)
     * - LB-R1 (Elimination): Loser UB1 vs Loser UB2 (Winner -> LB-F slot B, Loser = 4th place)
     * - LB-F (Decider): Loser UB-F vs Winner LB-R1 (Winner -> GF slot B, Loser = 3rd place)
     * - GF (Grand Final): Winner UB-F vs Winner LB-F (Winner = 1st, Loser = 2nd)
     */
    public function generateDoubleEliminationBracket(
        Tournament $tournament,
        int $seedAId,
        int $seedBId,
        int $seedCId,
        int $seedDId,
        ?string $baseScheduledAt = null,
        ?string $defaultStreamUrl = null
    ): array {
        return DB::transaction(function () use (
            $tournament,
            $seedAId,
            $seedBId,
            $seedCId,
            $seedDId,
            $baseScheduledAt,
            $defaultStreamUrl
        ) {
            TournamentMatch::where('tournament_id', $tournament->id)->delete();

            $baseTime = $baseScheduledAt ? Carbon::parse($baseScheduledAt) : Carbon::now()->addHours(1);
            $stream = $defaultStreamUrl ?: 'https://www.youtube.com/watch?v=live-palayoffs';

            // Match 6: Grand Final (Round 4)
            $gfMatch = TournamentMatch::create([
                'tournament_id' => $tournament->id,
                'round_level' => 4,
                'bracket_type' => 'grand_final',
                'match_identifier' => 'GF',
                'division_a_id' => null, // Winner of UB-F
                'division_b_id' => null, // Winner of LB-F
                'score_a' => 0,
                'score_b' => 0,
                'winner_id' => null,
                'status' => 'scheduled',
                'scheduled_at' => (clone $baseTime)->addHours(6),
                'stream_url' => $stream,
                'best_of' => 5, // Grand Final default Bo5
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
                'scheduled_at' => (clone $baseTime)->addHours(4),
                'stream_url' => $stream,
                'next_match_id' => $gfMatch->id,
                'loser_match_id' => null,
            ]);

            // Match 4: Lower Bracket Round 1 / Elimination (Round 2)
            $lbR1 = TournamentMatch::create([
                'tournament_id' => $tournament->id,
                'round_level' => 2,
                'bracket_type' => 'lower',
                'match_identifier' => 'LB-R1',
                'division_a_id' => null, // Loser of UB1
                'division_b_id' => null, // Loser of UB2
                'score_a' => 0,
                'score_b' => 0,
                'winner_id' => null,
                'status' => 'scheduled',
                'scheduled_at' => (clone $baseTime)->addHours(2),
                'stream_url' => $stream,
                'next_match_id' => $lbFinal->id,
                'loser_match_id' => null,
            ]);

            // Match 3: Upper Bracket Final / Semifinal (Round 2)
            $ubFinal = TournamentMatch::create([
                'tournament_id' => $tournament->id,
                'round_level' => 2,
                'bracket_type' => 'upper',
                'match_identifier' => 'UB-F',
                'division_a_id' => null, // Winner of UB1
                'division_b_id' => null, // Winner of UB2
                'score_a' => 0,
                'score_b' => 0,
                'winner_id' => null,
                'status' => 'scheduled',
                'scheduled_at' => (clone $baseTime)->addHours(3),
                'stream_url' => $stream,
                'next_match_id' => $gfMatch->id,
                'loser_match_id' => $lbFinal->id,
            ]);

            // Match 1: Upper Bracket Match 1 (Round 1 - M1)
            $ub1 = TournamentMatch::create([
                'tournament_id' => $tournament->id,
                'round_level' => 1,
                'bracket_type' => 'upper',
                'match_identifier' => 'M1',
                'division_a_id' => $seedAId,
                'division_b_id' => $seedBId,
                'score_a' => 0,
                'score_b' => 0,
                'winner_id' => null,
                'status' => 'scheduled',
                'scheduled_at' => clone $baseTime,
                'stream_url' => $stream,
                'next_match_id' => $ubFinal->id,
                'loser_match_id' => $lbR1->id,
            ]);

            // Match 2: Upper Bracket Match 2 (Round 1 - M2)
            $ub2 = TournamentMatch::create([
                'tournament_id' => $tournament->id,
                'round_level' => 1,
                'bracket_type' => 'upper',
                'match_identifier' => 'M2',
                'division_a_id' => $seedCId,
                'division_b_id' => $seedDId,
                'score_a' => 0,
                'score_b' => 0,
                'winner_id' => null,
                'status' => 'scheduled',
                'scheduled_at' => (clone $baseTime)->addMinutes(45),
                'stream_url' => $stream,
                'next_match_id' => $ubFinal->id,
                'loser_match_id' => $lbR1->id,
            ]);

            $tournament->format = 'double_elimination';
            $tournament->status = 'ongoing';
            $tournament->save();

            return [
                'tournament' => $tournament->fresh(),
                'matches' => TournamentMatch::where('tournament_id', $tournament->id)->with(['divisionA', 'divisionB'])->get(),
            ];
        });
    }

    /**
     * Legacy Single Elimination (4 teams, 3 matches).
     */
    public function generateFourTeamBracket(
        Tournament $tournament,
        int $seedAId,
        int $seedBId,
        int $seedCId,
        int $seedDId,
        ?string $baseScheduledAt = null,
        ?string $defaultStreamUrl = null
    ): array {
        return $this->generateDoubleEliminationBracket(
            $tournament,
            $seedAId,
            $seedBId,
            $seedCId,
            $seedDId,
            $baseScheduledAt,
            $defaultStreamUrl
        );
    }

    /**
     * Format tournament match hierarchy as directed acyclic graph.
     */
    public function formatBracketAsDag(Tournament $tournament): array
    {
        $matches = TournamentMatch::where('tournament_id', $tournament->id)
            ->with(['divisionA', 'divisionB', 'winner', 'nextMatch', 'loserMatch'])
            ->orderBy('round_level')
            ->orderBy('id')
            ->get();

        $upperBracketMatches = [];
        $lowerBracketMatches = [];
        $grandFinalMatches = [];
        $paths = [];

        foreach ($matches as $match) {
            $formattedMatch = [
                'id' => $match->id,
                'identifier' => $match->match_identifier,
                'round_level' => $match->round_level,
                'bracket_type' => $match->bracket_type ?? 'upper',
                'status' => $match->status,
                'scheduled_at' => $match->scheduled_at?->toIso8601String(),
                'stream_url' => $match->stream_url,
                'division_a' => $match->divisionA ? [
                    'id' => $match->divisionA->id,
                    'name' => $match->divisionA->name,
                    'color_hex' => $match->divisionA->color_hex,
                    'logo_path' => $match->divisionA->logo_path,
                    'points' => $match->divisionA->total_accumulated_points,
                ] : null,
                'division_b' => $match->divisionB ? [
                    'id' => $match->divisionB->id,
                    'name' => $match->divisionB->name,
                    'color_hex' => $match->divisionB->color_hex,
                    'logo_path' => $match->divisionB->logo_path,
                    'points' => $match->divisionB->total_accumulated_points,
                ] : null,
                'score_a' => $match->score_a,
                'score_b' => $match->score_b,
                'best_of' => $match->best_of ?? 3,
                'winner' => $match->winner ? [
                    'id' => $match->winner->id,
                    'name' => $match->winner->name,
                    'color_hex' => $match->winner->color_hex,
                ] : null,
                'next_match_id' => $match->next_match_id,
                'loser_match_id' => $match->loser_match_id,
            ];

            if ($match->bracket_type === 'lower') {
                $lowerBracketMatches[] = $formattedMatch;
            } elseif ($match->bracket_type === 'grand_final') {
                $grandFinalMatches[] = $formattedMatch;
            } else {
                $upperBracketMatches[] = $formattedMatch;
            }

            if ($match->next_match_id) {
                $paths[] = [
                    'source_match_id' => $match->id,
                    'source_identifier' => $match->match_identifier,
                    'target_match_id' => $match->next_match_id,
                    'winner_division_id' => $match->winner_id,
                    'winner_color_hex' => $match->winner?->color_hex,
                    'is_resolved' => (bool)$match->winner_id,
                ];
            }
        }

        return [
            'tournament_id' => $tournament->id,
            'title' => $tournament->title,
            'status' => $tournament->status,
            'format' => $tournament->format,
            'sport' => $tournament->sport ? [
                'id' => $tournament->sport->id,
                'name' => $tournament->sport->name,
                'slug' => $tournament->sport->slug,
            ] : null,
            'upper_bracket' => $upperBracketMatches,
            'lower_bracket' => $lowerBracketMatches,
            'grand_final' => $grandFinalMatches,
            'all_matches' => $matches->toArray(),
            'advancing_paths' => $paths,
        ];
    }

    /**
     * Advance winner & loser according to 4-team Double Elimination chart:
     * - M1: Winner -> UB-F (Slot A), Loser -> LB-R1 (Slot A)
     * - M2: Winner -> UB-F (Slot B), Loser -> LB-R1 (Slot B)
     * - UB-F: Winner -> GF (Slot A), Loser -> LB-F (Slot B)
     * - LB-R1: Winner -> LB-F (Slot A), Loser -> 4th place
     * - LB-F: Winner -> GF (Slot B), Loser -> 3rd place
     * - GF: Winner -> Champion (1st place), Loser -> Runner-Up (2nd place)
     */
    public function advanceMatchWinner(
        TournamentMatch $match,
        int $winnerId,
        ?int $scoreA = null,
        ?int $scoreB = null
    ): TournamentMatch {
        return DB::transaction(function () use ($match, $winnerId, $scoreA, $scoreB) {
            $divAId = (int)$match->division_a_id;
            $divBId = (int)$match->division_b_id;

            if ($winnerId !== $divAId && $winnerId !== $divBId) {
                throw new \InvalidArgumentException("Winner ID #{$winnerId} does not match any competitor in this match.");
            }

            $loserId = ($winnerId === $divAId) ? $divBId : $divAId;

            // Update this match
            $match->winner_id = $winnerId;
            $match->status = 'finished';
            if ($scoreA !== null) $match->score_a = max(0, $scoreA);
            if ($scoreB !== null) $match->score_b = max(0, $scoreB);
            $match->save();

            $identifier = $match->match_identifier;

            // Double Elimination Node Propagation
            if (in_array($identifier, ['M1', 'UB1'])) {
                // Winner -> UB-F (Slot A)
                if ($match->next_match_id) {
                    $ubFinal = TournamentMatch::find($match->next_match_id);
                    if ($ubFinal) {
                        $ubFinal->division_a_id = $winnerId;
                        $ubFinal->save();
                    }
                }
                // Loser -> LB-R1 (Slot A)
                if ($match->loser_match_id) {
                    $lbR1 = TournamentMatch::find($match->loser_match_id);
                    if ($lbR1) {
                        $lbR1->division_a_id = $loserId;
                        $lbR1->save();
                    }
                }
            } elseif (in_array($identifier, ['M2', 'UB2'])) {
                // Winner -> UB-F (Slot B)
                if ($match->next_match_id) {
                    $ubFinal = TournamentMatch::find($match->next_match_id);
                    if ($ubFinal) {
                        $ubFinal->division_b_id = $winnerId;
                        $ubFinal->save();
                    }
                }
                // Loser -> LB-R1 (Slot B)
                if ($match->loser_match_id) {
                    $lbR1 = TournamentMatch::find($match->loser_match_id);
                    if ($lbR1) {
                        $lbR1->division_b_id = $loserId;
                        $lbR1->save();
                    }
                }
            } elseif ($identifier === 'UB-F') {
                // Winner -> GF (Slot A)
                if ($match->next_match_id) {
                    $gf = TournamentMatch::find($match->next_match_id);
                    if ($gf) {
                        $gf->division_a_id = $winnerId;
                        $gf->save();
                    }
                }
                // Loser -> LB-F (Slot B)
                if ($match->loser_match_id) {
                    $lbFinal = TournamentMatch::find($match->loser_match_id);
                    if ($lbFinal) {
                        $lbFinal->division_b_id = $loserId;
                        $lbFinal->save();
                    }
                }
            } elseif ($identifier === 'LB-R1') {
                // Winner -> LB-F (Slot A)
                if ($match->next_match_id) {
                    $lbFinal = TournamentMatch::find($match->next_match_id);
                    if ($lbFinal) {
                        $lbFinal->division_a_id = $winnerId;
                        $lbFinal->save();
                    }
                }
                // Loser is eliminated (4th place)
            } elseif ($identifier === 'LB-F') {
                // Winner -> GF (Slot B)
                if ($match->next_match_id) {
                    $gf = TournamentMatch::find($match->next_match_id);
                    if ($gf) {
                        $gf->division_b_id = $winnerId;
                        $gf->save();
                    }
                }
                // Loser is eliminated (3rd place)
            } elseif ($identifier === 'GF') {
                // Winner is Champion (1st place)
                // Loser is Runner-Up (2nd place)
                // Automatically disburse official points (25, 20, 15, 10) and update leaderboard
                $tournament = Tournament::find($match->tournament_id);
                if ($tournament) {
                    $this->finalizeTournamentStandings($tournament);
                }
            }

            return $match->fresh(['divisionA', 'divisionB', 'winner', 'nextMatch', 'loserMatch']);
        });
    }

    /**
     * Reset a match back to scheduled state and clear downstream dependencies.
     */
    public function resetMatch(TournamentMatch $match): TournamentMatch
    {
        return DB::transaction(function () use ($match) {
            $identifier = $match->match_identifier;

            // Clear downstream matches where this match's winner/loser was placed
            if (in_array($identifier, ['M1', 'UB1'])) {
                if ($match->next_match_id) {
                    TournamentMatch::where('id', $match->next_match_id)->update(['division_a_id' => null, 'winner_id' => null]);
                }
                if ($match->loser_match_id) {
                    TournamentMatch::where('id', $match->loser_match_id)->update(['division_a_id' => null, 'winner_id' => null]);
                }
            } elseif (in_array($identifier, ['M2', 'UB2'])) {
                if ($match->next_match_id) {
                    TournamentMatch::where('id', $match->next_match_id)->update(['division_b_id' => null, 'winner_id' => null]);
                }
                if ($match->loser_match_id) {
                    TournamentMatch::where('id', $match->loser_match_id)->update(['division_b_id' => null, 'winner_id' => null]);
                }
            } elseif ($identifier === 'UB-F') {
                if ($match->next_match_id) {
                    TournamentMatch::where('id', $match->next_match_id)->update(['division_a_id' => null, 'winner_id' => null]);
                }
                if ($match->loser_match_id) {
                    TournamentMatch::where('id', $match->loser_match_id)->update(['division_b_id' => null, 'winner_id' => null]);
                }
            } elseif ($identifier === 'LB-R1') {
                if ($match->next_match_id) {
                    TournamentMatch::where('id', $match->next_match_id)->update(['division_a_id' => null, 'winner_id' => null]);
                }
            } elseif ($identifier === 'LB-F') {
                if ($match->next_match_id) {
                    TournamentMatch::where('id', $match->next_match_id)->update(['division_b_id' => null, 'winner_id' => null]);
                }
            }

            // Clear placements if tournament had been finalized and recalculate points
            \App\Models\TournamentPlacement::where('tournament_id', $match->tournament_id)->delete();
            $allDivisions = \App\Models\Division::all();
            foreach ($allDivisions as $div) {
                $div->total_accumulated_points = (int)\App\Models\TournamentPlacement::where('division_id', $div->id)->sum('points_awarded');
                $div->save();
            }
            $tournament = Tournament::find($match->tournament_id);
            if ($tournament && $tournament->status === 'completed') {
                $tournament->status = 'ongoing';
                $tournament->save();
            }

            $match->winner_id = null;
            $match->score_a = 0;
            $match->score_b = 0;
            $match->status = 'scheduled';
            $match->save();

            return $match->fresh(['divisionA', 'divisionB', 'winner']);
        });
    }

    /**
     * Synchronize and auto-finalize tournament standings if Grand Final has concluded.
     */
    public function syncTournamentPoints(?Tournament $tournament): void
    {
        if (!$tournament) return;

        $gf = TournamentMatch::where('tournament_id', $tournament->id)
            ->where('match_identifier', 'GF')
            ->first();

        if ($gf && $gf->winner_id && $gf->status === 'finished') {
            $hasPlacements = \App\Models\TournamentPlacement::where('tournament_id', $tournament->id)->exists();
            if (!$hasPlacements || $tournament->status !== 'completed') {
                $this->finalizeTournamentStandings($tournament);
            }
        }
    }

    /**
     * Finalize tournament standings and disburse official points (25, 20, 15, 10).
     */
    public function finalizeTournamentStandings(Tournament $tournament, ?array $rankings = null): array
    {
        return DB::transaction(function () use ($tournament, $rankings) {
            // Delete any existing placements for this tournament
            \App\Models\TournamentPlacement::where('tournament_id', $tournament->id)->delete();

            $rankPoints = [1 => 25, 2 => 20, 3 => 15, 4 => 10];

            if (!$rankings) {
                // Auto-derive rankings from Double Elimination tree
                $gf = TournamentMatch::where('tournament_id', $tournament->id)->where('match_identifier', 'GF')->first();
                $lbF = TournamentMatch::where('tournament_id', $tournament->id)->where('match_identifier', 'LB-F')->first();
                $lbR1 = TournamentMatch::where('tournament_id', $tournament->id)->where('match_identifier', 'LB-R1')->first();

                if (!$gf || !$gf->winner_id) {
                    throw new \RuntimeException('Grand Final match must be concluded before tournament can be finalized.');
                }

                $rankings = [];
                // 1st Place: Winner of GF
                $rankings[1] = $gf->winner_id;
                // 2nd Place: Loser of GF
                $rankings[2] = ($gf->winner_id === $gf->division_a_id) ? $gf->division_b_id : $gf->division_a_id;
                // 3rd Place: Loser of Lower Bracket Final
                if ($lbF && $lbF->winner_id) {
                    $rankings[3] = ($lbF->winner_id === $lbF->division_a_id) ? $lbF->division_b_id : $lbF->division_a_id;
                }
                // 4th Place: Loser of Lower Round 1
                if ($lbR1 && $lbR1->winner_id) {
                    $rankings[4] = ($lbR1->winner_id === $lbR1->division_a_id) ? $lbR1->division_b_id : $lbR1->division_a_id;
                }
            }

            foreach ($rankings as $rank => $divisionId) {
                if (!$divisionId) continue;
                $points = $rankPoints[(int)$rank] ?? 0;
                \App\Models\TournamentPlacement::create([
                    'tournament_id' => $tournament->id,
                    'division_id' => (int)$divisionId,
                    'placement_rank' => (int)$rank,
                    'points_awarded' => $points,
                    'awarded_by' => 1,
                ]);
            }

            // Recalculate total accumulated points for all divisions
            $allDivisions = \App\Models\Division::all();
            foreach ($allDivisions as $div) {
                $div->total_accumulated_points = (int)\App\Models\TournamentPlacement::where('division_id', $div->id)->sum('points_awarded');
                $div->save();
            }

            $tournament->status = 'completed';
            $tournament->save();

            return [
                'tournament' => $tournament->fresh(['placements.division']),
                'standings' => \App\Models\Division::orderByDesc('total_accumulated_points')->get(),
            ];
        });
    }
}
