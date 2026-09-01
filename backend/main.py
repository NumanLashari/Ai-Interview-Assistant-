from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
from backend.ai import run_interview, get_interview_state

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StartRequest(BaseModel):
    user_message: str

class AnswerRequest(BaseModel):
    thread_id: str
    pending_answers: dict

class ContinueRequest(BaseModel):
    thread_id: str
    continue_interview: bool

@app.post("/interview/start")
def start_interview(req: StartRequest):
    thread_id = str(uuid.uuid4())
    result = run_interview(thread_id=thread_id, user_message=req.user_message)
    return {
        "thread_id": thread_id,
        "phase": result.get("phase"),
        "questions": result.get("interview_questions", "")
    }

@app.post("/interview/answer") 
def submit_answers(req: AnswerRequest):
    result = run_interview(thread_id=req.thread_id, pending_answers=req.pending_answers)
    return {
        "thread_id": req.thread_id,
        "phase": result.get("phase"),
        "questions": result.get("interview_questions", ""),
        "feedback": result.get("feedback", ""),
        "score": result.get("score", 0)
    }

@app.post("/interview/continue")
def continue_interview_endpoint(req: ContinueRequest):
    result = run_interview(thread_id=req.thread_id, continue_interview=req.continue_interview)
    return {
        "thread_id": req.thread_id,
        "phase": result.get("phase"),
        "questions": result.get("interview_questions", ""),
        "feedback": result.get("feedback", ""),
        "score": result.get("score", 0)
    }