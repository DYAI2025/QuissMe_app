import pytest
import requests
import time

# Test Modules:
# - Health check
# - User registration and retrieval
# - Invite and couple matching
# - Quiz listing and retrieval
# - Quiz submission and results

class TestHealthCheck:
    """Health check endpoint"""

    def test_api_root(self, api_client, base_url):
        response = api_client.get(f"{base_url}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "QuissMe" in data["message"]
        print("✓ Health check passed")


class TestUserRegistration:
    """User registration and retrieval"""

    def test_register_user_and_verify(self, api_client, base_url):
        """Create user and verify persistence"""
        create_payload = {
            "name": "TEST_Anna",
            "birth_date": "1995-06-15",
            "birth_time": "14:30",
            "birth_location": "Berlin"
        }
        create_response = api_client.post(f"{base_url}/api/users/register", json=create_payload)
        assert create_response.status_code == 200, f"Registration failed: {create_response.text}"

        user = create_response.json()
        assert user["name"] == create_payload["name"]
        assert user["birth_date"] == create_payload["birth_date"]
        assert "id" in user
        assert "invite_code" in user
        assert "astro_data" in user
        assert "_id" not in user, "MongoDB _id should be excluded"
        
        user_id = user["id"]
        invite_code = user["invite_code"]
        
        # Verify zodiac calculation (June 15 = Zwillinge/Gemini)
        astro = user.get("astro_data", {})
        sun_sign = astro.get("summary", {}).get("sternzeichen") or astro.get("western", {}).get("sunSign")
        assert sun_sign == "Zwillinge", f"Expected Zwillinge for June 15, got {sun_sign}"
        print(f"✓ User registered: {user_id}, zodiac: {sun_sign}, invite code: {invite_code}")

        # GET to verify data persisted
        get_response = api_client.get(f"{base_url}/api/users/{user_id}")
        assert get_response.status_code == 200
        retrieved_user = get_response.json()
        assert retrieved_user["id"] == user_id
        assert retrieved_user["name"] == create_payload["name"]
        assert "_id" not in retrieved_user, "MongoDB _id should be excluded"
        print(f"✓ User data verified via GET")

        # Store for next test
        pytest.user_id = user_id
        pytest.invite_code = invite_code


class TestInviteAndCoupleMatching:
    """Invite join and couple matching"""

    def test_join_invite_and_verify_couple(self, api_client, base_url):
        """Join with invite code and verify couple creation"""
        # Use invite code from previous test
        if not hasattr(pytest, 'invite_code'):
            pytest.skip("No invite code from registration test")

        join_payload = {
            "invite_code": pytest.invite_code,
            "name": "TEST_Max",
            "birth_date": "1994-03-20",
            "birth_time": "09:15",
            "birth_location": "München"
        }
        
        join_response = api_client.post(f"{base_url}/api/invite/join", json=join_payload)
        assert join_response.status_code == 200, f"Join failed: {join_response.text}"

        result = join_response.json()
        assert "user" in result
        assert "couple_id" in result
        assert "partner_name" in result
        assert result["partner_name"] == "TEST_Anna"
        assert "_id" not in result.get("user", {}), "MongoDB _id should be excluded"
        
        couple_id = result["couple_id"]
        user_b_id = result["user"]["id"]
        
        print(f"✓ Partner joined: {user_b_id}, couple: {couple_id}")

        # Verify couple data
        couple_response = api_client.get(f"{base_url}/api/couple/{couple_id}")
        assert couple_response.status_code == 200
        couple = couple_response.json()
        assert couple["id"] == couple_id
        assert "user_a" in couple
        assert "user_b" in couple
        assert "interpretation" in couple
        assert "match_score" in couple
        assert couple["user_a"]["name"] == "TEST_Anna"
        assert couple["user_b"]["name"] == "TEST_Max"
        assert "_id" not in couple, "MongoDB _id should be excluded"
        print(f"✓ Couple data verified")

        # Store for quiz tests
        pytest.couple_id = couple_id
        pytest.user_b_id = user_b_id


class TestQuizzes:
    """Quiz listing and retrieval"""

    def test_get_quizzes_list(self, api_client, base_url):
        """Get list of available quizzes"""
        response = api_client.get(f"{base_url}/api/quizzes")
        assert response.status_code == 200
        quizzes = response.json()
        assert isinstance(quizzes, list)
        assert len(quizzes) >= 5, f"Expected at least 5 quizzes, got {len(quizzes)}"
        
        # Verify quiz structure
        first_quiz = quizzes[0]
        assert "id" in first_quiz
        assert "hidden_cluster" in first_quiz
        assert "question_count" in first_quiz
        assert "questions" not in first_quiz, "List endpoint should not include questions"
        assert "_id" not in first_quiz, "MongoDB _id should be excluded"
        
        print(f"✓ Found {len(quizzes)} quizzes")
        pytest.quiz_id = first_quiz["id"]

    def test_get_quiz_with_questions(self, api_client, base_url):
        """Get full quiz with questions"""
        if not hasattr(pytest, 'quiz_id'):
            pytest.skip("No quiz_id from list test")

        response = api_client.get(f"{base_url}/api/quizzes/{pytest.quiz_id}")
        assert response.status_code == 200
        quiz = response.json()
        assert quiz["id"] == pytest.quiz_id
        assert "questions" in quiz
        assert len(quiz["questions"]) >= 10, f"Expected at least 10 questions, got {len(quiz['questions'])}"
        assert "_id" not in quiz, "MongoDB _id should be excluded"
        
        # Verify question structure
        question = quiz["questions"][0]
        assert "id" in question
        assert "text" in question
        assert "options" in question
        assert len(question["options"]) == 4, "Each question should have 4 options"
        
        # Verify option structure
        option = question["options"][0]
        assert "id" in option
        assert "text" in option
        assert "cluster_scores" in option
        
        print(f"✓ Quiz {pytest.quiz_id} has {len(quiz['questions'])} questions")


class TestQuizSubmission:
    """Quiz submission and results"""

    def test_submit_quiz_and_verify_result(self, api_client, base_url):
        """Submit quiz and verify result calculation"""
        if not hasattr(pytest, 'quiz_id'):
            pytest.skip("No quiz_id from list test")
        if not hasattr(pytest, 'user_id'):
            pytest.skip("No user_id from registration test")
        if not hasattr(pytest, 'couple_id'):
            pytest.skip("No couple_id from join test")

        # Get quiz questions first
        quiz_response = api_client.get(f"{base_url}/api/quizzes/{pytest.quiz_id}")
        quiz = quiz_response.json()
        questions = quiz["questions"]

        # Create answers (select first option for each question)
        answers = [
            {"question_id": q["id"], "option_id": q["options"][0]["id"]}
            for q in questions[:10]  # Take first 10 questions
        ]

        submit_payload = {
            "user_id": pytest.user_id,
            "couple_id": pytest.couple_id,
            "quiz_id": pytest.quiz_id,
            "answers": answers
        }

        submit_response = api_client.post(f"{base_url}/api/quiz/submit", json=submit_payload)
        assert submit_response.status_code == 200, f"Submit failed: {submit_response.text}"

        result = submit_response.json()
        assert "id" in result
        assert "cluster_scores" in result
        assert "normalized_clusters" in result
        assert "primary_cluster" in result
        assert "zone_tokens" in result
        assert "_id" not in result, "MongoDB _id should be excluded"

        result_id = result["id"]
        primary = result["primary_cluster"]
        cluster_scores = result["cluster_scores"]
        normalized = result["normalized_clusters"]

        # Verify cluster scores
        assert len(cluster_scores) == 5, "Should have 5 love language clusters"
        expected_clusters = ["words", "time", "gifts", "service", "touch"]
        for cluster in expected_clusters:
            assert cluster in cluster_scores
            assert cluster in normalized
            assert 0 <= normalized[cluster] <= 100, f"Normalized score should be 0-100, got {normalized[cluster]}"

        print(f"✓ Quiz submitted, result: {result_id}")
        print(f"  Primary cluster: {primary}")
        print(f"  Cluster scores: {cluster_scores}")
        print(f"  Normalized: {normalized}")

        # GET to verify result persisted
        get_result_response = api_client.get(f"{base_url}/api/quiz/result/{result_id}")
        assert get_result_response.status_code == 200
        retrieved_result = get_result_response.json()
        assert retrieved_result["id"] == result_id
        assert retrieved_result["primary_cluster"] == primary
        assert "_id" not in retrieved_result, "MongoDB _id should be excluded"
        print(f"✓ Result data verified via GET")

        pytest.result_id = result_id

    def test_get_couple_results(self, api_client, base_url):
        """Get all results for a couple"""
        if not hasattr(pytest, 'couple_id'):
            pytest.skip("No couple_id from join test")

        response = api_client.get(f"{base_url}/api/quiz/results/{pytest.couple_id}")
        assert response.status_code == 200
        results = response.json()
        assert isinstance(results, list)
        assert len(results) >= 1, "Should have at least one result from previous test"
        
        # Verify no _id in any result
        for result in results:
            assert "_id" not in result, "MongoDB _id should be excluded"
        
        print(f"✓ Found {len(results)} results for couple")


class TestErrorHandling:
    """Error handling tests"""

    def test_invalid_user_id(self, api_client, base_url):
        response = api_client.get(f"{base_url}/api/users/nonexistent-id")
        assert response.status_code == 404
        print("✓ 404 for invalid user ID")

    def test_invalid_invite_code(self, api_client, base_url):
        payload = {
            "invite_code": "INVALID",
            "name": "Test",
            "birth_date": "1990-01-01",
            "birth_time": "12:00",
            "birth_location": "Test"
        }
        response = api_client.post(f"{base_url}/api/invite/join", json=payload)
        assert response.status_code == 404
        print("✓ 404 for invalid invite code")

    def test_invalid_quiz_id(self, api_client, base_url):
        response = api_client.get(f"{base_url}/api/quizzes/nonexistent-quiz")
        assert response.status_code == 404
        print("✓ 404 for invalid quiz ID")
