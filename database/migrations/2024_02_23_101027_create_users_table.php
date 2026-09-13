<?php

use App\Models\Admin\Role;
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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username')->unique();
            $table->string('mobile_no')->nullable();
            $table->string('email')->unique()->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password'); 
            $table->string('profile_image')->nullable(); 
            $table->string('address')->nullable();           
            $table->foreignIdFor(Role::class)->constrained();
            $table->enum('is_active', ['Y', 'N'])->default('Y');
            $table->enum('is_online', ['Y', 'N'])->default('N');
            $table->rememberToken(); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
