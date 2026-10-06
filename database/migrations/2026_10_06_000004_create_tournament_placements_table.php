<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tournament_placements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained('tournaments')->cascadeOnDelete();
            $table->foreignId('division_id')->constrained('divisions')->cascadeOnDelete();
            $table->unsignedTinyInteger('placement_rank'); // 1, 2, 3, 4
            $table->integer('points_awarded'); // 25, 20, 15, 10
            $table->foreignId('awarded_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            // Composite unique keys to prevent double awarding
            $table->unique(['tournament_id', 'placement_rank'], 'uniq_tourn_rank');
            $table->unique(['tournament_id', 'division_id'], 'uniq_tourn_division');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tournament_placements');
    }
};
