"""
Debug script to check if activities data exists in Supabase
"""
import os
from supabase import create_client, Client

# Read Supabase credentials from env or hardcode for testing
SUPABASE_URL = "https://ynbsowqjrblzyibmqmul.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluYnNvd3FqcmJsenlpYm1xbXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0MzA1OTksImV4cCI6MjA0NjAwNjU5OX0.IKm5fJ8yjXrVjA07Nc4LGX_R5VcgUcV9-dRgO5RJAB0"

def main():
    print("=" * 60)
    print("🔍 DEBUG: Checking activities in Supabase")
    print("=" * 60)
    
    # Create Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    print("\n1️⃣ Querying activities table...")
    try:
        response = supabase.table('activities') \
            .select('id, code, name, description, is_active') \
            .eq('is_active', True) \
            .order('code') \
            .execute()
        
        print(f"✅ Query successful!")
        print(f"📊 Total records: {len(response.data)}")
        
        if response.data:
            print("\n📋 Activities found:")
            for idx, activity in enumerate(response.data, 1):
                print(f"   {idx}. [{activity['code']}] {activity['name']}")
                print(f"      ID: {activity['id']}")
                print(f"      Active: {activity.get('is_active', 'N/A')}")
        else:
            print("⚠️ No activities found with is_active=true")
            
            # Try without filter
            print("\n2️⃣ Trying query without is_active filter...")
            response_all = supabase.table('activities') \
                .select('id, code, name, is_active') \
                .execute()
            
            print(f"📊 Total records (all): {len(response_all.data)}")
            if response_all.data:
                print("\n📋 All activities:")
                for idx, activity in enumerate(response_all.data, 1):
                    active_status = "✅" if activity.get('is_active') else "❌"
                    print(f"   {idx}. {active_status} [{activity.get('code', 'NO CODE')}] {activity['name']}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"   Type: {type(e)}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
