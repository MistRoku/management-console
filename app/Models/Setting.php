<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['team_id', 'key', 'value'];

    public static function get($key, $default = null, $team_id = null)
    {
        return cache()->remember("team_settings.{$team_id}.{$key}", 3600, function () use ($key, $team_id, $default) {
            return static::where('team_id', $team_id)
                ->where('key', $key)
                ->first()?->value ?? $default;
        });
    }
}
