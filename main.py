import os
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
STATIC_DIR = os.path.join(BASE_DIR, "static")

# Mount static files directory
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR, exist_ok=True)

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

    if mastery < 50:
        message = "Start with basic concepts and practice simple questions."
    elif mastery < 75:
        message = "Revise weak topics and attempt more practice questions."
    else:
        message = "Your mastery is good. Try advanced-level questions."

    return {
        "recommendation": message
    }


@app.post("/api/ai/chat")
def ai_chat(data: dict):
    question = data.get("question", "").lower()

    if "stress" in question or "anxious" in question or "overwhelmed" in question:
        answer = (
            "Take a short break, divide the topic into smaller sections "
            "and continue learning step by step. Remember that consistency beats cramming!"
        )

    elif "math" in question or "poisson" in question or "formula" in question:
        answer = (
            "Focus on the formula first, then solve one simple example "
            "before moving to harder problems. For Poisson distributions, ensure you understand the event rate λ."
        )

    elif "circuit" in question or "dsd" in question or "asynchronous" in question:
        answer = (
            "For Asynchronous Sequential Circuits, focus on flow tables, primitive state tables, "
            "and eliminating race conditions and hazards before attempting timing diagrams."
        )

    elif "python" in question or "code" in question:
        answer = (
            "In Python, practice writing clean functions and master list comprehensions, "
            "dictionaries, and standard algorithmic libraries like `collections` and `itertools`."
        )

    elif "plan" in question or "schedule" in question:
        answer = (
            "Here is a recommended 3-step study plan:\n"
            "1. Allocate 30 mins to high-priority weak topics.\n"
            "2. Complete 3 medium practice problems.\n"
            "3. Take a 10 min breather and test yourself with active recall."
        )

    else:
        answer = (
            "I can help you understand concepts, identify weak topics "
            "and create a personalized learning plan."
        )

    return {
        "answer": answer
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
