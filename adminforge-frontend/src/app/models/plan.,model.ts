export interface Plan {
  id: number;
  name: string;
  stripe_price: string;
  price: number;
  max_users: number;
  features: string[];
}
