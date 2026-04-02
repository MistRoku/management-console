import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { TeamsService } from '../../../core/services/teams.service';

export interface DashboardStats {
  totalUsers: number;
  totalRevenue: number;
  trialDaysLeft: number;
  activeSubscriptions: number;
}

@Component({
  selector: 'app-dashboard-stats',
  templateUrl: './dashboard-stats.component.html',
  styleUrls: ['./dashboard-stats.component.scss']
})
export class DashboardStatsComponent implements OnInit {
  @Input() teamId!: number;
  stats$ = new BehaviorSubject<DashboardStats | null>(null);

  constructor(private teamsService: TeamsService) {}

  ngOnInit(): void {
    this.refreshStats();

    // Auto-refresh every 30 seconds (Unit 5: interval)
    interval(30000).subscribe(() => this.refreshStats());
  }

  refreshStats(): void {
    this.teamsService.getTeamStats(this.teamId).subscribe(stats => {
      this.stats$.next(stats);
    });
  }
}
