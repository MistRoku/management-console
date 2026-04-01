<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Activity;

class AnalyticsController extends Controller
{
    public function dashboard()
    {
        $team = auth()->guard()->user()->currentTeam;

        $stats = [
            'total_users' => $team->users()->count(),
            'total_revenue' => $team->subscription?->plan->price ?? 0,
            'activities' => Activity::where('team_id', $team->id)
                ->latest()
                ->take(50)
                ->get(),
        ];

        return view('dashboard', compact('stats'));
    }
}
