<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tournament extends Model
{
    use HasFactory;

    protected $fillable = [
        'sport_id',
        'title',
        'format',
        'status',
        'stream_url',
        'zoom_meeting_id',
        'zoom_passcode',
    ];

    public function sport(): BelongsTo
    {
        return $this->belongsTo(Sport::class);
    }

    public function matches(): HasMany
    {
        return $this->hasMany(TournamentMatch::class)->orderBy('round_level')->orderBy('id');
    }

    public function placements(): HasMany
    {
        return $this->hasMany(TournamentPlacement::class)->orderBy('placement_rank');
    }
}
