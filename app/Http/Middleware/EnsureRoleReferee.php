<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRoleReferee
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || (!$user->isReferee() && !$user->isAdmin())) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Referee or Admin credentials required.',
            ], 403);
        }

        return $next($request);
    }
}
