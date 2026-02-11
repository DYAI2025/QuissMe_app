#!/usr/bin/env python3
"""
QuissMe Stats Backend API Testing
Tests the stats endpoints and EWMA update functionality
"""

import requests
import json
import time
from typing import Dict, Any

# Backend URL from frontend/.env
BACKEND_URL = "https://couples-journey-5.preview.emergentagent.com/api"

class QuissmeStatsTest:
    def __init__(self):
        self.session = requests.Session()
        self.test_users = {}
        self.test_couple_id = None
        self.test_quiz_id = None
        self.test_cycle_id = None
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages with timestamp"""
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def test_connection(self) -> bool:
        """Test basic API connection"""
        try:
            response = self.session.get(f"{BACKEND_URL}/")
            if response.status_code == 200:
                data = response.json()
                self.log(f"✅ API Connection successful: {data}")
                return True
            else:
                self.log(f"❌ API Connection failed: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ API Connection error: {e}", "ERROR")
            return False
    
    def create_test_couple(self) -> bool:
        """Create a test couple for stats testing"""
        try:
            # Register first user
            user_a_data = {
                "name": "Emma Schmidt",
                "birth_date": "1990-05-15",
                "birth_time": "14:30",
                "birth_location": "Berlin"
            }
            
            response = self.session.post(f"{BACKEND_URL}/users/register", json=user_a_data)
            if response.status_code != 200:
                self.log(f"❌ Failed to register user A: {response.status_code} - {response.text}", "ERROR")
                return False
                
            user_a = response.json()
            self.test_users['user_a'] = user_a
            invite_code = user_a['invite_code']
            self.log(f"✅ User A registered: {user_a['name']} (ID: {user_a['id']})")
            
            # Join with second user
            user_b_data = {
                "invite_code": invite_code,
                "name": "Max Mueller",
                "birth_date": "1988-11-22",
                "birth_time": "09:15",
                "birth_location": "Munich"
            }
            
            response = self.session.post(f"{BACKEND_URL}/invite/join", json=user_b_data)
            if response.status_code != 200:
                self.log(f"❌ Failed to join invite: {response.status_code} - {response.text}", "ERROR")
                return False
                
            join_result = response.json()
            self.test_users['user_b'] = join_result['user']
            self.test_couple_id = join_result['couple_id']
            self.log(f"✅ User B joined: {join_result['user']['name']} (ID: {join_result['user']['id']})")
            self.log(f"✅ Couple created: {self.test_couple_id}")
            
            return True
            
        except Exception as e:
            self.log(f"❌ Error creating test couple: {e}", "ERROR")
            return False
    
    def test_stats_library_info(self) -> bool:
        """Test GET /api/stats/library/info endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/stats/library/info")
            if response.status_code != 200:
                self.log(f"❌ Stats library info failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
            data = response.json()
            
            # Verify expected fields
            required_fields = ['schema_version', 'core_stats_count', 'stats']
            for field in required_fields:
                if field not in data:
                    self.log(f"❌ Missing field in library info: {field}", "ERROR")
                    return False
            
            # Verify core stats count is 17
            if data['core_stats_count'] != 17:
                self.log(f"❌ Expected 17 core stats, got {data['core_stats_count']}", "ERROR")
                return False
                
            self.log(f"✅ Stats library info: {data['core_stats_count']} core stats, schema: {data['schema_version']}")
            return True
            
        except Exception as e:
            self.log(f"❌ Error testing stats library info: {e}", "ERROR")
            return False
    
    def test_stats_endpoint_initial(self) -> bool:
        """Test GET /api/stats/{couple_id} with initial values"""
        try:
            response = self.session.get(f"{BACKEND_URL}/stats/{self.test_couple_id}")
            if response.status_code != 200:
                self.log(f"❌ Stats endpoint failed: {response.status_code} - {response.text}", "ERROR")
                return False
                
            data = response.json()
            
            # Verify response structure
            required_fields = ['couple_id', 'stats', 'families', 'updated_at', 'meta']
            for field in required_fields:
                if field not in data:
                    self.log(f"❌ Missing field in stats response: {field}", "ERROR")
                    return False
            
            # Verify couple_id matches
            if data['couple_id'] != self.test_couple_id:
                self.log(f"❌ Couple ID mismatch: expected {self.test_couple_id}, got {data['couple_id']}", "ERROR")
                return False
            
            # Verify 17 stats returned
            stats = data['stats']
            if len(stats) != 17:
                self.log(f"❌ Expected 17 stats, got {len(stats)}", "ERROR")
                return False
            
            # Verify all initial values are 50
            for stat in stats:
                if stat['value_0_100'] != 50:
                    self.log(f"❌ Initial value not 50 for {stat['stat_key']}: {stat['value_0_100']}", "ERROR")
                    return False
                    
                # Verify stat structure
                required_stat_fields = ['stat_key', 'name_de', 'value_0_100', 'tendency', 'tendency_text', 'bar_color']
                for field in required_stat_fields:
                    if field not in stat:
                        self.log(f"❌ Missing field in stat {stat['stat_key']}: {field}", "ERROR")
                        return False
            
            # Verify family grouping
            families = data['families']
            expected_families = {
                'closeness': 5,  # tenderness, attunement, initiation, playfulness, appreciation
                'alignment': 5,  # rituals, teamwork, decision_flow, daily_design, balance
                'tension': 7     # repair_skill, boundaries, pace_harmony, soft_under_stress, growth_mode, spaciousness, fluidity
            }
            
            for family_key, expected_count in expected_families.items():
                if family_key not in families:
                    self.log(f"❌ Missing family: {family_key}", "ERROR")
                    return False
                    
                actual_count = len(families[family_key]['stats'])
                if actual_count != expected_count:
                    self.log(f"❌ Family {family_key}: expected {expected_count} stats, got {actual_count}", "ERROR")
                    return False
            
            self.log(f"✅ Stats endpoint initial test passed: 17 stats, all values = 50")
            self.log(f"✅ Family grouping correct: closeness(5), alignment(5), tension(7)")
            
            return True
            
        except Exception as e:
            self.log(f"❌ Error testing stats endpoint: {e}", "ERROR")
            return False
    
    def get_available_quiz(self) -> bool:
        """Get an available quiz for testing EWMA updates"""
        try:
            user_a_id = self.test_users['user_a']['id']
            response = self.session.get(f"{BACKEND_URL}/quiz/wheel/{self.test_couple_id}/{user_a_id}")
            if response.status_code != 200:
                self.log(f"❌ Failed to get quiz wheel: {response.status_code} - {response.text}", "ERROR")
                return False
                
            data = response.json()
            available_quizzes = [node for node in data['nodes'] if node['state'] == 'available']
            
            if not available_quizzes:
                self.log("❌ No available quizzes found for testing", "ERROR")
                return False
                
            # Pick first available quiz
            quiz = available_quizzes[0]
            self.test_quiz_id = quiz['quiz_id']
            self.log(f"✅ Found available quiz: {self.test_quiz_id} ({quiz.get('facet_label', {}).get('de-DE', 'Unknown')})")
            
            return True
            
        except Exception as e:
            self.log(f"❌ Error getting available quiz: {e}", "ERROR")
            return False
    
    def activate_quiz(self) -> bool:
        """Activate a quiz for testing"""
        try:
            user_a_id = self.test_users['user_a']['id']
            activate_data = {
                "user_id": user_a_id,
                "couple_id": self.test_couple_id,
                "quiz_id": self.test_quiz_id
            }
            
            response = self.session.post(f"{BACKEND_URL}/quiz/activate", json=activate_data)
            if response.status_code != 200:
                self.log(f"❌ Failed to activate quiz: {response.status_code} - {response.text}", "ERROR")
                return False
                
            cycle = response.json()
            self.test_cycle_id = cycle['id']
            self.log(f"✅ Quiz activated: cycle_id = {self.test_cycle_id}")
            
            return True
            
        except Exception as e:
            self.log(f"❌ Error activating quiz: {e}", "ERROR")
            return False
    
    def get_quiz_questions(self) -> Dict[str, Any]:
        """Get quiz questions for answer submission"""
        try:
            response = self.session.get(f"{BACKEND_URL}/quizzes/{self.test_quiz_id}")
            if response.status_code != 200:
                self.log(f"❌ Failed to get quiz questions: {response.status_code} - {response.text}", "ERROR")
                return {}
                
            quiz_data = response.json()
            self.log(f"✅ Retrieved quiz with {len(quiz_data.get('questions', []))} questions")
            return quiz_data
            
        except Exception as e:
            self.log(f"❌ Error getting quiz questions: {e}", "ERROR")
            return {}
    
    def submit_quiz_answers(self, user_key: str, quiz_data: Dict[str, Any]) -> bool:
        """Submit quiz answers for a user"""
        try:
            user = self.test_users[user_key]
            questions = quiz_data.get('questions', [])
            
            if not questions:
                self.log(f"❌ No questions found in quiz data", "ERROR")
                return False
            
            # Generate answers (pick first option for each question)
            answers = []
            for question in questions:
                options = question.get('options', [])
                if options:
                    answers.append({
                        "question_id": question['id'],
                        "option_id": options[0]['id']  # Pick first option
                    })
            
            submit_data = {
                "user_id": user['id'],
                "couple_id": self.test_couple_id,
                "quiz_id": self.test_quiz_id,
                "cycle_id": self.test_cycle_id,
                "answers": answers
            }
            
            response = self.session.post(f"{BACKEND_URL}/quiz/submit", json=submit_data)
            if response.status_code != 200:
                self.log(f"❌ Failed to submit answers for {user_key}: {response.status_code} - {response.text}", "ERROR")
                return False
                
            result = response.json()
            self.log(f"✅ Submitted answers for {user_key}: state = {result.get('state', 'unknown')}")
            
            return True
            
        except Exception as e:
            self.log(f"❌ Error submitting quiz answers for {user_key}: {e}", "ERROR")
            return False
    
    def test_ewma_stats_update(self) -> bool:
        """Test the complete EWMA stats update flow"""
        try:
            # Get initial stats values
            response = self.session.get(f"{BACKEND_URL}/stats/{self.test_couple_id}")
            if response.status_code != 200:
                self.log(f"❌ Failed to get initial stats: {response.status_code}", "ERROR")
                return False
                
            initial_stats = response.json()['stats']
            initial_values = {stat['stat_key']: stat['value_0_100'] for stat in initial_stats}
            
            # Get and activate a quiz
            if not self.get_available_quiz():
                return False
                
            if not self.activate_quiz():
                return False
            
            # Get quiz questions
            quiz_data = self.get_quiz_questions()
            if not quiz_data:
                return False
            
            # Submit answers for both users
            if not self.submit_quiz_answers('user_a', quiz_data):
                return False
                
            if not self.submit_quiz_answers('user_b', quiz_data):
                return False
            
            # Wait a moment for processing
            time.sleep(2)
            
            # Get updated stats
            response = self.session.get(f"{BACKEND_URL}/stats/{self.test_couple_id}")
            if response.status_code != 200:
                self.log(f"❌ Failed to get updated stats: {response.status_code}", "ERROR")
                return False
                
            updated_stats = response.json()['stats']
            updated_values = {stat['stat_key']: stat['value_0_100'] for stat in updated_stats}
            
            # Check if any values changed from initial 50
            changes_found = False
            for stat_key, new_value in updated_values.items():
                initial_value = initial_values.get(stat_key, 50)
                if abs(new_value - initial_value) > 0.1:  # Allow for small floating point differences
                    changes_found = True
                    self.log(f"✅ EWMA Update detected: {stat_key} changed from {initial_value} to {new_value}")
            
            if changes_found:
                self.log("✅ EWMA stats update working correctly - values changed after quiz completion")
                return True
            else:
                self.log("⚠️  No stat changes detected after quiz completion - EWMA may not be working", "WARNING")
                return False
                
        except Exception as e:
            self.log(f"❌ Error testing EWMA stats update: {e}", "ERROR")
            return False
    
    def run_all_tests(self) -> Dict[str, bool]:
        """Run all stats tests and return results"""
        results = {}
        
        self.log("🚀 Starting QuissMe Stats Backend Tests")
        self.log("=" * 50)
        
        # Test 1: API Connection
        self.log("Test 1: API Connection")
        results['connection'] = self.test_connection()
        
        # Test 2: Create test couple
        self.log("\nTest 2: Create Test Couple")
        results['couple_creation'] = self.create_test_couple()
        
        if not results['couple_creation']:
            self.log("❌ Cannot continue without test couple", "ERROR")
            return results
        
        # Test 3: Stats Library Info
        self.log("\nTest 3: Stats Library Info Endpoint")
        results['library_info'] = self.test_stats_library_info()
        
        # Test 4: Initial Stats Endpoint
        self.log("\nTest 4: Stats Endpoint (Initial Values)")
        results['stats_initial'] = self.test_stats_endpoint_initial()
        
        # Test 5: EWMA Stats Update Flow
        self.log("\nTest 5: EWMA Stats Update Flow")
        results['ewma_update'] = self.test_ewma_stats_update()
        
        # Summary
        self.log("\n" + "=" * 50)
        self.log("📊 TEST RESULTS SUMMARY")
        self.log("=" * 50)
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{test_name}: {status}")
        
        self.log(f"\nOverall: {passed}/{total} tests passed")
        
        if passed == total:
            self.log("🎉 All tests passed!")
        else:
            self.log("⚠️  Some tests failed - check logs above")
        
        return results

def main():
    """Main test execution"""
    tester = QuissmeStatsTest()
    results = tester.run_all_tests()
    
    # Exit with error code if any tests failed
    if not all(results.values()):
        exit(1)
    else:
        exit(0)

if __name__ == "__main__":
    main()