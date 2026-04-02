export interface Team {
  id: number;
  name: string;
  slug: string;
  stripe_id?: string;
  stripe_status?: string;
  trial_ends_at?: string;
  users_count?: number;
  subscription_count?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  teams: Team[];
  role?: 'owner' | 'admin' | 'member';
}

