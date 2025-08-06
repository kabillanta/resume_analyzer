from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
from pydantic import BaseModel
import os
import tempfile

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3, api_key= os.getenv("GOOGLE_API_KEY"))

class Job(BaseModel):
    id: str
    title: str
    company: str
    skills: str
    experience: str
    description: str

jobs = [
    Job(
        id="job-ai-001",
        title="AI/ML Engineer",
        company="Company Name",
        skills="Python, TensorFlow, PyTorch, Machine Learning, Deep Learning, SQL",
        experience="2+ years working on AI/ML pipelines",
        description="Design, build, and deploy AI/ML models to solve business problems."
    ),
    Job(
        id="job-fe-002",
        title="Frontend Developer",
        company="Company Name",
        skills="React, JavaScript, HTML, CSS, Tailwind, Redux",
        experience="2+ years in frontend web development",
        description="Build responsive and accessible user interfaces using modern web technologies."
    ),
    Job(
        id="job-be-003",
        title="Backend Developer",
        company="Company Name",
        skills="Python, FastAPI, SQL, PostgreSQL, REST APIs, Docker",
        experience="3+ years in backend or API development",
        description="Develop scalable backend services and APIs for our enterprise products."
    ),
    Job(
        id="job-ds-004",
        title="Data Scientist",
        company="Company Name",
        skills="Python, Pandas, NumPy, Scikit-learn, Data Visualization, Statistics",
        experience="2+ years in data science roles",
        description="Perform data analysis and build predictive models on large datasets."
    ),
    Job(
        id="job-devops-005",
        title="DevOps Engineer",
        company="Company Name",
        skills="AWS, CI/CD, Docker, Kubernetes, Linux, Monitoring Tools",
        experience="3+ years in DevOps or SRE roles",
        description="Implement and manage scalable infrastructure using modern DevOps tools and practices."
    )
]

@app.get("/jobs", response_model=list[Job])
def get_jobs():
    return jobs

def extract_text_from_pdf(file_path):
    with fitz.open(file_path) as doc:
        return "\n".join([page.get_text() for page in doc])

def analyze_resume(resume_text, job: Job):
    prompt = f"""
You are an AI career assistant for students and early-career candidates.
Analyze the following resume compared to the job role, and provide supportive, motivating feedback.
Return:
1. Match Score (0-100) – Be honest but encouraging.
2. Matched Skills – List what aligns.
3. Skills to Work On – Use positive tone.
4. Feedback & Suggestions – Share actionable tips, reassure that gaps are okay, and motivate them to grow.
Resume:  
{resume_text}
Job Role: {job.title} at {job.company}  
Skills Required: {job.skills}  
Experience Needed: {job.experience}  
Description: {job.description}
"""
    result = llm.invoke([HumanMessage(content=prompt)])
    return result.content

@app.post("/analyze")
async def analyze_resume_endpoint(file: UploadFile = File(...), job_id: str = Form(...)):
    job = next((j for j in jobs if j.id == job_id), None)
    if not job:
        return {"error": "Invalid job ID selected."}

    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(await file.read())
        resume_text = extract_text_from_pdf(tmp.name)

    result = analyze_resume(resume_text, job)
    return {
        "job_title": job.title,
        "company": job.company,
        "result": result
    }
