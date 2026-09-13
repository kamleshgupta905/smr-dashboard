<?php

use App\Models\Admin\Menu;
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
        Schema::create('menu_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users','id');
            $table->foreignIdFor(Menu::class)->constrained();
            $table->integer('add')->default('0');      
            $table->integer('edit')->default('0');      
            $table->integer('delete')->default('0'); 
            $table->integer('print')->default('0');        
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_permissions');
    }
};
