<?php

use Livewire\Component;

class ActivityFeed extends Component
{
    public $teamId;

    public function mount($teamId)
    {
        $this->teamId = $teamId;
    }

    public function render()
    {
        $activities = Activity::where('team_id', $this->teamId)
            ->latest()
            ->take(20)
            ->get();

        return view('livewire.activity-feed', compact('activities'));
    }
};
?>

<div>
    {{-- Smile, breathe, and go slowly. - Thich Nhat Hanh --}}
</div>