<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TournamentMatch extends Model
{
    use HasFactory;

    protected $table = 'matches';

    protected $fillable = [
        'tournament_id',
        'round_level',
        'match_identifier',
        'division_a_id',
        'division_b_id',
        'score_a',
        'score_b',
        'winner_id',
        'status',
        'scheduled_at',
        'stream_url',
        'next_match_id',
        'loser_match_id',
        'bracket_type',
        'best_of',
    ];

    protected $casts = [
        'round_level' => 'integer',
        'score_a' => 'integer',
        'score_b' => 'integer',
        'best_of' => 'integer',
        'scheduled_at' => 'datetime',
    ];

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    public function divisionA(): BelongsTo
    {
        return $this->belongsTo(Division::class, 'division_a_id');
    }

    public function divisionB(): BelongsTo
    {
        return $this->belongsTo(Division::class, 'division_b_id');
    }

    public function winner(): BelongsTo
    {
        return $this->belongsTo(Division::class, 'winner_id');
    }

    public function nextMatch(): BelongsTo
    {
        return $this->belongsTo(TournamentMatch::class, 'next_match_id');
    }

    public function loserMatch(): BelongsTo
    {
        return $this->belongsTo(TournamentMatch::class, 'loser_match_id');
    }

    public function previousMatches(): HasMany
    {
        return $this->hasMany(TournamentMatch::class, 'next_match_id');
    }
}
