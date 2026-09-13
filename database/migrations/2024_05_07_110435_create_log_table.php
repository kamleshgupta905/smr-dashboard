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
        Schema::create('log_table', function (Blueprint $table) {
            $table->id();
            $table->timestamp('log_date');
            $table->unsignedBigInteger('row_id')->nullable();
            $table->string('table_name');
            $table->string('action');
            $table->json('data_array')->nullable();
            $table->string('user_browser')->nullable();
            $table->string('user_platform')->nullable(); 
            $table->string('ip_address')->nullable();
            $table->unsignedBigInteger('member_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('log_table');
    }
};
