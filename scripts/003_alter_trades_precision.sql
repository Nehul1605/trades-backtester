-- Prices and P&L need higher precision for forex/metals
alter table public.trades
  alter column entry_price type numeric(18, 5) using entry_price::numeric,
  alter column exit_price type numeric(18, 5) using exit_price::numeric,
  alter column quantity type numeric(18, 4) using quantity::numeric,
  alter column pnl type numeric(18, 5) using pnl::numeric,
  alter column pnl_percentage type numeric(12, 8) using pnl_percentage::numeric;

-- Only date (no time) for entry/exit
alter table public.trades
  alter column entry_date type date using entry_date::date,
  alter column exit_date type date using exit_date::date;
