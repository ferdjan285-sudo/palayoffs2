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
        Schema::table('tournaments', function (Blueprint $table) {
            if (!Schema::hasColumn('tournaments', 'stream_url')) {
                $table->string('stream_url', 500)->nullable()->default('https://zoom.us/j/84920491823?pwd=palayoffs');
            }
            if (!Schema::hasColumn('tournaments', 'zoom_meeting_id')) {
                $table->string('zoom_meeting_id', 100)->nullable()->default('849 2049 1823');
            }
            if (!Schema::hasColumn('tournaments', 'zoom_passcode')) {
                $table->string('zoom_passcode', 100)->nullable()->default('PALAYOFFS');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tournaments', function (Blueprint $table) {
            $table->dropColumn(['stream_url', 'zoom_meeting_id', 'zoom_passcode']);
        });
    }
};
