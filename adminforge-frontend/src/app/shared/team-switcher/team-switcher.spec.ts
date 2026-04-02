import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamSwitcher } from './team-switcher';

describe('TeamSwitcher', () => {
  let component: TeamSwitcher;
  let fixture: ComponentFixture<TeamSwitcher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamSwitcher],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamSwitcher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
