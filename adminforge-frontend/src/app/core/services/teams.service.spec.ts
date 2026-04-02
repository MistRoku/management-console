import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TeamsService, Team } from './teams.service.ts';

describe('TeamsService', () => {
  let service: TeamsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeamsService]
    });
    service = TestBed.inject(TeamsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch teams successfully', () => {
    const mockTeams: Team[] = [
      { id: 1, name: 'Acme Corp', slug: 'acme-corp' }
    ];

    service.getTeams().subscribe((teams: Team[]) => {
      expect(teams.length).toBe(1);
      expect(teams[0].name).toBe('Acme Corp');
    });

    const req = httpMock.expectOne('http://127.0.0.1:8000/api/teams');
    expect(req.request.method).toBe('GET');
    req.flush(mockTeams);
  });

  it('should handle teams fetch error', () => {
    service.getTeams().subscribe({
      next: () => {
        throw new Error('Expected error');
      },
      error: (error: any) => expect(error).toBeTruthy()
    });

    const req = httpMock.expectOne('http://127.0.0.1:8000/api/teams');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });
});
