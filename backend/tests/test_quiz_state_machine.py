import pytest
import requests
import os
import time

# Test Modules:
# - Quiz Wheel State Management
# - ClusterCycle Activation
# - Quiz Submit with State Tracking
# - Reveal with Tendencies (no percentages)
# - Flow/Spark/Talk Zone Detection
# - Buff and Reward Assignment
# - Garden Management

BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', '').rstrip('/')

class TestQuizWheel:
    """Quiz Wheel and State Management"""

    def test_get_wheel_for_couple(self, api_client):
        """Get quiz wheel with states for a couple"""
        # First create two users and couple
        user_a_payload = {
            "name": "TEST_QuizUser_A",
            "birth_date": "1995-06-15",
            "birth_time": "14:30",
            "birth_location": "Berlin"
        }
        resp_a = api_client.post(f"{BASE_URL}/api/users/register", json=user_a_payload)
        assert resp_a.status_code == 200
        user_a = resp_a.json()
        invite_code = user_a["invite_code"]
        
        user_b_payload = {
            "invite_code": invite_code,
            "name": "TEST_QuizUser_B",
            "birth_date": "1994-03-20",
            "birth_time": "09:15",
            "birth_location": "München"
        }
        resp_b = api_client.post(f"{BASE_URL}/api/invite/join", json=user_b_payload)
        assert resp_b.status_code == 200
        result = resp_b.json()
        couple_id = result["couple_id"]
        user_b_id = result["user"]["id"]
        
        # Get wheel
        wheel_resp = api_client.get(f"{BASE_URL}/api/quiz/wheel/{couple_id}/{user_a['id']}")
        assert wheel_resp.status_code == 200
        wheel = wheel_resp.json()
        
        assert "nodes" in wheel
        assert "can_activate" in wheel
        assert "seeds_remaining" in wheel
        assert "slots_remaining" in wheel
        assert "weekly_activations" in wheel
        assert "active_count" in wheel
        
        nodes = wheel["nodes"]
        assert len(nodes) >= 5, f"Expected at least 5 quiz nodes, got {len(nodes)}"
        
        # Verify node structure
        node = nodes[0]
        assert "quiz_id" in node
        assert "cluster" in node
        assert "state" in node
        assert "sector" in node
        assert node["state"] == "available", "Initial state should be available"
        
        # Verify limits
        assert wheel["seeds_remaining"] == 3, "Should start with 3 seeds"
        assert wheel["slots_remaining"] == 3, "Should start with 3 slots"
        assert wheel["can_activate"] is True, "Should be able to activate"
        
        print(f"✓ Wheel retrieved: {len(nodes)} nodes, {wheel['seeds_remaining']} seeds remaining")
        
        # Store for next tests
        pytest.test_couple_id = couple_id
        pytest.test_user_a_id = user_a["id"]
        pytest.test_user_b_id = user_b_id
        pytest.test_quiz_id = nodes[0]["quiz_id"]


class TestClusterCycleFlow:
    """Test complete ClusterCycle state machine flow"""

    def test_activate_quiz_creates_cycle(self, api_client):
        """Activate a quiz creates ClusterCycle in 'activated' state"""
        if not hasattr(pytest, 'test_couple_id'):
            pytest.skip("No couple_id from wheel test")
        
        activate_payload = {
            "user_id": pytest.test_user_a_id,
            "couple_id": pytest.test_couple_id,
            "quiz_id": pytest.test_quiz_id
        }
        
        resp = api_client.post(f"{BASE_URL}/api/quiz/activate", json=activate_payload)
        assert resp.status_code == 200, f"Activation failed: {resp.text}"
        
        cycle = resp.json()
        assert "id" in cycle
        assert cycle["state"] == "activated"
        assert cycle["activated_by"] == pytest.test_user_a_id
        assert cycle["couple_id"] == pytest.test_couple_id
        assert cycle["quiz_id"] == pytest.test_quiz_id
        assert cycle["completed_by"] == []
        assert "_id" not in cycle, "MongoDB _id should be excluded"
        
        print(f"✓ Quiz activated: cycle_id={cycle['id']}, state={cycle['state']}")
        pytest.test_cycle_id = cycle["id"]

    def test_submit_first_user_updates_to_one_completed(self, api_client):
        """Submit answers for first user → state becomes 'one_completed'"""
        if not hasattr(pytest, 'test_cycle_id'):
            pytest.skip("No cycle_id from activation test")
        
        # Get quiz questions
        quiz_resp = api_client.get(f"{BASE_URL}/api/quizzes/{pytest.test_quiz_id}")
        quiz = quiz_resp.json()
        questions = quiz["questions"][:10]
        
        # Create answers (select first option for each)
        answers = [
            {"question_id": q["id"], "option_id": q["options"][0]["id"]}
            for q in questions
        ]
        
        submit_payload = {
            "user_id": pytest.test_user_a_id,
            "couple_id": pytest.test_couple_id,
            "quiz_id": pytest.test_quiz_id,
            "cycle_id": pytest.test_cycle_id,
            "answers": answers
        }
        
        resp = api_client.post(f"{BASE_URL}/api/quiz/submit", json=submit_payload)
        assert resp.status_code == 200, f"Submit failed: {resp.text}"
        
        cycle = resp.json()
        assert cycle["state"] == "one_completed", f"Expected 'one_completed', got {cycle['state']}"
        assert pytest.test_user_a_id in cycle["completed_by"]
        assert len(cycle["completed_by"]) == 1
        assert "_id" not in cycle
        
        print(f"✓ First user submitted: state={cycle['state']}, completed_by={cycle['completed_by']}")

    def test_submit_second_user_updates_to_ready_to_reveal(self, api_client):
        """Submit answers for second user → state becomes 'ready_to_reveal' with result"""
        if not hasattr(pytest, 'test_cycle_id'):
            pytest.skip("No cycle_id from activation test")
        
        # Get quiz questions
        quiz_resp = api_client.get(f"{BASE_URL}/api/quizzes/{pytest.test_quiz_id}")
        quiz = quiz_resp.json()
        questions = quiz["questions"][:10]
        
        # Create different answers (select second option)
        answers = [
            {"question_id": q["id"], "option_id": q["options"][1]["id"] if len(q["options"]) > 1 else q["options"][0]["id"]}
            for q in questions
        ]
        
        submit_payload = {
            "user_id": pytest.test_user_b_id,
            "couple_id": pytest.test_couple_id,
            "quiz_id": pytest.test_quiz_id,
            "cycle_id": pytest.test_cycle_id,
            "answers": answers
        }
        
        resp = api_client.post(f"{BASE_URL}/api/quiz/submit", json=submit_payload)
        assert resp.status_code == 200, f"Submit failed: {resp.text}"
        
        cycle = resp.json()
        assert cycle["state"] == "ready_to_reveal", f"Expected 'ready_to_reveal', got {cycle['state']}"
        assert len(cycle["completed_by"]) == 2
        assert pytest.test_user_b_id in cycle["completed_by"]
        assert "_id" not in cycle
        
        # Verify result structure
        assert "result" in cycle
        result = cycle["result"]
        assert "combined_scores" in result
        assert "tendencies" in result
        assert "primary_cluster" in result
        assert "zone" in result
        assert "zone_palette" in result
        assert "zone_sentence" in result
        assert "insight_text" in result
        
        # CRITICAL: Verify tendencies (no percentages!)
        tendencies = result["tendencies"]
        assert isinstance(tendencies, dict)
        for cluster, tendency in tendencies.items():
            assert tendency in ["high", "medium", "building"], f"Tendency must be high/medium/building, got {tendency}"
        
        # Verify zone is one of flow/spark/talk
        assert cycle["zone"] in ["flow", "spark", "talk"], f"Zone must be flow/spark/talk, got {cycle['zone']}"
        
        # Verify buff assigned
        assert "buff" in cycle
        buff = cycle["buff"]
        assert "id" in buff
        assert "name" in buff
        assert "line1" in buff
        assert "line2" in buff
        
        print(f"✓ Second user submitted: state={cycle['state']}")
        print(f"  Zone: {cycle['zone']}")
        print(f"  Tendencies: {tendencies}")
        print(f"  Primary cluster: {result['primary_cluster']}")
        print(f"  Buff: {buff['name']}")

    def test_reveal_quiz_returns_reward_choices(self, api_client):
        """Reveal quiz returns 3 reward choices and marks as revealed"""
        if not hasattr(pytest, 'test_cycle_id'):
            pytest.skip("No cycle_id from activation test")
        
        resp = api_client.post(f"{BASE_URL}/api/quiz/reveal/{pytest.test_cycle_id}")
        assert resp.status_code == 200, f"Reveal failed: {resp.text}"
        
        cycle = resp.json()
        assert cycle["state"] == "revealed"
        assert "reward_choices" in cycle
        assert "_id" not in cycle
        
        choices = cycle["reward_choices"]
        assert len(choices) == 3, f"Expected 3 reward choices, got {len(choices)}"
        
        # Verify reward structure
        categories = [c["category"] for c in choices]
        assert "plant" in categories
        assert "land" in categories
        assert "deco" in categories
        
        for choice in choices:
            assert "id" in choice
            assert "name" in choice
            assert "type" in choice
            assert "zone" in choice
            assert "sector" in choice
            assert "category" in choice
        
        print(f"✓ Quiz revealed: {len(choices)} reward choices")
        print(f"  Rewards: {[c['name'] for c in choices]}")


class TestTendenciesAndZones:
    """Verify tendencies replace percentages and zone detection works"""

    def test_no_percentages_in_result(self, api_client):
        """Ensure NO percentage scores appear in cycle result"""
        if not hasattr(pytest, 'test_cycle_id'):
            pytest.skip("No cycle_id from previous tests")
        
        resp = api_client.get(f"{BASE_URL}/api/cycle/{pytest.test_cycle_id}")
        assert resp.status_code == 200
        cycle = resp.json()
        
        # Convert to string to search for percentage patterns
        result_str = str(cycle.get("result", {}))
        
        # Check for common percentage patterns in result
        # Note: combined_scores may have raw numbers, but frontend should only show tendencies
        tendencies = cycle.get("result", {}).get("tendencies", {})
        
        # Verify all tendencies are labels, not numbers
        for cluster, level in tendencies.items():
            assert isinstance(level, str), f"Tendency should be string label, got {type(level)}"
            assert level in ["high", "medium", "building"], f"Invalid tendency: {level}"
            # Ensure it's not a number or percentage
            assert not level.replace('.', '').replace('%', '').isdigit(), f"Tendency should not be numeric: {level}"
        
        print(f"✓ No percentages found - only tendencies: {tendencies}")

    def test_zone_is_flow_spark_or_talk(self, api_client):
        """Verify zone is one of the three resonance types"""
        if not hasattr(pytest, 'test_cycle_id'):
            pytest.skip("No cycle_id from previous tests")
        
        resp = api_client.get(f"{BASE_URL}/api/cycle/{pytest.test_cycle_id}")
        assert resp.status_code == 200
        cycle = resp.json()
        
        zone = cycle.get("zone")
        assert zone in ["flow", "spark", "talk"], f"Zone must be flow/spark/talk, got {zone}"
        
        # Verify zone palette exists
        result = cycle.get("result", {})
        zone_palette = result.get("zone_palette", {})
        assert "hue" in zone_palette
        assert "saturation" in zone_palette
        assert "glow" in zone_palette
        
        print(f"✓ Zone verified: {zone}")
        print(f"  Palette: {zone_palette}")


class TestGardenManagement:
    """Test garden item placement"""

    def test_place_garden_item(self, api_client):
        """Place a reward item into shared garden"""
        if not hasattr(pytest, 'test_couple_id'):
            pytest.skip("No couple_id from previous tests")
        if not hasattr(pytest, 'test_cycle_id'):
            pytest.skip("No cycle_id from previous tests")
        
        # Get cycle to retrieve reward choices
        cycle_resp = api_client.get(f"{BASE_URL}/api/cycle/{pytest.test_cycle_id}")
        cycle = cycle_resp.json()
        
        if "reward_choices" not in cycle or not cycle["reward_choices"]:
            pytest.skip("No reward choices available")
        
        chosen_item = cycle["reward_choices"][0]
        
        place_payload = {
            "couple_id": pytest.test_couple_id,
            "user_id": pytest.test_user_a_id,
            "item_id": chosen_item["id"],
            "position_x": 100.5,
            "position_y": 150.7
        }
        
        resp = api_client.post(f"{BASE_URL}/api/garden/place", json=place_payload)
        assert resp.status_code == 200
        result = resp.json()
        assert "garden" in result
        
        # Verify garden has items
        garden = result["garden"]
        assert "items" in garden
        assert len(garden["items"]) >= 1
        
        # Verify placed item structure
        placed = garden["items"][-1]
        assert "id" in placed
        assert "item_id" in placed
        assert placed["placed_by"] == pytest.test_user_a_id
        assert placed["position_x"] == 100.5
        assert placed["position_y"] == 150.7
        
        print(f"✓ Garden item placed: {chosen_item['name']} at ({placed['position_x']}, {placed['position_y']})")

    def test_get_garden(self, api_client):
        """Retrieve couple's garden"""
        if not hasattr(pytest, 'test_couple_id'):
            pytest.skip("No couple_id from previous tests")
        
        resp = api_client.get(f"{BASE_URL}/api/garden/{pytest.test_couple_id}")
        assert resp.status_code == 200
        result = resp.json()
        assert "garden" in result
        
        garden = result["garden"]
        assert "items" in garden
        assert "level" in garden
        assert isinstance(garden["items"], list)
        assert isinstance(garden["level"], int)
        
        print(f"✓ Garden retrieved: level {garden['level']}, {len(garden['items'])} items")


class TestErrorHandling:
    """Test error cases and limits"""

    def test_cannot_activate_same_quiz_twice(self, api_client):
        """Cannot activate the same quiz if already active"""
        if not hasattr(pytest, 'test_couple_id'):
            pytest.skip("No couple_id from previous tests")
        
        # Try to activate a different quiz first
        wheel_resp = api_client.get(f"{BASE_URL}/api/quiz/wheel/{pytest.test_couple_id}/{pytest.test_user_a_id}")
        wheel = wheel_resp.json()
        available_nodes = [n for n in wheel["nodes"] if n["state"] == "available"]
        
        if not available_nodes:
            pytest.skip("No available quizzes")
        
        second_quiz_id = available_nodes[0]["quiz_id"]
        
        # Activate it
        activate_payload = {
            "user_id": pytest.test_user_a_id,
            "couple_id": pytest.test_couple_id,
            "quiz_id": second_quiz_id
        }
        resp = api_client.post(f"{BASE_URL}/api/quiz/activate", json=activate_payload)
        assert resp.status_code == 200
        
        # Try to activate it again
        resp2 = api_client.post(f"{BASE_URL}/api/quiz/activate", json=activate_payload)
        assert resp2.status_code == 400, "Should prevent duplicate activation"
        
        print("✓ Duplicate activation prevented")

    def test_invalid_cycle_id(self, api_client):
        """404 for non-existent cycle"""
        resp = api_client.get(f"{BASE_URL}/api/cycle/nonexistent-cycle-id")
        assert resp.status_code == 404
        print("✓ 404 for invalid cycle ID")

    def test_reveal_before_both_complete(self, api_client):
        """Cannot reveal if not ready_to_reveal state"""
        # Create a new cycle and try to reveal immediately
        if not hasattr(pytest, 'test_couple_id'):
            pytest.skip("No couple_id from previous tests")
        
        wheel_resp = api_client.get(f"{BASE_URL}/api/quiz/wheel/{pytest.test_couple_id}/{pytest.test_user_a_id}")
        wheel = wheel_resp.json()
        available = [n for n in wheel["nodes"] if n["state"] == "available"]
        
        if not available or len(available) == 0:
            pytest.skip("No available quizzes for error test")
        
        # Activate a quiz
        activate_payload = {
            "user_id": pytest.test_user_a_id,
            "couple_id": pytest.test_couple_id,
            "quiz_id": available[0]["quiz_id"]
        }
        resp = api_client.post(f"{BASE_URL}/api/quiz/activate", json=activate_payload)
        if resp.status_code != 200:
            pytest.skip("Could not activate quiz for error test")
        
        new_cycle_id = resp.json()["id"]
        
        # Try to reveal without completing
        reveal_resp = api_client.post(f"{BASE_URL}/api/quiz/reveal/{new_cycle_id}")
        assert reveal_resp.status_code == 400, "Should prevent early reveal"
        
        print("✓ Early reveal prevented")
