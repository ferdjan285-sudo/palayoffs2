<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Division extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'color_hex',
        'logo_path',
        'total_accumulated_points',
    ];

    protected $casts = [
        'total_accumulated_points' => 'integer',
    ];

    public function placements(): HasMany
    {
        return $this->hasMany(TournamentPlacement::class);
    }

    public function matchesAsA(): HasMany
    {
        return $this->hasMany(TournamentMatch::class, 'division_a_id');
    }

    public function matchesAsB(): HasMany
    {
        return $this->hasMany(TournamentMatch::class, 'division_b_id');
    }

    public function matchesWon(): HasMany
    {
        return $this->hasMany(TournamentMatch::class, 'winner_id');
    }
}
