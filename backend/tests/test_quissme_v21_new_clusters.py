import pytest
import requests

# Test Modules:
# - Quiz count and sector distribution verification
# - Reibung/Reparatur quiz structure (4 questions with cluster_scores)
# - Couples quiz structure (1 question with 5 options)
# - Full cycle test for reibung_reparatur quiz
# - Full cycle test for couples quiz

class TestQuizCountAndDistribution:
    """Verify v2.1 quiz count and sector distribution"""

    def test_total_quiz_count(self, api_client, base_url):
        """Verify exactly 23 quizzes"""
        response = api_client.get(f"{base_url}/api/quizzes")
        assert response.status_code == 200
        quizzes = response.json()
        assert len(quizzes) == 23, f"Expected 23 quizzes, got {len(quizzes)}"
        print(f"✓ Total quizzes: {len(quizzes)}")

    def test_sector_distribution(self, api_client, base_url):
        """Verify sector distribution: 7 passion, 10 stability, 6 future"""
        response = api_client.get(f"{base_url}/api/quizzes")
        quizzes = response.json()
        
        sectors = {}
        for q in quizzes:
            s = q.get('sector', 'unknown')
            sectors[s] = sectors.get(s, 0) + 1
        
        assert sectors.get('passion', 0) == 7, f"Expected 7 passion quizzes, got {sectors.get('passion', 0)}"
        assert sectors.get('stability', 0) == 10, f"Expected 10 stability quizzes, got {sectors.get('stability', 0)}"
        assert sectors.get('future', 0) == 6, f"Expected 6 future quizzes, got {sectors.get('future', 0)}"
        print(f"✓ Sector distribution: passion={sectors['passion']}, stability={sectors['stability']}, future={sectors['future']}")

    def test_category_distribution(self, api_client, base_url):
        """Verify categories: 5 love_languages, 3 reibung_reparatur, 15 couples"""
        response = api_client.get(f"{base_url}/api/quizzes")
        quizzes = response.json()
        
        cats = {}
        for q in quizzes:
            c = q.get('category', 'unknown')
            cats[c] = cats.get(c, 0) + 1
        
        assert cats.get('love_languages', 0) == 5, f"Expected 5 love_languages, got {cats.get('love_languages', 0)}"
        assert cats.get('reibung_reparatur', 0) == 3, f"Expected 3 reibung_reparatur, got {cats.get('reibung_reparatur', 0)}"
        assert cats.get('couples', 0) == 15, f"Expected 15 couples, got {cats.get('couples', 0)}"
        print(f"✓ Categories: love_languages={cats['love_languages']}, reibung_reparatur={cats['reibung_reparatur']}, couples={cats['couples']}")


class TestReibungReparaturQuizStructure:
    """Test Reibung/Reparatur quiz structure"""

    def test_reibung_quiz_has_4_questions(self, api_client, base_url):
        """Verify reibung quiz has 4 questions"""
        response = api_client.get(f"{base_url}/api/quizzes/stability_04_friction_love")
        assert response.status_code == 200
        quiz = response.json()
        
        assert quiz['id'] == 'stability_04_friction_love'
        assert quiz['category'] == 'reibung_reparatur'
        assert quiz['sector'] == 'stability'
        assert quiz.get('question_count') == 4, f"Expected 4 questions, got {quiz.get('question_count')}"
        assert len(quiz['questions']) == 4, f"Expected 4 questions in array, got {len(quiz['questions'])}"
        print(f"✓ Reibung quiz has 4 questions")
        
        # Store for cycle test
        pytest.reibung_quiz_id = quiz['id']

    def test_reibung_quiz_cluster_scores(self, api_client, base_url):
        """Verify reibung quiz options have cluster_scores with passion/stability/future"""
        response = api_client.get(f"{base_url}/api/quizzes/stability_04_friction_love")
        quiz = response.json()
        
        # Check first question's options
        question = quiz['questions'][0]
        assert 'options' in question
        assert len(question['options']) > 0
        
        # Check first option has cluster_scores
        option = question['options'][0]
        assert 'cluster_scores' in option, "Option should have cluster_scores"
        
        cluster_scores = option['cluster_scores']
        # Should contain at least one of the sectors
        has_sector_scores = any(k in cluster_scores for k in ['passion', 'stability', 'future'])
        assert has_sector_scores, f"cluster_scores should contain passion/stability/future keys, got {cluster_scores.keys()}"
        print(f"✓ Reibung quiz has cluster_scores with sector keys: {list(cluster_scores.keys())}")


class TestCouplesQuizStructure:
    """Test Couples quiz structure"""

    def test_couples_quiz_has_1_question(self, api_client, base_url):
        """Verify couples quiz has 1 question"""
        response = api_client.get(f"{base_url}/api/quizzes/passion_01_initiative")
        assert response.status_code == 200
        quiz = response.json()
        
        assert quiz['id'] == 'passion_01_initiative'
        assert quiz['category'] == 'couples'
        assert quiz['sector'] == 'passion'
        assert quiz.get('question_count') == 1, f"Expected 1 question, got {quiz.get('question_count')}"
        assert len(quiz['questions']) == 1, f"Expected 1 question in array, got {len(quiz['questions'])}"
        print(f"✓ Couples quiz has 1 question")
        
        # Store for cycle test
        pytest.couples_quiz_id = quiz['id']

    def test_couples_quiz_has_5_options(self, api_client, base_url):
        """Verify couples quiz question has 5 options"""
        response = api_client.get(f"{base_url}/api/quizzes/passion_01_initiative")
        quiz = response.json()
        
        question = quiz['questions'][0]
        assert 'options' in question
        assert len(question['options']) == 5, f"Expected 5 options, got {len(question['options'])}"
        
        # Check each option has required fields
        for option in question['options']:
            assert 'id' in option
            assert 'text' in option
            assert 'cluster_scores' in option
        
        print(f"✓ Couples quiz has 5 options")


class TestReibungReparaturFullCycle:
    """Test full cycle for reibung_reparatur quiz"""

    def test_reibung_quiz_full_cycle(self, api_client, base_url):
        """Test activate → submit (both users) → reveal → verify zone/buff/rewards"""
        # 1. Create couple
        user_a_resp = api_client.post(f"{base_url}/api/users/register", json={
            "name": "TEST_V21_Anna",
            "birth_date": "1995-06-15",
            "birth_time": "14:30",
            "birth_location": "Berlin"
        })
        assert user_a_resp.status_code == 200
        user_a = user_a_resp.json()
        user_a_id = user_a['id']
        invite_code = user_a['invite_code']
        print(f"✓ User A created: {user_a_id}")

        user_b_resp = api_client.post(f"{base_url}/api/invite/join", json={
            "invite_code": invite_code,
            "name": "TEST_V21_Max",
            "birth_date": "1994-03-20",
            "birth_time": "09:15",
            "birth_location": "München"
        })
        assert user_b_resp.status_code == 200
        result = user_b_resp.json()
        couple_id = result['couple_id']
        user_b_id = result['user']['id']
        print(f"✓ User B joined, couple created: {couple_id}")

        # 2. Activate reibung quiz
        quiz_id = 'stability_04_friction_love'
        activate_resp = api_client.post(f"{base_url}/api/quiz/activate", json={
            "user_id": user_a_id,
            "couple_id": couple_id,
            "quiz_id": quiz_id
        })
        assert activate_resp.status_code == 200
        cycle = activate_resp.json()
        cycle_id = cycle['id']
        assert cycle['state'] == 'activated'
        print(f"✓ Reibung quiz activated, cycle: {cycle_id}")

        # 3. Get quiz questions
        quiz_resp = api_client.get(f"{base_url}/api/quizzes/{quiz_id}")
        quiz = quiz_resp.json()
        questions = quiz['questions']
        assert len(questions) == 4, "Should have 4 questions"

        # 4. User A submits answers
        answers_a = [{"question_id": q["id"], "option_id": q["options"][0]["id"]} for q in questions]
        submit_a_resp = api_client.post(f"{base_url}/api/quiz/submit", json={
            "user_id": user_a_id,
            "couple_id": couple_id,
            "quiz_id": quiz_id,
            "cycle_id": cycle_id,
            "answers": answers_a
        })
        assert submit_a_resp.status_code == 200
        cycle_after_a = submit_a_resp.json()
        assert cycle_after_a['state'] == 'one_completed'
        print(f"✓ User A submitted, state: {cycle_after_a['state']}")

        # 5. User B submits answers
        answers_b = [{"question_id": q["id"], "option_id": q["options"][1]["id"]} for q in questions]
        submit_b_resp = api_client.post(f"{base_url}/api/quiz/submit", json={
            "user_id": user_b_id,
            "couple_id": couple_id,
            "quiz_id": quiz_id,
            "cycle_id": cycle_id,
            "answers": answers_b
        })
        assert submit_b_resp.status_code == 200
        cycle_after_b = submit_b_resp.json()
        assert cycle_after_b['state'] == 'ready_to_reveal'
        assert 'result' in cycle_after_b
        assert 'zone' in cycle_after_b
        assert 'buff' in cycle_after_b
        print(f"✓ User B submitted, state: {cycle_after_b['state']}, zone: {cycle_after_b['zone']}")

        # 6. Verify result structure
        result = cycle_after_b['result']
        assert 'combined_scores' in result
        assert 'tendencies' in result
        assert 'zone' in result
        assert 'zone_palette' in result
        assert 'insight_text' in result
        print(f"✓ Result structure verified, tendencies: {result['tendencies']}")

        # 7. Reveal to get rewards
        reveal_resp = api_client.post(f"{base_url}/api/quiz/reveal/{cycle_id}")
        assert reveal_resp.status_code == 200
        revealed_cycle = reveal_resp.json()
        assert revealed_cycle['state'] == 'revealed'
        assert 'reward_choices' in revealed_cycle
        assert len(revealed_cycle['reward_choices']) == 3, "Should have 3 reward choices"
        print(f"✓ Revealed, got {len(revealed_cycle['reward_choices'])} reward choices")

        # Verify buff
        buff = revealed_cycle.get('buff', {})
        assert 'id' in buff
        assert 'name' in buff
        print(f"✓ Buff assigned: {buff['name']}")


class TestCouplesQuizFullCycle:
    """Test full cycle for couples quiz (1 question)"""

    def test_couples_quiz_full_cycle(self, api_client, base_url):
        """Test activate → submit (both users) → verify state transitions work for 1-question quiz"""
        # 1. Create couple
        user_a_resp = api_client.post(f"{base_url}/api/users/register", json={
            "name": "TEST_V21_Couples_A",
            "birth_date": "1992-08-10",
            "birth_time": "10:00",
            "birth_location": "Hamburg"
        })
        assert user_a_resp.status_code == 200
        user_a = user_a_resp.json()
        user_a_id = user_a['id']
        invite_code = user_a['invite_code']
        print(f"✓ User A created: {user_a_id}")

        user_b_resp = api_client.post(f"{base_url}/api/invite/join", json={
            "invite_code": invite_code,
            "name": "TEST_V21_Couples_B",
            "birth_date": "1993-12-05",
            "birth_time": "16:00",
            "birth_location": "Köln"
        })
        assert user_b_resp.status_code == 200
        result = user_b_resp.json()
        couple_id = result['couple_id']
        user_b_id = result['user']['id']
        print(f"✓ User B joined, couple created: {couple_id}")

        # 2. Activate couples quiz
        quiz_id = 'passion_01_initiative'
        activate_resp = api_client.post(f"{base_url}/api/quiz/activate", json={
            "user_id": user_a_id,
            "couple_id": couple_id,
            "quiz_id": quiz_id
        })
        assert activate_resp.status_code == 200
        cycle = activate_resp.json()
        cycle_id = cycle['id']
        assert cycle['state'] == 'activated'
        print(f"✓ Couples quiz activated, cycle: {cycle_id}")

        # 3. Get quiz (1 question with 5 options)
        quiz_resp = api_client.get(f"{base_url}/api/quizzes/{quiz_id}")
        quiz = quiz_resp.json()
        questions = quiz['questions']
        assert len(questions) == 1, "Should have 1 question"
        assert len(questions[0]['options']) == 5, "Should have 5 options"

        # 4. User A submits answer (only 1 question)
        answers_a = [{"question_id": questions[0]["id"], "option_id": questions[0]["options"][0]["id"]}]
        submit_a_resp = api_client.post(f"{base_url}/api/quiz/submit", json={
            "user_id": user_a_id,
            "couple_id": couple_id,
            "quiz_id": quiz_id,
            "cycle_id": cycle_id,
            "answers": answers_a
        })
        assert submit_a_resp.status_code == 200
        cycle_after_a = submit_a_resp.json()
        assert cycle_after_a['state'] == 'one_completed'
        print(f"✓ User A submitted 1 answer, state: {cycle_after_a['state']}")

        # 5. User B submits answer
        answers_b = [{"question_id": questions[0]["id"], "option_id": questions[0]["options"][2]["id"]}]
        submit_b_resp = api_client.post(f"{base_url}/api/quiz/submit", json={
            "user_id": user_b_id,
            "couple_id": couple_id,
            "quiz_id": quiz_id,
            "cycle_id": cycle_id,
            "answers": answers_b
        })
        assert submit_b_resp.status_code == 200
        cycle_after_b = submit_b_resp.json()
        assert cycle_after_b['state'] == 'ready_to_reveal'
        assert 'result' in cycle_after_b
        assert 'zone' in cycle_after_b
        print(f"✓ User B submitted, state: {cycle_after_b['state']}, zone: {cycle_after_b['zone']}")

        # 6. Verify result calculation works for 1-question quiz
        result = cycle_after_b['result']
        assert 'combined_scores' in result
        assert 'tendencies' in result
        assert 'zone' in result
        print(f"✓ Result calculation works for 1-question quiz, zone: {result['zone']}")

        # 7. Reveal
        reveal_resp = api_client.post(f"{base_url}/api/quiz/reveal/{cycle_id}")
        assert reveal_resp.status_code == 200
        revealed_cycle = reveal_resp.json()
        assert revealed_cycle['state'] == 'revealed'
        assert 'reward_choices' in revealed_cycle
        print(f"✓ Couples quiz cycle completed successfully")
