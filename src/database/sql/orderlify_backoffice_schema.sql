-- Orderlify SaaS Backoffice schema (PostgreSQL)
-- Multi-tenant by tenant_id on domain entities.

CREATE TYPE tenant_status AS ENUM ('active', 'trial', 'suspended', 'cancelled');
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'past_due', 'canceled');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE ticket_status AS ENUM ('open', 'pending', 'solved', 'closed');
CREATE TYPE admin_role AS ENUM ('admin', 'support', 'finance');

CREATE TABLE tenants (
  id BIGSERIAL PRIMARY KEY,
  business_name VARCHAR(180) NOT NULL,
  subdomain VARCHAR(80) NOT NULL UNIQUE,
  region VARCHAR(20) NOT NULL DEFAULT 'US',
  status tenant_status NOT NULL DEFAULT 'trial',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admin_users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(180) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role admin_role NOT NULL,
  is_2fa_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE plans (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(40) UNIQUE NOT NULL,
  monthly_price NUMERIC(12,2) NOT NULL,
  yearly_price NUMERIC(12,2) NOT NULL,
  users_limit INT NOT NULL,
  orders_limit INT NOT NULL,
  storage_limit_gb INT NOT NULL
);

CREATE TABLE subscriptions (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id),
  plan_id BIGINT NOT NULL REFERENCES plans(id),
  status subscription_status NOT NULL,
  billing_cycle VARCHAR(10) NOT NULL CHECK (billing_cycle IN ('monthly','yearly')),
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE invoices (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id),
  subscription_id BIGINT NOT NULL REFERENCES subscriptions(id),
  invoice_number VARCHAR(60) UNIQUE NOT NULL,
  amount_due NUMERIC(12,2) NOT NULL,
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status VARCHAR(20) NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  invoice_id BIGINT NOT NULL REFERENCES invoices(id),
  tenant_id BIGINT NOT NULL REFERENCES tenants(id),
  provider VARCHAR(40) NOT NULL,
  provider_payment_id VARCHAR(120),
  amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  retry_count INT NOT NULL DEFAULT 0,
  failed_reason TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE coupons (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(40) UNIQUE NOT NULL,
  discount_percent NUMERIC(5,2) CHECK (discount_percent BETWEEN 0 AND 100),
  discount_amount NUMERIC(12,2),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  max_redemptions INT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE support_tickets (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenants(id),
  assignee_admin_id BIGINT REFERENCES admin_users(id),
  customer_email VARCHAR(180) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority ticket_priority NOT NULL DEFAULT 'medium',
  status ticket_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ticket_messages (
  id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_type VARCHAR(20) NOT NULL CHECK (author_type IN ('customer','admin','system')),
  author_id BIGINT,
  message TEXT NOT NULL,
  is_internal_note BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE feature_flags (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(120) UNIQUE NOT NULL,
  description TEXT,
  enabled_globally BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE feature_flag_targets (
  id BIGSERIAL PRIMARY KEY,
  feature_flag_id BIGINT NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  tenant_id BIGINT REFERENCES tenants(id),
  plan_id BIGINT REFERENCES plans(id),
  enabled BOOLEAN NOT NULL,
  UNIQUE(feature_flag_id, tenant_id, plan_id)
);

CREATE TABLE system_logs (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenants(id),
  level VARCHAR(16) NOT NULL,
  source VARCHAR(80) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE webhook_logs (
  id BIGSERIAL PRIMARY KEY,
  provider VARCHAR(40) NOT NULL,
  event_type VARCHAR(120) NOT NULL,
  payload JSONB NOT NULL,
  status_code INT,
  processing_time_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_user_id BIGINT REFERENCES admin_users(id),
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(80) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE automation_rules (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(120) UNIQUE NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  trigger_type VARCHAR(50) NOT NULL,
  config JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_tenant_status ON subscriptions(tenant_id, status);
CREATE INDEX idx_invoices_tenant_due_date ON invoices(tenant_id, due_date DESC);
CREATE INDEX idx_payments_tenant_status ON payments(tenant_id, status);
CREATE INDEX idx_tickets_tenant_status ON support_tickets(tenant_id, status);
CREATE INDEX idx_system_logs_tenant_created_at ON system_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
