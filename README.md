#  EduMind AI - Student Learning & Advisory Platform

EduMind AI is an intelligent academic dashboard and advisory service built with **FastAPI**, **Tailwind CSS**, and **Chart.js**. It provides real-time student analytics, subject mastery tracking, cognitive stress assessment, and an interactive AI study tutor.

---

## 🚀 Quick Start

### 1. Requirements
Ensure you have Python 3.10+ installed. Install the dependencies:
```bash
pip install -r requirements.txt
```

### 2. Run the Server
Launch the FastAPI development server:
```bash
uvicorn main:app --reload --port 8000
```

### 3. Enable Real AI Responses
Set a Gemini API key before starting the server:
```bash
# PowerShell
$env:GEMINI_API_KEY = "your-gemini-api-key"

# macOS/Linux
export GEMINI_API_KEY="your-gemini-api-key"
```
The chat and recommendations accept `language: "en"` or `language: "ta"`. Without a key, the API uses local bilingual fallback responses.

### 4. Open the Application
- **Interactive Web Dashboard**: Open [http://127.0.0.1:8000/dashboard](http://127.0.0.1:8000/dashboard) in your browser.
- **Interactive Swagger API Docs**: Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).
- **Root Status Check**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

---

## ✨ Features

- **Personalized Student Profiles**: View mastery score, department, and stress level indicators.
- **Subject Mastery Matrix**: Visual progress bars and a performance chart comparing student performance against target benchmarks.
- **Smart AI Recommendations**: Gemini-powered adaptive advice via `/api/ai/recommend`, with bilingual English/Tamil support:
  - `< 50%`: Foundational reinforcement & simple practice questions.
  - `50% - 74%`: Targeted weak topic revision.
  - `≥ 75%`: Advanced challenges & mastery extension.
- **Identified Weak Topics**: Direct remediation tags (e.g. *Asynchronous Sequential Circuits*, *Poisson Process*) with one-click AI explanations.
- **Interactive AI Tutor Chat**:
  - Live query processing via `/api/ai/chat`.
  - Contextual Gemini responses for stress management, mathematics, circuits, Python programming, and study scheduling.
  - English/Tamil language selector for both recommendations and chat.
  - Pre-built quick action prompt chips.
- **Student Profile Management**: Add new students or update metrics with the built-in modal.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Service health status |
| `GET` | `/dashboard` | Serves the interactive full-stack dashboard |
| `GET` | `/api/students` | Lists all registered student summaries |
| `GET` | `/api/student/{roll_no}` | Fetches detailed student profile & performance |
| `POST` | `/api/student` | Creates or updates a student profile |
| `POST` | `/api/ai/recommend` | Generates learning recommendations based on mastery |
| `POST` | `/api/ai/chat` | AI study buddy chat assistant |

---

## 🧪 Testing

Run the automated test suite:
```bash
python test_api.py
```
