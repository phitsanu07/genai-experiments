#!/bin/bash

# Supabase configuration
PROJECT_URL="https://vilhsbdpcnwkhfubuwwj.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbGhzYmRwY253a2hmdWJ1d3dqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU2OTE5MywiZXhwIjoyMDgwMTQ1MTkzfQ.EunAJua3JZCwhYZkH_SabY4acoHa0YBpl9SHyF6Wvpg"

# SQL query
SQL_QUERY='create table public.members (
  id uuid primary key default uuid_generate_v4(),
  member_code text unique,
  full_name text,
  first_name text,
  last_name text,
  gender text,
  birth_date date,

  email text unique,
  phone text,
  line_user_id text,
  facebook_id text,
  google_id text,

  point_balance integer default 0,
  tier text default "silver",
  tier_expire_date date,
  member_since date default now(),
  status text default "active",

  address text,
  province text,
  district text,
  subdistrict text,
  zipcode text,

  last_purchase_date date,
  total_spending numeric(12,2) default 0,
  preferred_store text,
  preferred_category text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_members_member_code on public.members(member_code);
create index idx_members_email on public.members(email);
create index idx_members_status on public.members(status);
create index idx_members_tier on public.members(tier);'

echo "🚀 Executing members table creation on Supabase..."

curl -X POST \
  "${PROJECT_URL}/rest/v1/rpc/exec_sql" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$(echo "$SQL_QUERY" | sed 's/"/\\"/g')\"}"

echo ""
echo "✅ Done!"
