<?php

namespace App\Models\admin;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogTable extends Model
{
    protected $table = 'log_table';

    protected $fillable = [
        'log_date',
        'row_id',
        'table_name',
        'action',
        'data_array',
        'user_browser',
        'user_platform',
        'ip_address',
        'member_id',
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
