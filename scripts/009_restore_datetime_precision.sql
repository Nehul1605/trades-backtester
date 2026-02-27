-- Restore timestamp precision to store trade time, not just date
ALTER TABLE public.trades
  ALTER COLUMN entry_date TYPE timestamptz USING entry_date::timestamptz,
  ALTER COLUMN exit_date TYPE timestamptz USING exit_date::timestamptz;
