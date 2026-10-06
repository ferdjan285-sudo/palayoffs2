<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\Sport;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Services\BracketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminTournamentController extends Controller
{
    public function __construct(
        protected BracketService $bracketService
    ) {}

    /**
     * Get list of tournaments.
     */
    public function index(): JsonResponse
    {
        $tournaments = Tournament::with(['sport', 'matches.divisionA', 'matches.divisionB', 'matches.winner'])
            ->latest('id')
            ->get();

        return response()->json([
            'success' => true,
            'tournaments' => $tournaments,
        ]);
    }

    /**
     * Generate knockout bracket for tournament.
     */
    public function generateBracket(Request $request): JsonResponse
    {
        $request->validate([
            'tournament_id' => 'nullable|exists:tournaments,id',
            'title' => 'required_without:tournament_id|string|max:255',
            'sport_id' => 'required_without:tournament_id|exists:sports,id',
            'seed_a_id' => 'required|exists:divisions,id',
            'seed_b_id' => 'required|exists:divisions,id',
            'seed_c_id' => 'required|exists:divisions,id',
            'seed_d_id' => 'required|exists:divisions,id',
            'base_scheduled_at' => 'nullable|date',
            'stream_url' => 'nullable|string|url',
        ]);

        $seedIds = [
            $request->seed_a_id,
            $request->seed_b_id,
            $request->seed_c_id,
            $request->seed_d_id,
        ];

        // Ensure 4 distinct divisions are provided
        if (count(array_unique($seedIds)) !== 4) {
            return response()->json([
                'success' => false,
                'message' => 'All 4 seeds must be assigned to different divisions.',
            ], 422);
        }

        if ($request->tournament_id) {
            $tournament = Tournament::findOrFail($request->tournament_id);
            if ($request->title) {
                $tournament->title = $request->title;
            }
            if ($request->sport_id) {
                $tournament->sport_id = $request->sport_id;
            }
            $tournament->save();
        } else {
            $tournament = Tournament::create([
                'sport_id' => $request->sport_id,
                'title' => $request->title,
                'format' => 'double_elimination',
                'status' => 'ongoing',
            ]);
        }

        $result = $this->bracketService->generateFourTeamBracket(
            $tournament,
            (int)$request->seed_a_id,
            (int)$request->seed_b_id,
            (int)$request->seed_c_id,
            (int)$request->seed_d_id,
            $request->base_scheduled_at,
            $request->stream_url
        );

        return response()->json([
            'success' => true,
            'message' => 'Tournament bracket generated successfully with linked matches!',
            'data' => $result,
        ]);
    }

    /**
     * Fully update match fixture, teams, schedule, scores, and winner.
     */
    public function updateMatchSchedule(Request $request, int $match_id): JsonResponse
    {
        $match = TournamentMatch::findOrFail($match_id);

        $request->validate([
            'scheduled_at' => 'nullable|date',
            'stream_url' => 'nullable|string',
            'status' => 'nullable|in:scheduled,live,finished',
            'division_a_id' => 'nullable|exists:divisions,id',
            'division_b_id' => 'nullable|exists:divisions,id',
            'score_a' => 'nullable|integer|min:0',
            'score_b' => 'nullable|integer|min:0',
            'winner_id' => 'nullable|exists:divisions,id',
            'best_of' => 'nullable|integer|in:1,3,5,7',
        ]);

        if ($request->has('best_of')) {
            $match->best_of = (int)$request->best_of;
        }

        if ($request->has('scheduled_at')) {
            $match->scheduled_at = $request->scheduled_at;
        }

        if ($request->has('stream_url')) {
            $match->stream_url = $request->stream_url;
        }

        if ($request->has('status')) {
            $match->status = $request->status;
        }

        if ($request->has('division_a_id')) {
            $match->division_a_id = $request->division_a_id;
        }

        if ($request->has('division_b_id')) {
            $match->division_b_id = $request->division_b_id;
        }

        if ($request->has('score_a')) {
            $match->score_a = $request->score_a;
        }

        if ($request->has('score_b')) {
            $match->score_b = $request->score_b;
        }

        if ($request->has('winner_id')) {
            $match->winner_id = $request->winner_id;

            // Auto-advance to next match if applicable
            if ($match->next_match_id && $match->winner_id) {
                $next = TournamentMatch::find($match->next_match_id);
                if ($next) {
                    if ($match->match_identifier === 'SF1') {
                        $next->division_a_id = $match->winner_id;
                    } elseif ($match->match_identifier === 'SF2') {
                        $next->division_b_id = $match->winner_id;
                    }
                    $next->save();
                }
            }
        }

        $match->save();

        if ($match->match_identifier === 'GF' && $match->winner_id) {
            $this->bracketService->syncTournamentPoints(Tournament::find($match->tournament_id));
        }

        return response()->json([
            'success' => true,
            'message' => 'Match record updated successfully.',
            'match' => $match->fresh(['divisionA', 'divisionB', 'winner', 'nextMatch']),
        ]);
    }

    /**
     * Update tournament metadata & status.
     */
    public function updateTournament(Request $request, int $id): JsonResponse
    {
        $tournament = Tournament::findOrFail($id);

        $request->validate([
            'title' => 'nullable|string|max:255',
            'status' => 'nullable|in:draft,ongoing,completed',
            'sport_id' => 'nullable|exists:sports,id',
        ]);

        if ($request->title) $tournament->title = $request->title;
        if ($request->status) $tournament->status = $request->status;
        if ($request->sport_id) $tournament->sport_id = $request->sport_id;
        $tournament->save();

        return response()->json([
            'success' => true,
            'message' => 'Tournament updated successfully.',
            'tournament' => $tournament,
        ]);
    }

    /**
     * Admin 1-Click Winner Declaration & Auto-Advancement.
     */
    public function advanceMatchWinner(Request $request, int $match_id): JsonResponse
    {
        $request->validate([
            'winner_id' => 'required|exists:divisions,id',
            'score_a' => 'nullable|integer|min:0',
            'score_b' => 'nullable|integer|min:0',
            'best_of' => 'nullable|integer|in:1,3,5,7',
        ]);

        $match = TournamentMatch::findOrFail($match_id);
        if ($request->has('best_of')) {
            $match->best_of = (int)$request->best_of;
            $match->save();
        }

        try {
            $updatedMatch = $this->bracketService->advanceMatchWinner(
                $match,
                (int)$request->winner_id,
                $request->score_a !== null ? (int)$request->score_a : null,
                $request->score_b !== null ? (int)$request->score_b : null
            );

            return response()->json([
                'success' => true,
                'message' => "Winner successfully declared and advanced to the next bracket round!",
                'match' => $updatedMatch,
                'tournament_matches' => TournamentMatch::where('tournament_id', $match->tournament_id)
                    ->with(['divisionA', 'divisionB', 'winner'])
                    ->get(),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Admin Reset Match fixture.
     */
    public function resetMatch(int $match_id): JsonResponse
    {
        $match = TournamentMatch::findOrFail($match_id);
        $reset = $this->bracketService->resetMatch($match);

        return response()->json([
            'success' => true,
            'message' => "Match fixture #{$match_id} has been reset.",
            'match' => $reset,
        ]);
    }

    /**
     * Admin Finalize Tournament & Disburse Official Points (25, 20, 15, 10).
     */
    public function finalizeTournament(Request $request, int $id): JsonResponse
    {
        $tournament = Tournament::findOrFail($id);

        $request->validate([
            'rankings' => 'nullable|array',
        ]);

        try {
            $result = $this->bracketService->finalizeTournamentStandings($tournament, $request->input('rankings'));

            return response()->json([
                'success' => true,
                'message' => 'Tournament standings finalized and points awarded to the leaderboard successfully!',
                'data' => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Reset Tournament Bracket to pristine Double Elimination state.
     */
    public function resetTournament(int $id): JsonResponse
    {
        $tournament = Tournament::findOrFail($id);

        // Fetch the 4 standard divisions
        $divisions = Division::all();
        if ($divisions->count() < 4) {
            return response()->json([
                'success' => false,
                'message' => 'At least 4 divisions are required to generate a bracket.',
            ], 422);
        }

        $mauve = $divisions->firstWhere('name', 'Mauve') ?: $divisions[0];
        $mint = $divisions->firstWhere('name', 'Mint') ?: $divisions[1];
        $peach = $divisions->firstWhere('name', 'Peach') ?: $divisions[2];
        $cyan = $divisions->firstWhere('name', 'Cyan') ?: $divisions[3];

        $result = $this->bracketService->generateDoubleEliminationBracket(
            $tournament,
            $mauve->id,
            $mint->id,
            $peach->id,
            $cyan->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Tournament bracket has been reset to operational starting state (M1: Mauve vs Mint, M2: Peach vs Cyan).',
            'data' => $result,
        ]);
    }

    /**
     * Reset All Division Accumulated Points to 0.
     */
    public function resetAllPoints(): JsonResponse
    {
        \App\Models\TournamentPlacement::truncate();
        Division::query()->update(['total_accumulated_points' => 0]);

        return response()->json([
            'success' => true,
            'message' => 'All division leaderboard points have been reset to 0.',
            'divisions' => Division::all(),
        ]);
    }

    /**
     * Update division properties or points directly (including logo_path).
     */
    public function updateDivision(Request $request, int $id): JsonResponse
    {
        $division = Division::findOrFail($id);

        $request->validate([
            'name' => 'nullable|string|max:50',
            'color_hex' => 'nullable|string|max:10',
            'logo_path' => 'nullable|string|max:2048',
            'total_accumulated_points' => 'nullable|integer|min:0',
        ]);

        if ($request->has('name')) $division->name = $request->name;
        if ($request->has('color_hex')) $division->color_hex = $request->color_hex;
        if ($request->has('logo_path')) $division->logo_path = $request->logo_path;
        if ($request->has('total_accumulated_points')) {
            $division->total_accumulated_points = $request->total_accumulated_points;
        }
        $division->save();

        return response()->json([
            'success' => true,
            'message' => 'Division record updated successfully.',
            'division' => $division,
        ]);
    }

    /**
     * Upload an image file for a division logo.
     */
    public function uploadDivisionLogo(Request $request, int $id): JsonResponse
    {
        $division = Division::findOrFail($id);

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:4096',
        ]);

        $file = $request->file('image');
        $targetDir = public_path('assets/divisions');
        $filename = 'team_' . $division->id . '_' . time() . '.' . $file->getClientOriginalExtension();

        try {
            if (!file_exists($targetDir)) {
                @mkdir($targetDir, 0755, true);
            }
            $file->move($targetDir, $filename);
            $division->logo_path = '/assets/divisions/' . $filename;
        } catch (\Throwable $e) {
            // Serverless fallback: store as base64 data URI if filesystem is read-only
            $imageData = base64_encode(file_get_contents($file->getRealPath()));
            $mime = $file->getMimeType();
            $division->logo_path = 'data:' . $mime . ';base64,' . $imageData;
        }

        $division->save();

        return response()->json([
            'success' => true,
            'message' => 'Team logo uploaded and updated successfully.',
            'division' => $division,
        ]);
    }

    /**
     * Configure dynamic Zoom Live Stream URL, Meeting ID, and Passcode.
     */
    public function updateZoomStream(Request $request): JsonResponse
    {
        $request->validate([
            'tournament_id' => 'nullable|exists:tournaments,id',
            'zoom_url' => 'required|string|url|max:500',
            'zoom_meeting_id' => 'nullable|string|max:100',
            'zoom_passcode' => 'nullable|string|max:100',
        ]);

        $tournament = null;
        if ($request->tournament_id) {
            $tournament = Tournament::find($request->tournament_id);
        }
        if (!$tournament) {
            $tournament = Tournament::latest('id')->first();
        }

        if (!$tournament) {
            return response()->json([
                'success' => false,
                'message' => 'No active tournament found to configure Zoom stream.',
            ], 404);
        }

        $tournament->stream_url = $request->zoom_url;
        if ($request->has('zoom_meeting_id')) {
            $tournament->zoom_meeting_id = $request->zoom_meeting_id;
        }
        if ($request->has('zoom_passcode')) {
            $tournament->zoom_passcode = $request->zoom_passcode;
        }
        $tournament->save();

        // Also update stream_url on matches so any match-level query stays synchronized
        TournamentMatch::where('tournament_id', $tournament->id)
            ->update(['stream_url' => $request->zoom_url]);

        return response()->json([
            'success' => true,
            'message' => 'Zoom live stream settings updated successfully.',
            'tournament' => $tournament,
        ]);
    }

    /**
     * Get sports and divisions for form wizards.
     */
    public function getMeta(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'sports' => Sport::whereRaw('is_active IS NOT FALSE')->get(),
            'divisions' => Division::all(),
        ]);
    }

    /**
     * Get all staff / admin users from database.
     */
    public function getUsers(): JsonResponse
    {
        $users = \App\Models\User::select('id', 'name', 'email', 'role', 'created_at')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'users' => $users,
        ]);
    }

    /**
     * Create a new staff / admin user directly in database.
     */
    public function createUser(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,referee',
        ]);

        $user = \App\Models\User::create([
            'name' => $request->name,
            'email' => strtolower(trim($request->email)),
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
            'role' => $request->role,
        ]);

        return response()->json([
            'success' => true,
            'message' => "User {$user->name} created successfully as {$user->role}!",
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ],
        ], 201);
    }

    /**
     * Delete a staff / admin user.
     */
    public function deleteUser(int $id): JsonResponse
    {
        $user = \App\Models\User::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found.'], 404);
        }

        if ($user->id === auth()->id()) {
            return response()->json(['success' => false, 'message' => 'You cannot delete your own account while logged in.'], 400);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ]);
    }
}
