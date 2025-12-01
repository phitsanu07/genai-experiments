#!/usr/bin/env python3
"""
Script to create members table on Supabase
"""

import requests
import sys

# Supabase configuration
PROJECT_URL = "https://vilhsbdpcnwkhfubuwwj.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbGhzYmRwY253a2hmdWJ1d3dqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU2OTE5MywiZXhwIjoyMDgwMTQ1MTkzfQ.EunAJua3JZCwhYZkH_SabY4acoHa0YBpl9SHyF6Wvpg"

# Read SQL from migration file
with open("supabase/migrations/001_create_members_table.sql", "r") as f:
    sql_content = f.read()

# Create headers with authorization
headers = {
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}

# URL for executing SQL
url = f"{PROJECT_URL}/rest/v1/rpc/exec_sql"

# Alternative: Use the direct SQL endpoint
sql_url = f"{PROJECT_URL}/rest/v1/sql"

# Prepare the SQL query
queries = [q.strip() for q in sql_content.split(";") if q.strip()]

print(f"🚀 Creating members table on Supabase...")
print(f"📍 Project: {PROJECT_URL}")
print(f"📊 Total queries to execute: {len(queries)}")
print()

# Execute each query
for i, query in enumerate(queries, 1):
    print(f"[{i}/{len(queries)}] Executing: {query[:50]}...")

    try:
        # Try using the RPC endpoint if available, otherwise use raw SQL
        data = {"query": query}
        response = requests.post(
            url,
            headers=headers,
            json=data,
            timeout=10
        )

        if response.status_code in [200, 201]:
            print(f"✅ Query {i} executed successfully")
        else:
            print(f"❌ Query {i} failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Error executing query {i}: {str(e)}")
        sys.exit(1)

print()
print("✅ Table creation completed successfully!")
print("📋 Members table is now ready on Supabase")
