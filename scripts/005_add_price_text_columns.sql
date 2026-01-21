-- Preserve exact user-entered decimal strings for prices
alter table if exists trades
add column if not exists entry_price_text text,
add column if not exists exit_price_text text;
