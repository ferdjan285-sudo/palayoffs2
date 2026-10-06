<?php

use App\Http\Controllers\Api\AdminTournamentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PublicApiController;
use App\Http\Controllers\Api\RefereeMatchController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API Layer (Read-Only)
|--------------------------------------------------------------------------
*/
Route::prefix('public')->group(function () {
    Route::get('/landing-data', [PublicApiController::class, 'landingData']);
    Route::get('/bracket/{tournament_id}', [PublicApiController::class, 'bracket']);
});

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

/*
|--------------------------------------------------------------------------
| Admin Studio & Tournament Operations (Role: Admin)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->middleware(['auth:sanctum', 'role.admin'])->group(function () {
    Route::get('/tournaments', [AdminTournamentController::class, 'index']);
    Route::post('/tournaments/generate-bracket', [AdminTournamentController::class, 'generateBracket']);
    Route::patch('/tournaments/{id}', [AdminTournamentController::class, 'updateTournament']);
    Route::post('/tournaments/{id}/finalize', [AdminTournamentController::class, 'finalizeTournament']);
    Route::post('/tournaments/{id}/reset', [AdminTournamentController::class, 'resetTournament']);

    Route::patch('/matches/{id}/schedule', [AdminTournamentController::class, 'updateMatchSchedule']);
    Route::post('/matches/{id}/advance-winner', [AdminTournamentController::class, 'advanceMatchWinner']);
    Route::post('/matches/{id}/reset', [AdminTournamentController::class, 'resetMatch']);

    Route::patch('/divisions/{id}', [AdminTournamentController::class, 'updateDivision']);
    Route::post('/divisions/{id}/upload-logo', [AdminTournamentController::class, 'uploadDivisionLogo']);
    Route::post('/divisions/reset-points', [AdminTournamentController::class, 'resetAllPoints']);

    Route::post('/zoom-stream', [AdminTournamentController::class, 'updateZoomStream']);
    Route::get('/meta', [AdminTournamentController::class, 'getMeta']);

    // Admin User & Staff Account Management
    Route::get('/users', [AdminTournamentController::class, 'getUsers']);
    Route::post('/users', [AdminTournamentController::class, 'createUser']);
    Route::delete('/users/{id}', [AdminTournamentController::class, 'deleteUser']);
});
