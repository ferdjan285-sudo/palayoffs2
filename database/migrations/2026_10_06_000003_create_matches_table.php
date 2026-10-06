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
        Schema::create('matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained('tournaments')->cascadeOnDelete();
            $table->unsignedTinyInteger('round_level'); // 1 for Semifinals, 2 for Finals
            $table->string('match_identifier'); // SF1, SF2, GF
            $table->foreignId('division_a_id')->nullable()->constrained('divisions')->nullOnDelete();
            $table->foreignId('division_b_id')->nullable()->constrained('divisions')->nullOnDelete();
            $table->integer('score_a')->default(0);
            $table->integer('score_b')->default(0);
            $table->foreignId('winner_id')->nullable()->constrained('divisions')->nullOnDelete();
            $table->enum('status', ['scheduled', 'live', 'finished'])->default('scheduled');
            $table->dateTime('scheduled_at')->nullable();
            $table->string('stream_url')->nullable();
            $table->foreignId('next_match_id')->nullable()->constrained('matches')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};
