import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TeamsService, Plan } from '../../../core/services/teams/teams.service';

@Component({
  selector: 'app-billing-plans',
  templateUrl: './billing-plans.component.html',
  styleUrls: ['./billing-plans.component.scss']
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
