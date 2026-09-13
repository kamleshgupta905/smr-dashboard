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
        Schema::create('card_category_master', function (Blueprint $table) {
            $table->id('card_id');
            $table->string('category_name');
            $table->unsignedBigInteger('start_point');
            $table->unsignedBigInteger('end_point');
            $table->unsignedBigInteger('point_validity');
            $table->decimal('earning_point', 10, 2);
            $table->decimal('special_benefit_online_purchase', 10, 2);
            $table->enum('is_active', ['Y', 'N'])->default('Y');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_category_master');
    }
};
