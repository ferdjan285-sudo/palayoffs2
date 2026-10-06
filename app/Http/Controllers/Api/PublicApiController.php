<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\Sport;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Services\BracketService;
use Illuminate\Http\JsonResponse;

class PublicApiController extends Controller
{
    public function __construct(
        protected BracketService $bracketService
    ) {}

    /**
     * Aggregated payload containing active tournament bracket tree,
     * latest division standings, featured live match, and upcoming schedule.
     */
    public function landingData(): JsonResponse
    {
        // 1. Fetch active / latest ongoing or completed tournament
        $tournament = Tournament::with(['sport', 'matches.divisionA', 'matches.divisionB', 'matches.winner', 'placements.division'])
            ->whereIn('status', ['ongoing', 'completed', 'draft'])
            ->latest('id')
            ->first();

        // Auto-sync points if Grand Final is finished
        if ($tournament) {
            $this->bracketService->syncTournamentPoints($tournament);
            $tournament->refresh();
        }

        // Fallback if no tournament exists
        $bracketTree = null;
        if ($tournament) {
            $bracketTree = $this->bracketService->formatBracketAsDag($tournament);
        }

        // 2. Division Standings strictly sorted by total_accumulated_points DESC
        $divisions = Division::orderByDesc('total_accumulated_points')
            ->orderBy('name')
            ->get();

        // 3. Featured Match: Find first 'live' unconcluded match, or first upcoming unconcluded match in canonical order
        $featuredMatch = null;
        if ($tournament) {
            // First check if any match is actively live
            $featuredMatch = TournamentMatch::where('tournament_id', $tournament->id)
                ->where('status', 'live')
                ->whereNull('winner_id')
                ->with(['divisionA', 'divisionB', 'winner'])
                ->first();

            if (!$featuredMatch) {
                // Find next unconcluded match in canonical bracket sequence (M1 -> M2 -> UB-F -> LB-R1 -> LB-F -> GF)
                $orderPriority = ['M1', 'UB1', 'M2', 'UB2', 'UB-F', 'LB-R1', 'LB-F', 'GF'];
                $allTournamentMatches = TournamentMatch::where('tournament_id', $tournament->id)
                    ->whereNull('winner_id')
                    ->where('status', '!=', 'finished')
                    ->with(['divisionA', 'divisionB', 'winner'])
                    ->get();

                $sortedUnconcluded = $allTournamentMatches->sortBy(function ($m) use ($orderPriority) {
                    $idx = array_search($m->match_identifier, $orderPriority);
                    return $idx === false ? 99 : $idx;
                });

                $featuredMatch = $sortedUnconcluded->first();
            }

            if (!$featuredMatch) {
                // If all matches concluded, show Grand Final or latest
                $featuredMatch = TournamentMatch::where('tournament_id', $tournament->id)
                    ->where('match_identifier', 'GF')
                    ->with(['divisionA', 'divisionB', 'winner'])
                    ->first()
                    ?? TournamentMatch::where('tournament_id', $tournament->id)
                    ->latest('id')
                    ->with(['divisionA', 'divisionB', 'winner'])
                    ->first();
            }
        }

        // 4. Upcoming / Full Schedule table rows
        $schedule = [];
        if ($tournament) {
            $matches = TournamentMatch::where('tournament_id', $tournament->id)
                ->with(['divisionA', 'divisionB', 'winner'])
                ->orderBy('scheduled_at', 'asc')
                ->get();

            foreach ($matches as $m) {
                $roundName = match ($m->match_identifier) {
                    'M1', 'UB1' => 'Upper Bracket Round 1 (M1)',
                    'M2', 'UB2' => 'Upper Bracket Round 1 (M2)',
                    'UB-F' => 'Upper Bracket Final',
                    'LB-R1' => 'Lower Round 1',
                    'LB-F' => 'Lower Bracket Final',
                    'GF' => 'Grand Final',
                    'SF1' => 'Semifinals (SF1)',
                    'SF2' => 'Semifinals (SF2)',
                    default => 'Round ' . $m->round_level,
                };

                $schedule[] = [
                    'id' => $m->id,
                    'identifier' => $m->match_identifier,
                    'round_name' => $roundName,
                    'scheduled_at' => $m->scheduled_at?->format('M d, Y · h:i A'),
                    'raw_scheduled_at' => $m->scheduled_at?->toIso8601String(),
                    'division_a' => $m->divisionA ? [
                        'id' => $m->divisionA->id,
                        'name' => $m->divisionA->name,
                        'color_hex' => $m->divisionA->color_hex,
                    ] : ['name' => 'TBD (Seed A)', 'color_hex' => '#64748B'],
                    'division_b' => $m->divisionB ? [
                        'id' => $m->divisionB->id,
                        'name' => $m->divisionB->name,
                        'color_hex' => $m->divisionB->color_hex,
                    ] : ['name' => 'TBD (Seed B)', 'color_hex' => '#64748B'],
                    'score_a' => $m->score_a,
                    'score_b' => $m->score_b,
                    'status' => $m->status,
                    'best_of' => $m->best_of ?? 3,
                    'stream_url' => $m->stream_url,
                    'winner' => $m->winner ? [
                        'id' => $m->winner->id,
                        'name' => $m->winner->name,
                        'color_hex' => $m->winner->color_hex,
                    ] : null,
                    'referee_signed_off' => $m->status === 'finished',
                ];
            }
        }

        // 5. Sports list
        $sports = Sport::all();

        return response()->json([
            'success' => true,
            'tournament' => $tournament,
            'bracket_tree' => $bracketTree,
            'divisions' => $divisions,
            'featured_match' => $featuredMatch,
            'schedule' => $schedule,
            'sports' => $sports,
        ]);
    }

    /**
     * Tournament match hierarchy formatted as directed acyclic graph.
     */
    public function bracket(int $tournament_id): JsonResponse
    {
        $tournament = Tournament::findOrFail($tournament_id);
        $dag = $this->bracketService->formatBracketAsDag($tournament);

        return response()->json([
            'success' => true,
            'bracket' => $dag,
        ]);
    }
}
