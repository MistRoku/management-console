// =============================================================================
// AdminForge SaaS - Team List Component
// Angular 17 + Material Design + RxJS + Laravel API Integration
// Units Covered: 3 (Components), 5 (RxJS), 7 (HTTP), 9 (Guards), 12 (Testing)
// =============================================================================

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  takeUntil
} from 'rxjs/operators';
import {
  Subject,
  Observable,
  of,
  EMPTY,
  BehaviorSubject
} from 'rxjs';
import { TeamsService, Team } from 'src/app/core/services/teams.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';

export interface TeamStats {
  users_count: number;
  subscription_count: number;
  trial_days_left: number;
}

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush  // Unit 14: Performance
})
export class TeamListComponent implements OnInit, OnDestroy {
  // Public properties for template
  teams$ = new BehaviorSubject<Team[]>([]);
  filteredTeams$ = new BehaviorSubject<Team[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  searchControl = new FormControl('');
  currentTeamId$ = new BehaviorSubject<number | null>(null);

  // Private subjects
  private destroy$ = new Subject<void>();
  private statsCache = new Map<number, TeamStats>();

  constructor(
    private teamsService: TeamsService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeSearch();
    this.loadTeams();
    this.watchCurrentTeam();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =============================================================================
  // CORE FUNCTIONALITY
  // =============================================================================

  private initializeSearch(): void {
    // Unit 5: RxJS debounce + distinctUntilChanged
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.filterTeams(searchTerm || '');
    });
  }

  private loadTeams(): void {
    this.loading$.next(true);

    this.teamsService.getTeams().pipe(
      catchError(error => {
        this.handleError('Failed to load teams', error);
        return of([]);
      }),
      takeUntil(this.destroy$)
    ).subscribe(teams => {
      this.teams$.next(teams);
      this.filteredTeams$.next(teams);
      this.loading$.next(false);
      this.cdr.markForCheck();
    });
  }

  createTeam(): void {
    const teamName = prompt('Enter team name:');
    if (!teamName?.trim()) return;

    this.teamsService.createTeam(teamName.trim()).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (newTeam) => {
        // Optimistic update
        const currentTeams = this.teams$.value;
        this.teams$.next([newTeam, ...currentTeams]);
        this.filteredTeams$.next([newTeam, ...this.filteredTeams$.value]);

        this.snackBar.open(
          `Team "${newTeam.name}" created successfully!`,
          'Dismiss',
          { duration: 3000 }
        );

        // Navigate to new team
        setTimeout(() => this.router.navigate(['/teams', newTeam.id]), 500);
      },
      error: (error) => this.handleError('Failed to create team', error)
    });
  }

  private filterTeams(searchTerm: string): void {
    const teams = this.teams$.value;
    const filtered = teams.filter(team =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
    this.filteredTeams$.next(filtered);
  }

  switchTeam(teamId: number): void {
    this.currentTeamId$.next(teamId);
    this.teamsService.switchTeam(teamId).subscribe({
      next: () => {
        this.snackBar.open('Switched to team', 'OK', { duration: 2000 });
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.snackBar.open('Failed to switch team', 'Retry', { duration: 3000 });
        this.currentTeamId$.next(null);
      }
    });
  }

  deleteTeam(teamId: number): void {
    if (!confirm('Are you sure you want to delete this team? This cannot be undone.')) {
      return;
    }

    this.teamsService.deleteTeam(teamId).subscribe({
      next: () => {
        const currentTeams = this.teams$.value;
        const filteredTeams = this.filteredTeams$.value;

        this.teams$.next(currentTeams.filter(t => t.id !== teamId));
        this.filteredTeams$.next(filteredTeams.filter(t => t.id !== teamId));

        this.snackBar.open('Team deleted successfully', 'OK', { duration: 3000 });
      },
      error: (error) => this.handleError('Failed to delete team', error)
    });
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  getTeamStats(teamId: number): TeamStats | null {
    return this.statsCache.get(teamId) || null;
  }

  isTrialActive(team: Team): boolean {
    if (!team.trial_ends_at) return false;
    const trialEnd = new Date(team.trial_ends_at);
    return trialEnd > new Date();
  }

  getTrialDaysLeft(team: Team): number {
    if (!team.trial_ends_at) return 0;
    const trialEnd = new Date(team.trial_ends_at);
    const diffTime = trialEnd.getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  trackByTeamId(index: number, team: Team): number {
    return team.id;  // Unit 14: trackBy performance
  }

  private watchCurrentTeam(): void {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (user?.current_team_id) {
        this.currentTeamId$.next(user.current_team_id);
      }
    });
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.snackBar.open(`${message}: ${error.message || 'Unknown error'}`, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
    this.loading$.next(false);
  }
}
