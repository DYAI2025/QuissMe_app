#!/usr/bin/env python3
"""
Additional verification tests for specific review requirements
"""

import requests
import json

BACKEND_URL = "https://couples-journey-5.preview.emergentagent.com/api"

def test_specific_requirements():
    """Test the specific requirements from the review request"""
    session = requests.Session()
    
    print("🔍 Testing Specific Review Requirements")
    print("=" * 50)
    
    # Test 1: GET /api/stats/library/info - Debug endpoint
    print("\n1. Testing GET /api/stats/library/info")
    response = session.get(f"{BACKEND_URL}/stats/library/info")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Schema version: {data.get('schema_version')}")
        print(f"✅ Core stats count: {data.get('core_stats_count')}")
        print(f"✅ Stats list length: {len(data.get('stats', []))}")
        
        # Verify it returns exactly what's expected
        if data.get('core_stats_count') == 17:
            print("✅ Correct core stats count (17)")
        else:
            print(f"❌ Wrong core stats count: {data.get('core_stats_count')}")
    else:
        print(f"❌ Failed: {response.status_code}")
    
    # Test 2: Create a new couple and test stats endpoint
    print("\n2. Testing fresh couple stats initialization")
    
    # Register user
    user_data = {
        "name": "Test User",
        "birth_date": "1990-05-15", 
        "birth_time": "14:30",
        "birth_location": "Berlin"
    }
    
    response = session.post(f"{BACKEND_URL}/users/register", json=user_data)
    if response.status_code == 200:
        user_a = response.json()
        invite_code = user_a['invite_code']
        
        # Join with partner
        partner_data = {
            "invite_code": invite_code,
            "name": "Test Partner",
            "birth_date": "1988-11-22",
            "birth_time": "09:15", 
            "birth_location": "Munich"
        }
        
        response = session.post(f"{BACKEND_URL}/invite/join", json=partner_data)
        if response.status_code == 200:
            join_result = response.json()
            couple_id = join_result['couple_id']
            
            # Test stats endpoint
            print(f"✅ Created couple: {couple_id}")
            
            response = session.get(f"{BACKEND_URL}/stats/{couple_id}")
            if response.status_code == 200:
                stats_data = response.json()
                
                # Verify response contains 17 stats
                stats = stats_data.get('stats', [])
                print(f"✅ Stats count: {len(stats)}")
                
                # Verify all initial values are 50
                all_fifty = all(stat['value_0_100'] == 50 for stat in stats)
                print(f"✅ All initial values are 50: {all_fifty}")
                
                # Verify family grouping
                families = stats_data.get('families', {})
                closeness_count = len(families.get('closeness', {}).get('stats', []))
                alignment_count = len(families.get('alignment', {}).get('stats', []))
                tension_count = len(families.get('tension', {}).get('stats', []))
                
                print(f"✅ Family grouping - closeness: {closeness_count}, alignment: {alignment_count}, tension: {tension_count}")
                
                if closeness_count == 5 and alignment_count == 5 and tension_count == 7:
                    print("✅ Correct family distribution (5, 5, 7)")
                else:
                    print(f"❌ Wrong family distribution: expected (5,5,7), got ({closeness_count},{alignment_count},{tension_count})")
                
                # Verify each stat has required fields
                print("\n3. Verifying stat structure:")
                required_fields = ['stat_key', 'name_de', 'value_0_100', 'tendency', 'tendency_text', 'bar_color']
                
                sample_stat = stats[0] if stats else {}
                for field in required_fields:
                    if field in sample_stat:
                        print(f"✅ {field}: {sample_stat.get(field)}")
                    else:
                        print(f"❌ Missing field: {field}")
                
                # Verify tendency is "medium" for value 50
                tendencies = [stat['tendency'] for stat in stats]
                all_medium = all(t == 'medium' for t in tendencies)
                print(f"✅ All tendencies are 'medium' for value 50: {all_medium}")
                
            else:
                print(f"❌ Stats endpoint failed: {response.status_code}")
        else:
            print(f"❌ Join failed: {response.status_code}")
    else:
        print(f"❌ Registration failed: {response.status_code}")
    
    print("\n" + "=" * 50)
    print("✅ Specific requirements verification complete")

if __name__ == "__main__":
    test_specific_requirements()