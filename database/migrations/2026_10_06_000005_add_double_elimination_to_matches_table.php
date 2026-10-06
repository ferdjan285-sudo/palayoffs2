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
        Schema::table('matches', function (Blueprint $table) {
            $table->enum('bracket_type', ['upper', 'lower', 'grand_final'])->default('upper')->after('round_level');
            $table->foreignId('loser_match_id')->nullable()->after('next_match_id')->constrained('matches')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->dropForeign(['loser_match_id']);
            $table->dropColumn(['bracket_type', 'loser_match_id']);
        });
    }
};
