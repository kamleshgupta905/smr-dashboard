<?php

namespace App\Models\admin;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Projects extends Model
{
    use HasFactory;

    protected $table = 'projects';

    public static function getEventCounts($id)
    {
        return self::withCount([
            'vendors as complete_count' => function ($query) {
                $query->select(DB::raw('SUM(complete_count)'));
            },
            'vendors as terminates_count' => function ($query) {
                $query->select(DB::raw('SUM(terminates_count)'));
            },
            'vendors as clicks_count' => function ($query) {
                $query->select(DB::raw('SUM(clicks_count)'));
            }
        ])
        ->where('id', $id)
        ->first();
    }

    public function vendors()
    {
        return $this->hasMany(Vendors::class, 'project_id', 'id');
    }
}
