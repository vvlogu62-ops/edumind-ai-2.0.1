import os
import json
from urllib import request as url_request
from urllib.error import HTTPError, URLError
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(title="EduMind AI", description="AI-powered personalized student learning & advisory platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Check local static directory or parent static directory
STATIC_DIR = os.path.join(BASE_DIR, "static")
if not os.path.exists(STATIC_DIR):
    parent_static = os.path.join(os.path.dirname(BASE_DIR), "static")
    if os.path.exists(parent_static):
        STATIC_DIR = parent_static

if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

students = {
    "25ECA001": {
        "name": "Logu",
        "department": "ECE",
        "overall_mastery": 78,
        "stress_level": "Moderate",
        "subjects": [
            {"name": "DSD", "mastery": 82},
            {"name": "Python", "mastery": 75},
            {"name": "Maths", "mastery": 68},
            {"name": "RSPV", "mastery": 86}
        ],
        "weak_topics": [
            "Asynchronous Sequential Circuits",
            "Poisson Process"
        ]
    },
    "25CSB042": {
        "name": "Priya",
        "department": "CSE",
        "overall_mastery": 48,
        "stress_level": "High",
        "subjects": [
            {"name": "Data Structures", "mastery": 45},
            {"name": "Operating Systems", "mastery": 52},
            {"name": "Discrete Maths", "mastery": 42},
            {"name": "Computer Networks", "mastery": 55}
        ],
        "weak_topics": [
            "B-Trees & AVL Balancing",
            "Deadlock Avoidance Algorithms",
            "Graph Theory Proofs"
        ]
    },
    "25EEE018": {
        "name": "Rahul",
        "department": "EEE",
        "overall_mastery": 91,
        "stress_level": "Low",
        "subjects": [
            {"name": "Control Systems", "mastery": 94},
            {"name": "Power Electronics", "mastery": 89},
            {"name": "Signal Processing", "mastery": 92},
            {"name": "Microcontrollers", "mastery": 90}
        ],
        "weak_topics": [
            "Nyquist Stability Criterion"
        ]
    }
}


def generate_ai_response(prompt: str):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 700}
    }).encode("utf-8")
    endpoint = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.0-flash:generateContent?key={api_key}"
    )
    try:
        http_request = url_request.Request(
            endpoint,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with url_request.urlopen(http_request, timeout=25) as response:
            result = json.loads(response.read().decode("utf-8"))
        return result["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (HTTPError, URLError, KeyError, IndexError, json.JSONDecodeError) as error:
        print(f"Gemini request failed: {error}")
        return None


@app.get("/")
def root():
    return {
        "message": "EduMind AI server online",
        "dashboard": "/dashboard",
        "docs": "/docs"
    }


@app.get("/dashboard")
def get_dashboard():
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "EduMind AI server online", "error": "Dashboard template not found"}


@app.get("/api/students")
def get_all_students():
    """Returns a list of all students for the dashboard switcher"""
    return {
        "success": True,
        "students": [
            {
                "roll_no": roll,
                "name": s["name"],
                "department": s["department"],
                "overall_mastery": s["overall_mastery"],
                "stress_level": s["stress_level"]
            }
            for roll, s in students.items()
        ]
    }


@app.get("/api/student/{roll_no}")
def get_student(roll_no: str):
    student = students.get(roll_no)

    if not student:
        return {
            "success": False,
            "message": "Student not found"
        }

    return {
        "success": True,
        "student": student
    }


@app.post("/api/student")
def create_or_update_student(data: dict):
    roll_no = data.get("roll_no")
    if not roll_no:
        return {"success": False, "message": "Roll number is required"}
    
    students[roll_no] = {
        "name": data.get("name", "Unknown"),
        "department": data.get("department", "General"),
        "overall_mastery": int(data.get("overall_mastery", 50)),
        "stress_level": data.get("stress_level", "Moderate"),
        "subjects": data.get("subjects", []),
        "weak_topics": data.get("weak_topics", [])
    }
    return {"success": True, "message": f"Student {roll_no} updated successfully", "student": students[roll_no]}


@app.post("/api/ai/recommend")
def recommendation(data: dict):
    mastery = data.get("mastery", 0)
    language = data.get("language", "en")
    language_name = "Tamil" if language == "ta" else "English"

    ai_message = generate_ai_response(
        "You are EduMind AI, a supportive academic advisor. "
        f"Give a concise, practical recommendation in {language_name} for a student with "
        f"{mastery}% overall mastery. Include one immediate action and one next step."
    )
    if ai_message:
        return {"recommendation": ai_message, "source": "gemini"}

    if mastery < 50:
        message = "அடிப்படை கருத்துகளில் தொடங்கி எளிய கேள்விகளைப் பயிற்சி செய்யுங்கள்." if language == "ta" else "Start with basic concepts and practice simple questions."
    elif mastery < 75:
        message = "பலவீனமான தலைப்புகளை மீண்டும் படித்து, கூடுதல் பயிற்சி கேள்விகளை முயற்சி செய்யுங்கள்." if language == "ta" else "Revise weak topics and attempt more practice questions."
    else:
        message = "உங்கள் திறன் நன்றாக உள்ளது. மேம்பட்ட நிலை கேள்விகளை முயற்சி செய்யுங்கள்." if language == "ta" else "Your mastery is good. Try advanced-level questions."

    return {
        "recommendation": message
    }


@app.post("/api/ai/chat")
def ai_chat(data: dict):
    question = data.get("question", "")
    language = data.get("language", "en")
    language_name = "Tamil" if language == "ta" else "English"

    ai_message = generate_ai_response(
        "You are EduMind AI, an expert academic tutor for engineering students. "
        f"Answer the student's question in {language_name}. Be accurate, encouraging, and practical. "
        "Use short sections or numbered steps when useful. If the question is unclear, ask one helpful clarification.\n\n"
        f"Student question: {question}"
    )
    if ai_message:
        return {"answer": ai_message, "source": "gemini", "language": language}

    question = question.lower()

    if "stress" in question or "anxious" in question or "overwhelmed" in question:
        answer = (
            "சிறிது இடைவெளி எடுத்துக் கொண்டு, தலைப்பை சிறிய பகுதிகளாகப் பிரித்து படிப்படியாக தொடருங்கள். தொடர்ந்து செய்வது ஒரே நாளில் அதிகமாகப் படிப்பதை விட சிறந்தது."
            if language == "ta" else
            "Take a short break, divide the topic into smaller sections "
            "and continue learning step by step. Remember that consistency beats cramming!"
        )

    elif "math" in question or "poisson" in question or "formula" in question:
        answer = (
            "முதலில் சூத்திரத்தைப் புரிந்து கொண்டு, கடினமான கேள்விகளுக்கு செல்லும் முன் ஒரு எளிய உதாரணத்தைத் தீர்க்குங்கள். Poisson distribution-ல் event rate λ-வைத் தெளிவாகப் புரிந்து கொள்ளுங்கள்."
            if language == "ta" else
            "Focus on the formula first, then solve one simple example "
            "before moving to harder problems. For Poisson distributions, ensure you understand the event rate λ."
        )

    elif "circuit" in question or "dsd" in question or "asynchronous" in question:
        answer = (
            "Asynchronous Sequential Circuits-க்கு flow tables, primitive state tables, race conditions மற்றும் hazards ஆகியவற்றைப் புரிந்து கொண்டு timing diagrams-ஐப் பயிற்சி செய்யுங்கள்."
            if language == "ta" else
            "For Asynchronous Sequential Circuits, focus on flow tables, primitive state tables, "
            "and eliminating race conditions and hazards before attempting timing diagrams."
        )

    elif "python" in question or "code" in question:
        answer = (
            "Python-ல் சுத்தமான functions எழுதப் பயிற்சி செய்யுங்கள். List comprehensions, dictionaries மற்றும் collections, itertools போன்ற standard libraries-ஐ நன்றாகப் பயன்படுத்த கற்றுக் கொள்ளுங்கள்."
            if language == "ta" else
            "In Python, practice writing clean functions and master list comprehensions, "
            "dictionaries, and standard algorithmic libraries like `collections` and `itertools`."
        )

    elif "plan" in question or "schedule" in question:
        answer = (
            "இதோ ஒரு 3 படி படிப்பு திட்டம்:\n1. முக்கியமான பலவீனமான தலைப்புகளுக்கு 30 நிமிடங்கள் ஒதுக்குங்கள்.\n2. 3 நடுத்தர பயிற்சி கேள்விகளைத் தீர்க்குங்கள்.\n3. 10 நிமிட இடைவெளிக்குப் பிறகு active recall மூலம் உங்களைச் சோதித்துக் கொள்ளுங்கள்."
            if language == "ta" else
            "Here is a recommended 3-step study plan:\n"
            "1. Allocate 30 mins to high-priority weak topics.\n"
            "2. Complete 3 medium practice problems.\n"
            "3. Take a 10 min breather and test yourself with active recall."
        )

    else:
        answer = (
            "கருத்துகளைப் புரிந்து கொள்ளவும், பலவீனமான தலைப்புகளை அடையாளம் காணவும், தனிப்பட்ட படிப்பு திட்டத்தை உருவாக்கவும் நான் உதவ முடியும்."
            if language == "ta" else
            "I can help you understand concepts, identify weak topics "
            "and create a personalized learning plan."
        )

    return {
        "answer": answer,
        "source": "fallback",
        "language": language
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
