<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Services\RefereeScoringService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RefereeMatchController extends Controller
{
    public function __construct(
        protected RefereeScoringService $scoringService
    ) {}

    /**
     * Get matches assigned to the referee's designated sport.
     */
    public function assignedMatches(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = TournamentMatch::with(['tournament.sport', 'divisionA', 'divisionB', 'winner', 'nextMatch'])
            ->orderBy('round_level')
            ->orderBy('id');

        if (!$user->isAdmin()) {
            if (!$user->sport_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Referee account has no assigned sport.',
                    'matches' => [],
                ], 403);
            }

            $query->whereHas('tournament', function ($q) use ($user) {
                $q->where('sport_id', $user->sport_id);
            });
        }

        $matches = $query->get();

        // Also fetch active tournament info for this sport
        $tournament = null;
        if ($user->sport_id) {
            $tournament = Tournament::where('sport_id', $user->sport_id)
                ->with(['sport', 'placements.division'])
                ->latest('id')
                ->first();
        } else {
            $tournament = Tournament::with(['sport', 'placements.division'])->latest('id')->first();
        }

        return response()->json([
            'success' => true,
            'matches' => $matches,
            'tournament' => $tournament,
        ]);
    }

    /**
     * Real-time score update and status transition (scheduled -> live -> finished).
     */
    public function liveScore(Request $request, int $id): JsonResponse
    {
        $match = TournamentMatch::with('tournament')->findOrFail($id);

        $validated = $request->validate([
            'score_a' => 'nullable|integer|min:0',
            'score_b' => 'nullable|integer|min:0',
            'status' => 'nullable|in:scheduled,live,finished',
            'winner_id' => 'nullable|exists:divisions,id',
            'stream_url' => 'nullable|string',
            'scheduled_at' => 'nullable|date',
        ]);

        $updatedMatch = $this->scoringService->updateLiveScore(
            $match,
            $validated,
            $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => 'Score updated successfully.',
            'match' => $updatedMatch,
        ]);
    }

    /**
     * Finalize tournament standings and disburse points (25, 20, 15, 10).
     */
    public function finalize(Request $request, int $id): JsonResponse
    {
        $tournament = Tournament::findOrFail($id);

        $request->validate([
            'rankings' => 'required|array',
            'rankings.1' => 'required|exists:divisions,id',
            'rankings.2' => 'required|exists:divisions,id',
            'rankings.3' => 'required|exists:divisions,id',
            'rankings.4' => 'required|exists:divisions,id',
        ]);

        $result = $this->scoringService->finalizeTournament(
            $tournament,
            $request->input('rankings'),
            $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => 'Tournament standings finalized and points disbursed successfully.',
            'data' => $result,
        ]);
    }
}
