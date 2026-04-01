<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    /** @use HasFactory<\Database\Factories\ActivityFactory> */
    use HasFactory;

    protected $fillable = ['team_id', 'user_id', 'type', 'description', 'metadata'];

    protected $casts = [
        'metadata' => 'array',
        'happened_at' => 'datetime',
    ];
}
