<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    /** @use HasFactory<\Database\Factories\TeamFactory> */
    use HasFactory;

     public function owner()
    {
        return $this->belongsTo(User::class)->wherePivot('role', 'owner');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_team')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }
}
