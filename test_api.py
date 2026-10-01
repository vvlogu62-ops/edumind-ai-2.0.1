"""
Test script for EduMind AI FastAPI backend.
Validates all endpoints and logic.
"""
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "EduMind AI server online"
    print(" Root endpoint test passed.")

def test_get_student_success():
    response = client.get("/api/student/25ECA001")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["student"]["name"] == "Logu"
    assert data["student"]["overall_mastery"] == 78
    assert len(data["student"]["subjects"]) == 4
    print(" Get student (25ECA001) passed.")

def test_get_student_not_found():
    response = client.get("/api/student/INVALID999")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["message"] == "Student not found"
    print(" Student not found test passed.")

def test_recommendation_levels():
    # Low mastery (< 50)
    res_low = client.post("/api/ai/recommend", json={"mastery": 45})
    assert "Start with basic concepts" in res_low.json()["recommendation"]

    # Medium mastery (50-74)
    res_med = client.post("/api/ai/recommend", json={"mastery": 70})
    assert "Revise weak topics" in res_med.json()["recommendation"]

    # High mastery (>= 75)
    res_high = client.post("/api/ai/recommend", json={"mastery": 88})
    assert "Your mastery is good" in res_high.json()["recommendation"]
    print(" AI Recommendation levels passed.")

def test_ai_chat():
    res_stress = client.post("/api/ai/chat", json={"question": "I am feeling stressed"})
    assert "short break" in res_stress.json()["answer"]

    res_math = client.post("/api/ai/chat", json={"question": "Help me with math"})
    assert "formula" in res_math.json()["answer"]

    res_other = client.post("/api/ai/chat", json={"question": "Hello"})
    assert "understand concepts" in res_other.json()["answer"]
    print(" AI Chat logic passed.")

def test_dashboard_served():
    res = client.get("/dashboard")
    assert res.status_code == 200
    assert "EduMind AI" in res.text
    print(" Dashboard HTML served correctly.")

if __name__ == "__main__":
    print("--- Running EduMind AI API Tests ---")
    test_root()
    test_get_student_success()
    test_get_student_not_found()
    test_recommendation_levels()
    test_ai_chat()
    test_dashboard_served()
    print("All tests passed successfully! ")
