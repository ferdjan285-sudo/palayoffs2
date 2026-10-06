<?php

namespace App\Services;

use App\Models\Division;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\TournamentPlacement;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RefereeScoringService
{
    /**
     * Points constants mapped to placement ranks.
     */
    public const RANK_POINTS = [
        1 => 25,
        2 => 20,
        3 => 15,
        4 => 10,
    ];

    /**
     * Verify that the referee is authorized for the tournament's sport.
     */
    public function authorizeReferee(User $user, Tournament $tournament): void
    {
        if ($user->isAdmin()) {
            return;
        }

        if ($user->role !== 'referee' || (int)$user->sport_id !== (int)$tournament->sport_id) {
            throw ValidationException::withMessages([
                'authorization' => ['Referee account is not authorized for this tournament sport.'],
            ]);
        }
    }

    /**
     * Update match live scores, status, and auto-advance winner when finished.
     */
    public function updateLiveScore(TournamentMatch $match, array $data, User $user): TournamentMatch
    {
        $this->authorizeReferee($user, $match->tournament);

        if ($match->tournament->status === 'completed') {
            throw ValidationException::withMessages([
                'status' => ['This tournament has already been finalized and locked.'],
            ]);
        }

        if (isset($data['score_a'])) {
            $match->score_a = max(0, (int)$data['score_a']);
        }

        if (isset($data['score_b'])) {
            $match->score_b = max(0, (int)$data['score_b']);
        }

        if (isset($data['status'])) {
            $match->status = $data['status'];
        }

        if (isset($data['stream_url'])) {
            $match->stream_url = $data['stream_url'];
        }

        if (isset($data['scheduled_at'])) {
            $match->scheduled_at = $data['scheduled_at'];
        }

        // Handle Winner and Loser Resolution if Finished
        if ($match->status === 'finished') {
            if (isset($data['winner_id']) && $data['winner_id']) {
                $match->winner_id = (int)$data['winner_id'];
            } elseif ($match->score_a > $match->score_b && $match->division_a_id) {
                $match->winner_id = $match->division_a_id;
            } elseif ($match->score_b > $match->score_a && $match->division_b_id) {
                $match->winner_id = $match->division_b_id;
            }

            $loserId = null;
            if ($match->winner_id && $match->division_a_id && $match->division_b_id) {
                $loserId = ($match->winner_id === $match->division_a_id) ? $match->division_b_id : $match->division_a_id;
            }

            // Propagate winner to next match if connected
            if ($match->next_match_id && $match->winner_id) {
                $nextMatch = TournamentMatch::find($match->next_match_id);
                if ($nextMatch) {
                    if (in_array($match->match_identifier, ['M1', 'UB1', 'UB-F', 'SF1'])) {
                        $nextMatch->division_a_id = $match->winner_id;
                    } elseif (in_array($match->match_identifier, ['M2', 'UB2', 'LB-R1', 'LB-F', 'SF2'])) {
                        $nextMatch->division_b_id = $match->winner_id;
                    } else {
                        if (!$nextMatch->division_a_id) {
                            $nextMatch->division_a_id = $match->winner_id;
                        } else {
                            $nextMatch->division_b_id = $match->winner_id;
                        }
                    }
                    $nextMatch->save();
                }
            }

            // Propagate loser to lower bracket match if connected
            if ($match->loser_match_id && $loserId) {
                $loserMatch = TournamentMatch::find($match->loser_match_id);
                if ($loserMatch) {
                    if (in_array($match->match_identifier, ['M1', 'UB1'])) {
                        $loserMatch->division_a_id = $loserId;
                    } elseif (in_array($match->match_identifier, ['M2', 'UB2'])) {
                        $loserMatch->division_b_id = $loserId;
                    } elseif (in_array($match->match_identifier, ['UB-F'])) {
                        // Loser of Upper Bracket Final drops to Lower Bracket Final (Slot B)
                        $loserMatch->division_b_id = $loserId;
                    } else {
                        if (!$loserMatch->division_a_id) {
                            $loserMatch->division_a_id = $loserId;
                        } else {
                            $loserMatch->division_b_id = $loserId;
                        }
                    }
                    $loserMatch->save();
                }
            }
        }

        $match->save();

        return $match->fresh(['divisionA', 'divisionB', 'winner', 'nextMatch', 'loserMatch']);
    }

    /**
     * Finalize tournament standings and disburse points within a strict database transaction.
     *
     * @param array $rankings ['1' => division_id, '2' => division_id, '3' => division_id, '4' => division_id]
     */
    public function finalizeTournament(Tournament $tournament, array $rankings, User $user): array
    {
        $this->authorizeReferee($user, $tournament);

        if ($tournament->status === 'completed') {
            throw ValidationException::withMessages([
                'tournament' => ['Tournament has already been completed and locked.'],
            ]);
        }

        // Validate that ranks 1, 2, 3, 4 are all present and distinct
        $expectedRanks = [1, 2, 3, 4];
        $providedRanks = array_map('intval', array_keys($rankings));
        sort($providedRanks);

        if ($providedRanks !== $expectedRanks) {
            throw ValidationException::withMessages([
                'rankings' => ['Rankings must contain keys 1, 2, 3, and 4.'],
            ]);
        }

        $divisionIds = array_values($rankings);
        if (count($divisionIds) !== 4 || count(array_unique($divisionIds)) !== 4) {
            throw ValidationException::withMessages([
                'rankings' => ['All 4 participating divisions must be distinct and non-empty.'],
            ]);
        }

        // Verify all 4 division IDs exist in database
        $divisionsCount = Division::whereIn('id', $divisionIds)->count();
        if ($divisionsCount !== 4) {
            throw ValidationException::withMessages([
                'rankings' => ['One or more specified divisions do not exist.'],
            ]);
        }

        return DB::transaction(function () use ($tournament, $rankings, $user) {
            // Delete any existing placements for this tournament if any
            TournamentPlacement::where('tournament_id', $tournament->id)->delete();

            // Insert placement records
            foreach ($rankings as $rank => $divisionId) {
                $rankInt = (int)$rank;
                $points = self::RANK_POINTS[$rankInt] ?? 0;

                TournamentPlacement::create([
                    'tournament_id' => $tournament->id,
                    'division_id' => $divisionId,
                    'placement_rank' => $rankInt,
                    'points_awarded' => $points,
                    'awarded_by' => $user->id,
                ]);
            }

            // Incremental point recalculation across all tournaments:
            // Total Points = SUM(points_awarded for each division across all tournaments)
            $allDivisions = Division::all();
            foreach ($allDivisions as $division) {
                $totalSum = TournamentPlacement::where('division_id', $division->id)->sum('points_awarded');
                $division->total_accumulated_points = (int)$totalSum;
                $division->save();
            }

            // Lock tournament
            $tournament->status = 'completed';
            $tournament->save();

            return [
                'tournament' => $tournament->fresh(['placements.division', 'matches']),
                'standings' => Division::orderByDesc('total_accumulated_points')->get(),
            ];
        });
    }
}
