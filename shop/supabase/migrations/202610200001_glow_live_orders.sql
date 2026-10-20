-- Apply only when provisioning the approved production order store.
-- Separate from sandbox data. There is deliberately no customer/browser access.
create table public.glow_live_orders (
  stripe_session_id text primary key check (stripe_session_id like 'cs_live_%'),
  stripe_event_id text not null,
  created_at timestamptz not null default now(),
  livemode boolean not null default true check (livemode = true),
  amount_total integer not null check (amount_total > 0),
  currency text not null check (currency = 'chf'),
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  customer_email text not null,
  shipping_name text not null,
  shipping_address jsonb not null,
  fulfillment_status text not null default 'paid'
    check (fulfillment_status in ('paid', 'packing', 'shipped', 'returned', 'cancelled')),
  shipped_at timestamptz,
  tracking_number text,
  operator_note text
);
alter table public.glow_live_orders enable row level security;
revoke all on public.glow_live_orders from anon, authenticated;
grant select, insert, update on public.glow_live_orders to service_role;
create index glow_live_orders_fulfillment_idx
  on public.glow_live_orders (fulfillment_status, created_at);
comment on table public.glow_live_orders is
  'Paid GLOW live orders. Fulfillment status is operational only; process refunds in Stripe and verify them there.';
