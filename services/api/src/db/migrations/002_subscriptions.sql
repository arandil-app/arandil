-- 002_subscriptions.sql — RevenueCat integration

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- RevenueCat data
  revenuecat_id VARCHAR(255) NOT NULL UNIQUE,
  product_id VARCHAR(255) NOT NULL,
  store VARCHAR(50) NOT NULL, -- 'app_store', 'play_store'

  -- Subscription status
  status VARCHAR(50) NOT NULL, -- 'active', 'cancelled', 'expired', 'trial'
  tier VARCHAR(50) NOT NULL DEFAULT 'free', -- 'free', 'premium'

  -- Dates
  expires_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);

-- Subscription events (webhook history)
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Event data
  event_type VARCHAR(100) NOT NULL, -- 'INITIAL_PURCHASE', 'RENEWAL', 'CANCELLATION', etc.
  raw_payload JSONB NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscription_events_subscription_id ON subscription_events(subscription_id);
CREATE INDEX idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX idx_subscription_events_event_type ON subscription_events(event_type);
