import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { User, Team } from '../../models/team.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api'; // Laravel Backend
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private mapAuthResponse(response: any): { token: string; user: User } {
    if (response.token && response.user) {
      return { token: response.token, user: response.user };
    }
    if (response.token) {
      const { token, ...userData } = response;
      return { token, user: userData as User };
    }
    throw new Error('Invalid auth response');
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      map(response => this.mapAuthResponse(response)),
      tap(({ token, user }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      map(({ user }) => user),
      catchError(this.handleError)
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
      }),
      catchError(this.handleError)
    );
  }

  private loadUserFromStorage(): void {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private handleError(error: any) {
    console.error('Auth error:', error);
    return throwError(() => error);
  }
}
