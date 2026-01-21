alter table trades
  add column if not exists stop_loss numeric(18,8),
  add column if not exists take_profit numeric(18,8);
