import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TeamsService, Plan } from '../../../core/services/teams.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-billing-plans',
  template: `
    <div *ngIf="loading">Loading...</div>

    <form [formGroup]="billingForm" (ngSubmit)="subscribe()">
      <div *ngFor="let plan of plans">
        <label>
          <input type="radio" formControlName="planId" [value]="plan.id" />
          {{ plan.name }} - {{ plan.price | currency }}
        </label>
      </div>

      <div>
        <input formControlName="couponCode" placeholder="Coupon code" />
      </div>

      <button type="submit" [disabled]="loading || billingForm.invalid">Subscribe</button>
    </form>
  `
})
export class BillingPlansComponent implements OnInit {
  plans: Plan[] = [];
  billingForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private teamsService: TeamsService
  ) {
    this.billingForm = this.fb.group({
      planId: ['', Validators.required],
      couponCode: ['']
    });
  }

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading = true;
    this.teamsService.getPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading plans:', error);
        this.loading = false;
      }
    });
  }

  subscribe(): void {
    if (this.billingForm.valid) {
      this.loading = true;
      this.teamsService.subscribeToPlan(this.billingForm.value).subscribe({
        next: (sessionUrl) => {
          window.location.href = sessionUrl; // Stripe Checkout
        },
        error: (error) => {
          console.error('Subscription error:', error);
          this.loading = false;
        }
      });
    }
  }
}
