-- MoneyFlow Pro Supabase Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  phone text,
  country text default 'US',
  currency text default 'USD',
  language text default 'en',
  theme text default 'dark',
  avatar_url text,
  is_admin boolean default false,
  notification_email boolean default true,
  notification_push boolean default true
);

-- PLANS
create table public.plans (
  id text primary key, -- 'FREE', 'PREMIUM_MONTHLY', 'PREMIUM_YEARLY'
  name text not null,
  price_cents integer not null,
  currency text not null default 'USD',
  billing_interval text not null, -- 'month', 'year', 'none'
  business_limit integer not null default 3,
  features text[]
);

-- INSERT DEFAULT PLANS
insert into public.plans (id, name, price_cents, currency, billing_interval, business_limit, features) values
('FREE', 'Free tier', 0, 'USD', 'none', 3, ARRAY['Unlimited Personal Transactions', 'Basic Dashboard', 'Daily/Weekly/Monthly Reports', 'Savings Goals', 'Basic Analytics']),
('PREMIUM_MONTHLY', 'Premium Monthly', 999, 'USD', 'month', -1, ARRAY['Unlimited Businesses', 'Advanced Analytics', 'AI Financial Insights', 'Business Comparison Dashboard', 'Custom Categories', 'Advanced Reports', 'Export PDF/Excel/CSV', 'Invoice Generator', 'Multiple Currency Support', 'Priority Support']),
('PREMIUM_YEARLY', 'Premium Yearly', 9990, 'USD', 'year', -1, ARRAY['Unlimited Businesses', 'Advanced Analytics', 'AI Financial Insights', 'Business Comparison Dashboard', 'Custom Categories', 'Advanced Reports', 'Export PDF/Excel/CSV', 'Invoice Generator', 'Multiple Currency Support', 'Priority Support', '2 Months Free']);

-- SUBSCRIPTIONS
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan_id text references public.plans(id) not null default 'FREE',
  status text not null default 'active', -- 'active', 'trialing', 'past_due', 'canceled', 'unpaid'
  current_period_start timestamp with time zone default timezone('utc'::text, now()) not null,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- COUPONS
create table public.coupon_codes (
  code text primary key,
  discount_percent integer, -- percent off (e.g. 20)
  discount_flat_cents integer, -- flat cash off (e.g. 500 = $5.00)
  expiry_date timestamp with time zone,
  max_uses integer,
  uses_count integer default 0,
  min_purchase_cents integer default 0,
  is_referral boolean default false
);

-- BUSINESSES
create table public.businesses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  logo_url text,
  category text,
  description text,
  address text,
  phone text,
  email text,
  currency text default 'USD',
  timezone text default 'UTC',
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CATEGORIES
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade, -- null means global system category
  name text not null,
  type text not null, -- 'income' or 'expense'
  color text default '#6366f1',
  icon text default 'Tag',
  is_custom boolean default false
);

-- TRANSACTIONS (Unified Personal & Business)
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  business_id uuid references public.businesses(id) on delete cascade, -- null means personal transaction
  type text not null, -- 'income' or 'expense'
  category_id uuid references public.categories(id),
  category_name text not null, -- Fallback / visual category string
  amount_cents bigint not null,
  currency text default 'USD',
  description text,
  transaction_date timestamp with time zone default timezone('utc'::text, now()) not null,
  receipt_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SAVINGS GOALS
create table public.savings_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  target_amount_cents bigint not null,
  current_amount_cents bigint default 0 not null,
  deadline timestamp with time zone,
  status text default 'in_progress', -- 'in_progress', 'achieved', 'paused'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- BILLING HISTORY & INVOICES
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  amount_cents integer not null,
  currency text default 'USD',
  provider text not null, -- 'stripe', 'razorpay'
  provider_payment_id text,
  provider_order_id text,
  status text not null, -- 'succeeded', 'failed', 'refunded'
  coupon_applied text references public.coupon_codes(code),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.invoices (
  id uuid default uuid_generate_v4() primary key,
  payment_id uuid references public.payments(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  invoice_number text unique not null,
  pdf_url text,
  issued_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- NOTIFICATIONS
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text default 'general', -- 'info', 'payment', 'goal', 'alert'
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AUDIT LOGS
create table public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES & SECURITY
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.businesses enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.savings_goals enable row level security;
alter table public.payments enable row level security;
alter table public.invoices enable row level security;
alter table public.notifications enable row level security;

-- Simple Select/Update Policies
create policy "Users can read own profiles" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profiles" on public.profiles for update using (auth.uid() = id);

create policy "Users can manage own subscriptions" on public.subscriptions for all using (auth.uid() = user_id);

create policy "Users can manage own businesses" on public.businesses for all using (auth.uid() = user_id);

create policy "Users can manage own categories" on public.categories for all using (auth.uid() = user_id or user_id is null);

create policy "Users can manage own transactions" on public.transactions for all using (auth.uid() = user_id);

create policy "Users can manage own goals" on public.savings_goals for all using (auth.uid() = user_id);

create policy "Users can read own payments" on public.payments for select using (auth.uid() = user_id);

create policy "Users can read own invoices" on public.invoices for select using (auth.uid() = user_id);

create policy "Users can manage own notifications" on public.notifications for all using (auth.uid() = user_id);

-- TRIGGERS & FUNCTIONS
-- Auto profile creation on auth.users insert
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');

  -- Create default free subscription
  insert into public.subscriptions (user_id, plan_id, status)
  values (new.id, 'FREE', 'active');
  
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes for performance optimization
create index idx_transactions_user_id on public.transactions(user_id);
create index idx_transactions_business_id on public.transactions(business_id);
create index idx_businesses_user_id on public.businesses(user_id);
create index idx_subscriptions_user_id on public.subscriptions(user_id);
