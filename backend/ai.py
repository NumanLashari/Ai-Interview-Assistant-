from langgraph.checkpoint.sqlite import SqliteSaver
import re
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langgraph.graph import StateGraph, START, END
from langchain_ollama import ChatOllama
from typing import TypedDict, Optional

# ============================================================
# LLM
# ============================================================

llm = ChatOllama(
    model="qwen2.5:0.5b",
    temperature=0
)

def create_rag():
    loader = TextLoader(
        "python/python.txt",
        encoding="utf-8"
    )
    docs = loader.load()
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_documents(docs)
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory="./chroma_db"
    )
    return vectorstore

vectorstore = create_rag()
retriever = vectorstore.as_retriever(
    search_kwargs={"k": 3}
)

# ============================================================
# STATE
# ============================================================

class State(TypedDict):
    user_message: str
    analysis_report: str
    interview_questions: str
    user_answers: str
    feedback: str
    previous_questions: str
    previous_answers: str
    continue_interview: str
    score: int
    round_count: int
    pending_answers: Optional[dict]
    phase: str  # Track current phase

# ============================================================
# 1. ANALYZE ROLE
# ============================================================

def analyze(state):
    print("📊 Analyzing role...")
    response = llm.invoke(
        f"""
        You are a professional technical recruiter.
        Analyze ONLY the following job role: {state["user_message"]}
        Identify technical skills, technologies, and core concepts.
        """
    )
    return {
        "analysis_report": response.content,
        "phase": "analyzed"
    }

# ============================================================
# 2. GENERATE INITIAL INTERVIEW QUESTIONS
# ============================================================

def questions(state):
    print("📝 Generating questions...")
    docs = retriever.invoke(state["user_message"])
    context = "\n\n".join(doc.page_content for doc in docs)

    response = llm.invoke(
        f"""
        You are an interview question generator.
        JOB ROLE: {state["user_message"]}
        ROLE ANALYSIS: {state["analysis_report"]}
        KNOWLEDGE BASE: {context}
        PREVIOUS QUESTIONS: {state["previous_questions"]}

        Generate EXACTLY 3 interview questions. Do NOT write answers, markdown, or explanations.
        Format strictly as:
        1. [question]
        2. [question]
        3. [question]
        """
    )

    new_questions = response.content.strip()

    return {
        "interview_questions": new_questions,
        "previous_questions": state["previous_questions"] + "\n" + new_questions,
        "phase": "questions_ready"
    }

# ============================================================
# 3. COLLECT USER ANSWERS
# ============================================================

def answers(state):
    print("📥 Processing answers...")
    pending = state.get("pending_answers", {})
    
    if not pending.get("answer1") or not pending.get("answer2") or not pending.get("answer3"):
        print("⏳ Waiting for answers from API...")
        return {
            "phase": "awaiting_answers",
            "interview_questions": state["interview_questions"]
        }
    
    user_answers = f"""
Question 1: {pending['answer1']}
Question 2: {pending['answer2']}
Question 3: {pending['answer3']}
"""

    print("✅ Answers received and processed")
    
    return {
        "user_answers": user_answers,
        "previous_answers": state["previous_answers"] + "\n" + user_answers,
        "pending_answers": {},
        "phase": "answers_submitted"
    }

# ============================================================
# 4. EVALUATE ANSWERS (Increment round count here!)
# ============================================================

def evaluate(state):
    print("⭐ Evaluating answers...")
    response = llm.invoke(
        f"""
        You are a technical interviewer.
        Job Role: {state["user_message"]}
        Interview Questions: {state["interview_questions"]}
        Candidate Answers: {state["user_answers"]}
        Give an overall score from 0 to 10. Your response MUST start with the score (e.g., 8).
        """
    )

    text = response.content.strip()
    match = re.search(r'\b(10|[0-9])\b', text)
    score = int(match.group(1)) if match else 0
    score = max(0, min(score, 10))

    # 🔴 Increment completed round count here correctly
    current_round = state.get("round_count", 0) + 1
    print(f"📊 Score: {score}/10 | Completed Rounds: {current_round}")

    # Pause every 3 completed rounds to prompt user to continue or end
    if current_round >= 3:
        print("⏸️ 3 Rounds complete - Prompting user to continue")
        return {
            "score": score,
            "round_count": current_round,
            "phase": "continue_prompt"
        }

    return {
        "score": score,
        "round_count": current_round,
        "phase": "evaluated"
    }

# ============================================================
# 4.5. PROCESS CONTINUE DECISION
# ============================================================

def process_resume(state):
    print("🔄 Processing continue decision...")
    decision = state.get("continue_interview", "True")
    
    if str(decision).lower() in ["false", "no", "0"]:
        print("🛑 User chose to end - Going to feedback")
        return {"phase": "end_interview"}
        
    # Reset round count to loop for another 3 rounds if they choose to continue
    return {"continue_interview": "", "round_count": 0, "phase": "resumed"}

# ============================================================
# 5. HARD QUESTIONS
# ============================================================

def hard_questions(state):
    print("🔴 Generating hard questions...")
    response = llm.invoke(
        f"""
        You are a senior technical interviewer. Generate exactly 3 NEW HARD interview questions for {state["user_message"]}.
        Previous Questions: {state["previous_questions"]}
        Return ONLY 3 numbered questions.
        """
    )
    new_questions = response.content.strip()
    return {
        "interview_questions": new_questions,
        "previous_questions": state["previous_questions"] + "\n" + new_questions,
        "phase": "questions_ready"
    }

# ============================================================
# 6. MEDIUM QUESTIONS
# ============================================================

def medium_questions(state):
    print("🟡 Generating medium questions...")
    response = llm.invoke(
        f"""
        You are a technical interviewer. Generate exactly 3 NEW MEDIUM difficulty interview questions for {state["user_message"]}.
        Previous Questions: {state["previous_questions"]}
        Return ONLY 3 numbered questions.
        """
    )
    new_questions = response.content.strip()
    return {
        "interview_questions": new_questions,
        "previous_questions": state["previous_questions"] + "\n" + new_questions,
        "phase": "questions_ready"
    }

# ============================================================
# 7. EASY QUESTIONS
# ============================================================

def easy_questions(state):
    print("🟢 Generating easy questions...")
    response = llm.invoke(
        f"""
        You are a technical interviewer. Generate exactly 3 NEW BEGINNER interview questions for {state["user_message"]}.
        Previous Questions: {state["previous_questions"]}
        Return ONLY 3 numbered questions.
        """
    )
    new_questions = response.content.strip()
    return {
        "interview_questions": new_questions,
        "previous_questions": state["previous_questions"] + "\n" + new_questions,
        "phase": "questions_ready"
    }

# ============================================================
# 8. FINAL FEEDBACK
# ============================================================

def feedback(state):
    print("📊 Generating feedback...")
    docs = retriever.invoke(state["previous_questions"])
    context = "\n\n".join(doc.page_content for doc in docs)

    response = llm.invoke(
        f"""
        You are a senior technical interviewer. Evaluate the candidate's interview performance.
        Job Role: {state["user_message"]}
        Role Analysis: {state["analysis_report"]}
        KNOWLEDGE BASE: {context}
        Interview History: {state["previous_questions"]}
        Candidate Answer History: {state["previous_answers"]}

        Provide a comprehensive final report with score, strong areas, weak areas, and recommendations.
        """
    )

    return {
        "feedback": response.content,
        "phase": "feedback"
    }

# ============================================================
# 9. ROUTING & DECISION EDGES
# ============================================================

def should_continue_after_answers(state):
    if state.get("phase") == "awaiting_answers":
        print("⏸️ Pausing graph execution to wait for frontend answers...")
        return "end"
    return "evaluate"

def route_after_evaluate(state):
    phase = state.get("phase")
    if phase == "continue_prompt":
        return "continue_prompt"
    score = state.get("score", 0)
    if score >= 8:
        return "hard_questions"
    elif score >= 5:
        return "medium_questions"
    else:
        return "easy_questions"

def route_after_resume(state):
    phase = state.get("phase")
    if phase == "end_interview":
        return "feedback"
    score = state.get("score", 0)
    if score >= 8:
        return "hard_questions"
    elif score >= 5:
        return "medium_questions"
    else:
        return "easy_questions"

def route_start(state):
    phase = state.get("phase")
    if phase == "awaiting_answers":
        return "answers"
    if phase == "continue_prompt":
        return "process_resume"
    return "analyze"

# ============================================================
# CREATE GRAPH
# ============================================================

print("🔄 Building LangGraph...")
builder = StateGraph(State)

builder.add_node("analyze", analyze)
builder.add_node("questions", questions)
builder.add_node("answers", answers)
builder.add_node("evaluate", evaluate)
builder.add_node("process_resume", process_resume)
builder.add_node("hard_questions", hard_questions)
builder.add_node("medium_questions", medium_questions)
builder.add_node("easy_questions", easy_questions)
builder.add_node("feedback", feedback)

builder.add_conditional_edges(START, route_start)

builder.add_edge("analyze", "questions")
builder.add_edge("questions", "answers")

builder.add_conditional_edges(
    "answers",
    should_continue_after_answers,
    {
        "evaluate": "evaluate",
        "end": END
    }
)

builder.add_conditional_edges(
    "evaluate",
    route_after_evaluate,
    {
        "hard_questions": "hard_questions",
        "medium_questions": "medium_questions",
        "easy_questions": "easy_questions",
        "continue_prompt": END
    }
)

builder.add_conditional_edges(
    "process_resume",
    route_after_resume,
    {
        "feedback": "feedback",
        "hard_questions": "hard_questions",
        "medium_questions": "medium_questions",
        "easy_questions": "easy_questions"
    }
)

builder.add_edge("hard_questions", "answers")
builder.add_edge("medium_questions", "answers")
builder.add_edge("easy_questions", "answers")
builder.add_edge("feedback", END)

print("✅ LangGraph built successfully!")

# ============================================================
# GET INTERVIEW STATE
# ============================================================

def get_interview_state(thread_id: str):
    try:
        with SqliteSaver.from_conn_string("interview.db") as checkpointer:
            app = builder.compile(checkpointer=checkpointer)
            config = {"configurable": {"thread_id": thread_id}}
            state = app.get_state(config)
            return state.values if state.values else {}
    except:
        return {}

# ============================================================
# RUN INTERVIEW
# ============================================================

print("\n")
print("============================================================")
print("            AI INTERVIEW PREPARATION ASSISTANT")
print("============================================================")

def run_interview(thread_id: str, user_message=None, pending_answers=None, continue_interview=None):
    print(f"\n🚀 Running interview for thread: {thread_id}")
    
    config = {
        "configurable": {
            "thread_id": thread_id
        }
    }

    with SqliteSaver.from_conn_string("interview.db") as checkpointer:
        app = builder.compile(checkpointer=checkpointer)
        
        state_update = None
        if user_message:
            state_update = {
                "user_message": user_message,
                "analysis_report": "",
                "interview_questions": "",
                "user_answers": "",
                "previous_questions": "",
                "previous_answers": "",
                "continue_interview": "",
                "score": 0,
                "feedback": "",
                "round_count": 0,
                "pending_answers": {},
                "phase": "start"
            }
        elif pending_answers:
            state_update = {
                "pending_answers": pending_answers,
                "phase": "awaiting_answers"
            }
        elif continue_interview is not None:
            state_update = {
                "continue_interview": str(continue_interview),
                "phase": "continue_prompt"
            }

        if state_update is not None:
            result = app.invoke(state_update, config=config)
        else:
            state = app.get_state(config)
            result = state.values if state else {}

    print(f"✅ Interview step complete! Phase: {result.get('phase')}")
    return result