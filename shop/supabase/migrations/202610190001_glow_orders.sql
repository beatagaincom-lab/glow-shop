-- Sandbox foundation only. No browser or anonymous access to customer data.
create table public.glow_orders (
  stripe_session_id text primary key check (stripe_session_id like 'cs_test_%'),
  stripe_event_id text not null,
  created_at timestamptz not null default now(),
  livemode boolean not null default false check (livemode = false),
  amount_total integer not null check (amount_total > 0),
  currency text not null check (currency = 'chf'),
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  customer_email text not null,
  shipping_name text not null,
  shipping_address jsonb not null,
  fulfillment_status text not null default 'test_only' check (fulfillment_status = 'test_only')
);
alter table public.glow_orders enable row level security;
revoke all on public.glow_orders from anon, authenticated;
grant select, insert on public.glow_orders to service_role;
comment on table public.glow_orders is 'GLOW sandbox orders. Test records must never trigger shipment.';
