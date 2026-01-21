-- Create trades table for storing trade data
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  entry_price numeric(12, 2) not null,
  exit_price numeric(12, 2),
  quantity numeric(12, 4) not null,
  trade_type text not null check (trade_type in ('long', 'short')),
  entry_date timestamptz not null,
  exit_date timestamptz,
  status text not null default 'open' check (status in ('open', 'closed')),
  strategy_name text,
  notes text,
  screenshot_url text,
  pnl numeric(12, 2),
  pnl_percentage numeric(8, 4),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.trades enable row level security;

-- RLS Policies for trades table
create policy "Users can view their own trades"
  on public.trades for select
  using (auth.uid() = user_id);

create policy "Users can insert their own trades"
  on public.trades for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own trades"
  on public.trades for update
  using (auth.uid() = user_id);

create policy "Users can delete their own trades"
  on public.trades for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists trades_user_id_idx on public.trades(user_id);
create index if not exists trades_entry_date_idx on public.trades(entry_date desc);
create index if not exists trades_status_idx on public.trades(status);

-- Function to automatically update the updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to update updated_at on trades
create trigger update_trades_updated_at
  before update on public.trades
  for each row
  execute function public.update_updated_at_column();
