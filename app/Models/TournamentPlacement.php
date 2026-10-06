<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TournamentPlacement extends Model
{
    use HasFactory;

    protected $fillable = [
        'tournament_id',
        'division_id',
        'placement_rank',
        'points_awarded',
        'awarded_by',
    ];

    protected $casts = [
        'placement_rank' => 'integer',
        'points_awarded' => 'integer',
    ];

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    public function awardedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'awarded_by');
    }
}
