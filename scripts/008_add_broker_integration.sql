-- Migration to add broker account storage and link trades to brokers
CREATE TABLE IF NOT EXISTS broker_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    broker_type TEXT NOT NULL, -- 'exness' or 'mt5'
    account_id TEXT NOT NULL,
    server TEXT NOT NULL,
    password TEXT NOT NULL, -- In a production app, this should be encrypted
    status TEXT DEFAULT 'pending', -- 'pending', 'connected', 'failed'
    balance DECIMAL(20, 2) DEFAULT 0,
    equity DECIMAL(20, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add source column to trades to distinguish between manual and synced trades
ALTER TABLE trades ADD COLUMN IF NOT EXISTS broker_account_id UUID REFERENCES broker_accounts(id) ON DELETE SET NULL;
ALTER TABLE trades ADD COLUMN IF NOT EXISTS external_id TEXT; -- Unique ID from the broker (Order Ticket #)
