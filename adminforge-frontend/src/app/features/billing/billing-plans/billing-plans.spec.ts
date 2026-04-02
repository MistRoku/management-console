import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingPlans } from './billing-plans';

describe('BillingPlans', () => {
  let component: BillingPlans;
  let fixture: ComponentFixture<BillingPlans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingPlans],
    }).compileComponents();

    fixture = TestBed.createComponent(BillingPlans);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
