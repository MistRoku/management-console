import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse
} from '@angular/common/http';
import {
  Observable,
  throwError,
  BehaviorSubject,
  EMPTY,
  of,
  combineLatest
} from 'rxjs';
import {
  catchError,
  map,
  tap,
  shareReplay,
  switchMap
} from 'rxjs/operators';
import { AuthService } from './auth.service';

// =============================================================================
// MODELS (Unit 2: TypeScript Interfaces)
// =============================================================================
export interface Team {
  id: number;
  name: string;
  slug: string;
  stripe_id?: string;
  stripe_status?: 'active' | 'past_due' | 'canceled' | 'incomplete';
  trial_ends_at?: string;
  users_count?: number;
  subscription_count?: number;
  owner_id?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTeamRequest {
  name: string;
}

export interface TeamStats {
  users_count: number;
  subscription_count: number;
  trial_days_left: number;
  total_revenue: number;
}

export interface Plan {
  id: number;
  name: string;
  stripe_price: string;
  price: number;
  max_users: number;
  features: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api'; // Laravel Backend
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  // Cache for performance (Unit 14)
  private teamsCache = new Map<number, Team>();
  private teamsSubject = new BehaviorSubject<Team[]>([]);
  public teams$ = this.teamsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // =============================================================================
  // TEAM OPERATIONS
  // =============================================================================

  /**
   * Get all teams for authenticated user
   * Unit 7: HTTP Client + RxJS caching
   */
  getTeams(): Observable<Team[]> {
    return this.authService.currentUser$.pipe(
      switchMap(user => {
        if (!user) return EMPTY;

        // Return cached teams if available
        if (this.teamsSubject.value.length > 0) {
          return of(this.teamsSubject.value);
        }

        return this.http.get<Team[]>(`${this.apiUrl}/teams`, this.getAuthHeaders()).pipe(
          tap(teams => {
            this.teamsSubject.next(teams);
            this.cacheTeams(teams);
          }),
          shareReplay(1), // Unit 5: Prevent duplicate HTTP calls
          catchError(this.handleError<Team[]>('getTeams'))
        );
      })
    );
  }

  /**
   * Create new team
   */
  createTeam(teamData: CreateTeamRequest): Observable<Team> {
    return this.http.post<Team>(`${this.apiUrl}/teams`, teamData, this.getAuthHeaders()).pipe(
      tap(newTeam => {
        // Update cache optimistically
        const currentTeams = this.teamsSubject.value;
        this.teamsSubject.next([newTeam, ...currentTeams]);
        this.cacheTeams([newTeam]);
      }),
      catchError(this.handleError<Team>('createTeam'))
    );
  }

  /**
   * Switch current team context
   */
  switchTeam(teamId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/teams/${teamId}/switch`, {}, this.getAuthHeaders()).pipe(
      catchError(this.handleError('switchTeam'))
    );
  }

  /**
   * Delete team (only if not owner of only team)
   */
  deleteTeam(teamId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/teams/${teamId}`, this.getAuthHeaders()).pipe(
      tap(() => {
        // Remove from cache
        const currentTeams = this.teamsSubject.value;
        this.teamsSubject.next(currentTeams.filter(team => team.id !== teamId));
        this.teamsCache.delete(teamId);
      }),
      catchError(this.handleError('deleteTeam'))
    );
  }

  /**
   * Get team stats (memoized)
   */
  getTeamStats(teamId: number): Observable<TeamStats> {
    return this.http.get<TeamStats>(`${this.apiUrl}/teams/${teamId}/stats`, this.getAuthHeaders()).pipe(
      shareReplay(1),
      catchError(this.handleError<TeamStats>('getTeamStats'))
    );
  }

  // =============================================================================
  // BILLING OPERATIONS
  // =============================================================================

  /**
   * Get available billing plans
   */
  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.apiUrl}/plans`, this.getAuthHeaders()).pipe(
      catchError(this.handleError<Plan[]>('getPlans'))
    );
  }

  /**
   * Subscribe to plan via Stripe Checkout
   */
  subscribeToPlan(planData: { planId: number; couponCode?: string }): Observable<string> {
    return this.http.post<{ url: string }>(`${this.apiUrl}/subscribe`, planData, this.getAuthHeaders()).pipe(
      map(response => response.url),
      catchError(this.handleError<string>('subscribeToPlan'))
    );
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get team by ID from cache or API
   */
  getTeamById(teamId: number): Observable<Team | null> {
    const cached = this.teamsCache.get(teamId);
    if (cached) {
      return of(cached);
    }

    return this.http.get<Team>(`${this.apiUrl}/teams/${teamId}`, this.getAuthHeaders()).pipe(
      tap(team => this.cacheTeam(team)),
      catchError(this.handleError<Team>('getTeamById'))
    );
  }

  /**
   * Check if user owns team
   */
  isTeamOwner(teamId: number): Observable<boolean> {
    return combineLatest([this.getTeamById(teamId), this.authService.currentUser$]).pipe(
      map(([team, user]) => {
        if (!team || !user) {
          return false;
        }
        return team.owner_id === user.id;
      })
    );
  }

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.authService.getToken();
    if (token) {
      return {
        headers: this.httpOptions.headers.set('Authorization', `Bearer ${token}`)
      };
    }
    return this.httpOptions;
  }

  private cacheTeams(teams: Team[]): void {
    teams.forEach(team => this.teamsCache.set(team.id, team));
  }

  private cacheTeam(team: Team): void {
    this.teamsCache.set(team.id, team);
  }

  // =============================================================================
  // ERROR HANDLING (Unit 7)
  // =============================================================================

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);

      // Client-side error
      if (error.error instanceof ErrorEvent) {
        console.error('Client error:', error.error.message);
      } else {
        // Server-side error
        console.error(`Server error: ${error.status}, ${error.message}`);
      }

      // Let the app keep running by returning a safe result
      return of(result as T);
    };
  }

  // =============================================================================
  // CLEAR CACHE (for testing/admin)
  // =============================================================================

  clearCache(): void {
    this.teamsCache.clear();
    this.teamsSubject.next([]);
  }
}
