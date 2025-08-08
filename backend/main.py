# /backend/main.py

import os
import re
import spacy
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from transformers import pipeline
import logging
from dotenv import load_dotenv
import uvicorn
import tempfile
import aiofiles
from contextlib import asynccontextmanager
import PyPDF2
import docx

# --- Models and State ---
ml_models: Dict[str, any] = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("Application startup...")
    logging.info("Loading spaCy model 'en_core_web_sm'...")
    ml_models["nlp_ner"] = spacy.load("en_core_web_sm")
    logging.info("spaCy model loaded successfully.")

    logging.info("Loading Hugging Face classifier 'facebook/bart-large-mnli'...")
    ml_models["classifier"] = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    logging.info("Hugging Face classifier loaded successfully.")
    
    yield
    
    logging.info("Application shutdown...")
    ml_models.clear()

# --- App Initialization ---
app = FastAPI(
    title="AI Resume Analyzer API",
    description="An API that uses NLP to parse and analyze resumes.",
    version="2.4.0", # NEW: Version updated for Weighted Scoring
    lifespan=lifespan
)

# --- Logging Configuration ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- CORS Middleware ---
origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class ParsedResume(BaseModel):
    name: Optional[str] = Field(None, description="Candidate's full name.")
    email: Optional[str] = Field(None, description="Candidate's email address.")
    mobile_number: Optional[str] = Field(None, description="Candidate's mobile number.")
    skills: Optional[List[str]] = Field([], description="List of skills extracted from the resume.")

class AnalysisResult(BaseModel):
    filename: str = Field(..., description="Name of the uploaded resume file.")
    raw_text: str = Field(..., description="The full text extracted from the resume.")
    parsed_data: ParsedResume = Field(..., description="Data parsed from the resume.")
    skill_analysis: Optional[dict] = Field({}, description="Analysis of skills categorized by domain.")
    key_entities: Optional[dict] = Field({}, description="Key entities found in the resume.")

class JobMatchRequest(BaseModel):
    resume_skills: List[str]
    job_description_text: str

class JobMatchResult(BaseModel):
    match_score: int
    matched_keywords: List[str]
    missing_keywords: List[str]

# --- Text Extraction Helpers ---
def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    with open(file_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() or ""
    return text

def extract_text_from_docx(file_path: str) -> str:
    doc = docx.Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

async def extract_text_from_file(file: UploadFile, temp_dir: str) -> str:
    file_path = os.path.join(temp_dir, file.filename)
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    if file.filename.lower().endswith('.pdf'):
        return extract_text_from_pdf(file_path)
    elif file.filename.lower().endswith('.docx'):
        return extract_text_from_docx(file_path)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a .pdf or .docx file.")

# --- Parsing Helpers (Improved Engine) ---
SKILLS_DB = [
    'python', 'java', 'c++', 'javascript', 'react', 'node.js', 'sql', 'git',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'machine learning', 'data analysis',
    'project management', 'agile', 'scrum', 'communication', 'teamwork', 'leadership',
    'problem solving', 'html', 'css', 'power bi', 'excel', 'mongodb', 'restful apis',
    'ci/cd', 'system design', 'microservices', 'postgresql', 'vue.js'
]

def extract_name(raw_text, doc):
    first_200_chars = raw_text.strip()[:200]
    match = re.search(r'\b([A-Z]{2,}\s[A-Z]{2,})\b', first_200_chars)
    if match:
        potential_name = match.group(0)
        headings = ["SKILLS", "INTEREST", "PROJECTS", "EDUCATION", "CERTIFICATIONS"]
        if not any(heading in potential_name for heading in headings):
              return potential_name.title()

    person_ents = [ent.text.strip() for ent in doc.ents if ent.label_ == "PERSON"]
    if not person_ents:
        return None
    
    for name in person_ents:
        if len(name.split()) > 1:
            if not any(skill in name.lower() for skill in ['javascript', 'python', 'java', 'css']):
                  return name
            
    for name in person_ents:
        if name.lower() not in SKILLS_DB:
            return name

    return person_ents[0] if person_ents else None


def extract_email(text):
    match = re.search(r'[\w\.-]+@[\w\.-]+', text)
    return match.group(0) if match else None

def extract_phone_number(text):
    match = re.search(r'(\(?\d{3}\)?[\s\.-]?)?\d{3}[\s\.-]?\d{4}', text)
    return match.group(0) if match else None

def extract_skills(text):
    found_skills = set()
    for skill in SKILLS_DB:
        if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE):
            found_skills.add(skill)
    return sorted(list(found_skills))

# --- Analysis Helpers (Improved Engine) ---
MANUAL_SKILL_CATEGORIES = {
    "Technical": ['react', 'java', 'python', 'c++', 'javascript', 'node.js', 'sql', 'git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'html', 'css', 'power bi', 'excel', 'mongodb', 'postgresql', 'vue.js'],
    "Management": ['project management', 'agile', 'scrum'],
    "Soft Skills": ['communication', 'teamwork', 'leadership', 'problem solving'],
    "Data Science": ['machine learning', 'data analysis']
}

def analyze_skills_with_classifier(skills: List[str]):
    # This function remains unchanged
    if not skills:
        return {}
    analysis = {"categories": {cat: [] for cat in MANUAL_SKILL_CATEGORIES.keys()}}
    categorized_skills = set()
    for category, manual_skills in MANUAL_SKILL_CATEGORIES.items():
        for skill in skills:
            if skill.lower() in manual_skills:
                analysis["categories"][category].append(skill)
                categorized_skills.add(skill)
    remaining_skills = [skill for skill in skills if skill not in categorized_skills]
    if remaining_skills and "classifier" in ml_models:
        candidate_labels = ["Technical", "Management", "Soft Skills", "Design", "Data Science", "Software Engineering"]
        for skill in remaining_skills:
            res = ml_models["classifier"](skill, candidate_labels, multi_label=False)
            best_cat = res['labels'][0]
            if best_cat not in analysis["categories"]:
                analysis["categories"][best_cat] = []
            analysis["categories"][best_cat].append(skill)
    analysis["categories"] = {k: v for k, v in analysis["categories"].items() if v}
    return analysis

def extract_key_entities(doc):
    # This function remains unchanged
    if not doc:
        return {}
    entities = {
        "organizations": sorted(list(set([ent.text for ent in doc.ents if ent.label_ == "ORG"]))),
        "persons": sorted(list(set([ent.text for ent in doc.ents if ent.label_ == "PERSON"]))),
        "locations": sorted(list(set([ent.text for ent in doc.ents if ent.label_ in ["GPE", "LOC"]])))
    }
    return entities

# --- API Endpoints ---
@app.get("/", tags=["Status"])
async def read_root():
    return {"status": "ok", "message": "Welcome to the AI Resume Analyzer API v2.4!"}

@app.post("/analyze/", response_model=AnalysisResult, tags=["Analysis"])
async def analyze_resume(file: UploadFile = File(...)):
    # This endpoint remains unchanged
    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            raw_text = await extract_text_from_file(file, temp_dir)
            if not raw_text.strip():
                raise HTTPException(status_code=422, detail="Could not extract text from the resume.")
        except Exception as e:
            logging.error(f"Text extraction failed: {e}")
            raise HTTPException(status_code=500, detail=f"Error processing file: {e}")

        doc = ml_models["nlp_ner"](raw_text)

        parsed_data = ParsedResume(
            name=extract_name(raw_text, doc),
            email=extract_email(raw_text),
            mobile_number=extract_phone_number(raw_text),
            skills=extract_skills(raw_text)
        )

        skill_analysis = analyze_skills_with_classifier(parsed_data.skills or [])
        key_entities = extract_key_entities(doc)

        return AnalysisResult(
            filename=file.filename,
            raw_text=raw_text,
            parsed_data=parsed_data,
            skill_analysis=skill_analysis,
            key_entities=key_entities
        )

# --- Job Matcher Endpoint (UPGRADED with Weighted Scoring) ---

# NEW: Helper function to split JD into sections
def parse_jd_sections(text: str) -> Dict[str, str]:
    text = text.lower()
    sections = {
        'high_priority': '',
        'low_priority': '',
        'other': ''
    }
    
    high_priority_keywords = ['requirements', 'responsibilities', 'must-haves', 'required skills', 'what you will do', 'your role']
    low_priority_keywords = ['nice to have', 'preferred qualifications', 'bonus points', 'good to have']
    
    # A simple way to split text by sections. It's not perfect but works for many JDs.
    # It looks for a keyword at the start of a line.
    lines = text.split('\n')
    current_section = 'high_priority' # Default to high priority

    for line in lines:
        line_stripped = line.strip()
        if any(line_stripped.startswith(kw) for kw in high_priority_keywords):
            current_section = 'high_priority'
        elif any(line_stripped.startswith(kw) for kw in low_priority_keywords):
            current_section = 'low_priority'
        
        sections[current_section] += line + '\n'
        
    return sections

def extract_skills_from_text(text: str) -> set:
    found_skills = set()
    for skill in SKILLS_DB:
        if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE):
            found_skills.add(skill)
    return found_skills

@app.post("/match/", response_model=JobMatchResult, tags=["Matching"])
async def match_resume_to_jd(request: JobMatchRequest):
    resume_skills_set = set(skill.lower() for skill in request.resume_skills)
    
    jd_sections = parse_jd_sections(request.job_description_text)

    # Extract skills from each section
    high_priority_skills = extract_skills_from_text(jd_sections['high_priority'])
    low_priority_skills = extract_skills_from_text(jd_sections['low_priority'])
    
    # Ensure low priority skills don't include high priority ones
    low_priority_skills = low_priority_skills - high_priority_skills
    
    all_jd_skills = high_priority_skills.union(low_priority_skills)

    if not all_jd_skills:
        return JobMatchResult(match_score=0, matched_keywords=[], missing_keywords=[])

    # Calculate matched and missing keywords
    matched_keywords = sorted(list(resume_skills_set.intersection(all_jd_skills)))
    missing_keywords = sorted(list(all_jd_skills.difference(resume_skills_set)))

    # NEW: Weighted scoring logic
    # High priority skills are worth 2 points, low priority are worth 1 point
    score = 0
    max_score = (len(high_priority_skills) * 2) + len(low_priority_skills)

    for skill in matched_keywords:
        if skill in high_priority_skills:
            score += 2
        elif skill in low_priority_skills:
            score += 1
    
    final_percentage = 0
    if max_score > 0:
        final_percentage = int((score / max_score) * 100)

    return JobMatchResult(
        match_score=final_percentage,
        matched_keywords=matched_keywords,
        missing_keywords=missing_keywords
    )
