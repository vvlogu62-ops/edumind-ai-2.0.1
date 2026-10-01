// EduMind AI Dashboard Controller

let currentStudent = null;
let currentRollNo = "25ECA001";
let masteryChartInstance = null;

// DOM Elements
const rollInput = document.getElementById("roll-input");
const btnSearchRoll = document.getElementById("btn-search-roll");
const studentPills = document.getElementById("student-pills");
const studentAvatar = document.getElementById("student-avatar");
const studentName = document.getElementById("student-name");
const studentDeptBadge = document.getElementById("student-dept-badge");
const studentRollBadge = document.getElementById("student-roll-badge");
const masteryPercent = document.getElementById("mastery-percent");
const masteryCircle = document.getElementById("mastery-circle");
const masteryRating = document.getElementById("mastery-rating");
const studentStress = document.getElementById("student-stress");
const stressIconWrap = document.getElementById("stress-icon-wrap");
const pathwayStatus = document.getElementById("pathway-status");
const recommendationText = document.getElementById("recommendation-text");
const btnAskRecommendation = document.getElementById("btn-ask-recommendation");
const subjectCardsContainer = document.getElementById("subject-cards-container");
const weakTopicsContainer = document.getElementById("weak-topics-container");
const chatGreetName = document.getElementById("chat-greet-name");
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const btnClearChat = document.getElementById("btn-clear-chat");
const studentModal = document.getElementById("student-modal");
const btnOpenModal = document.getElementById("btn-open-modal");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnCancelModal = document.getElementById("btn-cancel-modal");
const studentForm = document.getElementById("student-form");

// Toast Notification
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg text-white pointer-events-auto transition-all duration-300 transform translate-y-2 opacity-0 flex items-center gap-2 ${
        type === "success" ? "bg-emerald-600" :
        type === "error" ? "bg-rose-600" : "bg-indigo-600"
    }`;
    const icon = type === "success" ? "fa-circle-check" : type === "error" ? "fa-circle-exclamation" : "fa-circle-info";
    toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove("translate-y-2", "opacity-0");
    }, 10);

    setTimeout(() => {
        toast.classList.add("translate-y-2", "opacity-0");
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Check Backend Health
async function checkHealth() {
    try {
        const res = await fetch("/");
        if (res.ok) {
            const data = await res.json();
            const statusEl = document.getElementById("server-status");
            const mobileStatusEl = document.getElementById("server-status-mobile");
            if (statusEl) statusEl.innerText = "Online";
            if (mobileStatusEl) mobileStatusEl.innerText = "Online";
        }
    } catch (e) {
        console.warn("Backend connection check:", e);
    }
}

// Fetch all students for quick selector
async function loadStudentList() {
    try {
        const res = await fetch("/api/students");
        if (!res.ok) throw new Error("Failed to load students");
        const data = await res.json();
        if (data.success && data.students) {
            renderStudentPills(data.students);
        }
    } catch (err) {
        console.error("Error loading student list:", err);
    }
}

// Render student quick pills
function renderStudentPills(students) {
    studentPills.innerHTML = "";
    students.forEach(st => {
        const btn = document.createElement("button");
        const isActive = st.roll_no === currentRollNo;
        btn.className = `px-3 py-1 rounded-lg text-xs font-semibold transition ${
            isActive 
            ? "bg-indigo-600 text-white shadow-sm" 
            : "text-slate-400 hover:text-white hover:bg-slate-700/60"
        }`;
        btn.innerText = `${st.name} (${st.roll_no})`;
        btn.onclick = () => {
            currentRollNo = st.roll_no;
            rollInput.value = st.roll_no;
            loadStudent(st.roll_no);
            loadStudentList();
        };
        studentPills.appendChild(btn);
    });
}

// Load a specific student
async function loadStudent(rollNo) {
    try {
        const res = await fetch(`/api/student/${rollNo}`);
        const data = await res.json();

        if (!data.success || !data.student) {
            showToast(`Student ${rollNo} not found`, "error");
            return;
        }

        currentStudent = data.student;
        currentRollNo = rollNo;
        renderStudentProfile(currentStudent, rollNo);
        fetchAiRecommendation(currentStudent.overall_mastery);
        renderSubjects(currentStudent.subjects || []);
        renderWeakTopics(currentStudent.weak_topics || []);
        updateMasteryChart(currentStudent.subjects || []);
        showToast(`Loaded profile for ${currentStudent.name}`, "success");
    } catch (err) {
        console.error("Error loading student:", err);
        showToast("Error connecting to EduMind API", "error");
    }
}

// Render Student Profile Details
function renderStudentProfile(student, rollNo) {
    studentName.innerText = student.name;
    chatGreetName.innerText = student.name;
    studentAvatar.innerText = (student.name || "U")[0].toUpperCase();
    studentDeptBadge.innerText = student.department || "GEN";
    studentRollBadge.innerText = rollNo;

    // Mastery Circular Gauge
    const mastery = Math.round(student.overall_mastery || 0);
    masteryPercent.innerText = `${mastery}%`;
    const circumference = 2 * Math.PI * 20; // r=20
    const offset = circumference - (mastery / 100) * circumference;
    masteryCircle.style.strokeDasharray = `${circumference}`;
    masteryCircle.style.strokeDashoffset = `${offset}`;

    // Mastery Rating & Colors
    if (mastery >= 75) {
        masteryRating.innerText = "Exemplary";
        masteryRating.className = "text-xs font-bold text-emerald-400";
        masteryCircle.setAttribute("class", "text-emerald-500 gauge-circle");
        pathwayStatus.innerText = "Advanced Challenges";
        pathwayStatus.className = "text-xs font-bold text-emerald-300";
    } else if (mastery >= 50) {
        masteryRating.innerText = "Proficient";
        masteryRating.className = "text-xs font-bold text-indigo-400";
        masteryCircle.setAttribute("class", "text-indigo-500 gauge-circle");
        pathwayStatus.innerText = "Targeted Practice";
        pathwayStatus.className = "text-xs font-bold text-indigo-300";
    } else {
        masteryRating.innerText = "Developing";
        masteryRating.className = "text-xs font-bold text-rose-400";
        masteryCircle.setAttribute("class", "text-rose-500 gauge-circle");
        pathwayStatus.innerText = "Fundamentals Review";
        pathwayStatus.className = "text-xs font-bold text-rose-300";
    }

    // Stress Level Styling
    const stress = (student.stress_level || "Moderate").toLowerCase();
    studentStress.innerText = student.stress_level || "Moderate";
    
    if (stress === "low") {
        studentStress.className = "text-xs font-bold text-emerald-400";
        stressIconWrap.className = "w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg border border-emerald-500/30";
    } else if (stress === "high") {
        studentStress.className = "text-xs font-bold text-rose-400";
        stressIconWrap.className = "w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-lg border border-rose-500/30";
    } else {
        studentStress.className = "text-xs font-bold text-amber-300";
        stressIconWrap.className = "w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg border border-amber-500/30";
    }
}

// Fetch AI Recommendation from backend /api/ai/recommend
async function fetchAiRecommendation(mastery) {
    try {
        recommendationText.innerText = "Analyzing academic profile...";
        const res = await fetch("/api/ai/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mastery: mastery })
        });
        const data = await res.json();
        recommendationText.innerText = `"${data.recommendation}"`;
    } catch (err) {
        console.error("Error fetching recommendation:", err);
        recommendationText.innerText = "Could not fetch AI recommendation at this time.";
    }
}

// Render Subject Mastery Cards
function renderSubjects(subjects) {
    subjectCardsContainer.innerHTML = "";
    if (!subjects.length) {
        subjectCardsContainer.innerHTML = `<div class="col-span-2 text-slate-500 text-xs py-4 text-center">No subjects recorded</div>`;
        return;
    }

    subjects.forEach(sub => {
        const card = document.createElement("div");
        card.className = "bg-slate-900/60 p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 transition group";
        
        let colorClass = "from-indigo-500 to-sky-400";
        let textBadge = "text-indigo-400 bg-indigo-500/10";
        if (sub.mastery >= 75) {
            colorClass = "from-emerald-500 to-teal-400";
            textBadge = "text-emerald-400 bg-emerald-500/10";
        } else if (sub.mastery < 50) {
            colorClass = "from-rose-500 to-orange-400";
            textBadge = "text-rose-400 bg-rose-500/10";
        }

        card.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-slate-200 text-sm">${sub.name}</span>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-md ${textBadge}">${sub.mastery}%</span>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
                <div class="bg-gradient-to-r ${colorClass} h-2 rounded-full transition-all duration-700" style="width: ${sub.mastery}%"></div>
            </div>
            <div class="flex items-center justify-between pt-1">
                <span class="text-[11px] text-slate-400">Mastery Level</span>
                <button class="btn-subject-advice text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform" data-subject="${sub.name}" data-score="${sub.mastery}">
                    <span>Ask AI</span>
                    <i class="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
            </div>
        `;
        subjectCardsContainer.appendChild(card);
    });

    // Attach listeners to "Ask AI" buttons
    document.querySelectorAll(".btn-subject-advice").forEach(btn => {
        btn.addEventListener("click", () => {
            const subject = btn.getAttribute("data-subject");
            const score = btn.getAttribute("data-score");
            const prompt = `How can I improve my score in ${subject}? My current mastery is ${score}%.`;
            handleUserChat(prompt);
        });
    });
}

// Render Weak Topics
function renderWeakTopics(topics) {
    weakTopicsContainer.innerHTML = "";
    if (!topics.length) {
        weakTopicsContainer.innerHTML = `<span class="text-xs text-slate-500">No weak topics flagged. Great work!</span>`;
        return;
    }

    topics.forEach(topic => {
        const chip = document.createElement("button");
        chip.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 text-xs font-medium transition group";
        chip.innerHTML = `
            <i class="fa-solid fa-lightbulb text-[10px] text-rose-400 group-hover:scale-110 transition-transform"></i>
            <span>${topic}</span>
            <span class="text-[10px] opacity-60 ml-1">Ask AI</span>
        `;
        chip.addEventListener("click", () => {
            const prompt = `Can you explain the concept of "${topic}" and how to master it?`;
            handleUserChat(prompt);
        });
        weakTopicsContainer.appendChild(chip);
    });
}

// Update Chart.js Radar/Bar Graph
function updateMasteryChart(subjects) {
    const ctx = document.getElementById("masteryChart");
    if (!ctx) return;

    const labels = subjects.map(s => s.name);
    const scores = subjects.map(s => s.mastery);
    const benchmarks = subjects.map(() => 75);

    if (masteryChartInstance) {
        masteryChartInstance.destroy();
    }

    masteryChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Student Mastery",
                    data: scores,
                    backgroundColor: "rgba(99, 102, 241, 0.7)",
                    borderColor: "#6366f1",
                    borderWidth: 1.5,
                    borderRadius: 6,
                },
                {
                    label: "Class Benchmark (75%)",
                    data: benchmarks,
                    backgroundColor: "rgba(71, 85, 105, 0.3)",
                    borderColor: "#64748b",
                    borderWidth: 1,
                    borderDash: [5, 5],
                    borderRadius: 6,
                    type: "line",
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: "#1e293b",
                    titleColor: "#f8fafc",
                    bodyColor: "#cbd5e1",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderWidth: 1,
                    padding: 10,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: "rgba(255, 255, 255, 0.05)"
                    },
                    ticks: {
                        color: "#94a3b8",
                        font: { size: 10 },
                        callback: val => `${val}%`
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: "#cbd5e1",
                        font: { size: 11, weight: "bold" }
                    }
                }
            }
        }
    });
}

// Chatbot functionality
function appendMessage(sender, text) {
    const isUser = sender === "user";
    const msgDiv = document.createElement("div");
    msgDiv.className = `flex items-start gap-2.5 ${isUser ? "justify-end" : "justify-start"}`;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isUser) {
        msgDiv.innerHTML = `
            <div class="chat-msg-user p-3 rounded-2xl max-w-[85%] shadow-sm">
                <p class="text-white text-xs">${escapeHtml(text)}</p>
                <div class="text-[9px] text-indigo-200 text-right mt-1">${timestamp}</div>
            </div>
            <div class="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5 shadow-sm">
                ${(currentStudent?.name || "U")[0].toUpperCase()}
            </div>
        `;
    } else {
        msgDiv.innerHTML = `
            <div class="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                <i class="fa-solid fa-robot"></i>
            </div>
            <div class="chat-msg-bot p-3 rounded-2xl max-w-[85%] shadow-sm">
                <p class="text-slate-200 text-xs whitespace-pre-line">${escapeHtml(text)}</p>
                <div class="text-[9px] text-slate-500 mt-1">${timestamp}</div>
            </div>
        `;
    }

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.id = "chat-typing-indicator";
    typingDiv.className = "flex items-start gap-2.5";
    typingDiv.innerHTML = `
        <div class="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 text-xs">
            <i class="fa-solid fa-robot"></i>
        </div>
        <div class="chat-msg-bot p-3 rounded-2xl max-w-[85%] flex items-center gap-1.5 py-3.5">
            <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full typing-dot"></div>
            <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full typing-dot"></div>
            <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full typing-dot"></div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById("chat-typing-indicator");
    if (indicator) indicator.remove();
}

async function handleUserChat(text) {
    if (!text || !text.trim()) return;
    const query = text.trim();
    appendMessage("user", query);

    showTypingIndicator();

    try {
        const res = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: query })
        });
        const data = await res.json();
        removeTypingIndicator();
        appendMessage("bot", data.answer || "I am analyzing your query.");
    } catch (err) {
        removeTypingIndicator();
        appendMessage("bot", "Sorry, I am having trouble connecting to the advisory engine. Please verify the server is running.");
    }
}

// Utility: HTML escape
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    checkHealth();
    loadStudentList();
    loadStudent(currentRollNo);

    // Roll number search button
    btnSearchRoll.addEventListener("click", () => {
        const val = rollInput.value.trim().toUpperCase();
        if (val) {
            loadStudent(val);
        }
    });

    rollInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const val = rollInput.value.trim().toUpperCase();
            if (val) loadStudent(val);
        }
    });

    // Chat form submit
    chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const val = chatInput.value;
        chatInput.value = "";
        handleUserChat(val);
    });

    // Quick Prompt Chips
    document.querySelectorAll(".chip-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const prompt = btn.getAttribute("data-prompt");
            handleUserChat(prompt);
        });
    });

    // Consult AI Tutor from recommendation banner
    btnAskRecommendation.addEventListener("click", () => {
        const rec = recommendationText.innerText;
        handleUserChat(`The recommendation for me is ${rec}. How should I execute this plan efficiently?`);
    });

    // Clear Chat
    btnClearChat.addEventListener("click", () => {
        chatMessages.innerHTML = `
            <div class="flex items-start gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    <i class="fa-solid fa-robot"></i>
                </div>
                <div class="chat-msg-bot p-3.5 rounded-2xl max-w-[85%] shadow-sm">
                    <p class="font-medium text-white mb-1">Chat reset ✨</p>
                    <p class="text-slate-300">How can I assist your studies today?</p>
                </div>
            </div>
        `;
        showToast("Conversation cleared", "info");
    });

    // Modal controls
    btnOpenModal.addEventListener("click", () => {
        studentModal.classList.remove("hidden");
        studentModal.classList.add("flex");
    });

    const closeModal = () => {
        studentModal.classList.add("hidden");
        studentModal.classList.remove("flex");
    };

    btnCloseModal.addEventListener("click", closeModal);
    btnCancelModal.addEventListener("click", closeModal);

    studentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const roll = document.getElementById("modal-roll").value.trim().toUpperCase();
        const name = document.getElementById("modal-name").value.trim();
        const dept = document.getElementById("modal-dept").value.trim().toUpperCase();
        const mastery = parseInt(document.getElementById("modal-mastery").value, 10) || 50;
        const stress = document.getElementById("modal-stress").value;
        const rawSubs = document.getElementById("modal-subjects").value.trim();
        const rawTopics = document.getElementById("modal-topics").value.trim();

        // Parse subjects e.g. "Maths: 80, Physics: 70"
        let subjects = [];
        if (rawSubs) {
            subjects = rawSubs.split(",").map(part => {
                const [sName, sScore] = part.split(":");
                return {
                    name: sName ? sName.trim() : "Subject",
                    mastery: sScore ? parseInt(sScore.trim(), 10) || 70 : 70
                };
            });
        } else {
            subjects = [
                { name: "Core Theory", mastery: mastery },
                { name: "Lab & Practice", mastery: mastery + 5 }
            ];
        }

        // Parse topics e.g. "Topic A, Topic B"
        let weakTopics = [];
        if (rawTopics) {
            weakTopics = rawTopics.split(",").map(t => t.trim()).filter(Boolean);
        }

        const payload = {
            roll_no: roll,
            name: name,
            department: dept,
            overall_mastery: mastery,
            stress_level: stress,
            subjects: subjects,
            weak_topics: weakTopics
        };

        try {
            const res = await fetch("/api/student", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                closeModal();
                studentForm.reset();
                showToast(`Saved profile for ${name}!`, "success");
                loadStudentList();
                loadStudent(roll);
            }
        } catch (err) {
            console.error("Save error:", err);
            showToast("Failed to save student profile", "error");
        }
    });
});
