import os
import uuid
import hashlib
import secrets
import tempfile
import gc
import time
import asyncio
from datetime import datetime, timedelta
from fastapi import FastAPI, UploadFile, File, Request, Response, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from moviepy.video.io.VideoFileClip import VideoFileClip
from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import mimetypes
import json

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Validate API key
if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY not found in environment variables!") # Fallback
    
print(f"Using GROQ API key: {GROQ_API_KEY[:8]}...{GROQ_API_KEY[-8:] if len(GROQ_API_KEY) > 16 else 'short_key'}")

# Initialize FastAPI
app = FastAPI(title="AI Meeting Summarizer API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
try:
    client = Groq(api_key=GROQ_API_KEY)
    print("Groq client initialized successfully")
except Exception as e:
    print(f"Failed to initialize Groq client: {str(e)}")
    client = None

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# In-memory storage for users and sessions (use a database in production)
users_db = {}
sessions_db = {}

# Helper function to safely remove files on Windows
def safe_remove_file(file_path, max_retries=3, delay=0.5):
    """Safely remove a file with retries for Windows file locking issues"""
    for attempt in range(max_retries):
        try:
            if os.path.exists(file_path):
                # Force garbage collection
                gc.collect()
                # Try to remove the file
                os.remove(file_path)
                return True
        except PermissionError as e:
            if attempt < max_retries - 1:
                time.sleep(delay)
                continue
            else:
                print(f"Warning: Could not remove file {file_path}: {e}")
                return False
        except Exception as e:
            print(f"Warning: Error removing file {file_path}: {e}")
            return False
    return False

# Clean filename function
def clean_filename(filename):
    """Clean filename to avoid Windows path issues"""
    import re
    # Remove or replace problematic characters
    clean_name = re.sub(r'[<>:"/\\|?*]', '_', filename)
    # Remove multiple spaces and replace with single underscore
    clean_name = re.sub(r'\s+', '_', clean_name)
    return clean_name

# Pydantic models for request validation
class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

# Helper functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_session(username: str) -> str:
    session_id = secrets.token_urlsafe(32)
    sessions_db[session_id] = {
        "username": username,
        "created_at": datetime.now(),
        "expires_at": datetime.now() + timedelta(hours=24)
    }
    return session_id

def get_current_user(request: Request) -> Optional[dict]:
    session_id = request.cookies.get("session_id")
    if not session_id or session_id not in sessions_db:
        return None
    session = sessions_db[session_id]
    if datetime.now() > session["expires_at"]:
        del sessions_db[session_id]
        return None
    return users_db.get(session["username"])

# Authentication endpoints
@app.post("/api/register")
async def register(user: UserRegister):
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if email is already registered
    for existing_user in users_db.values():
        if existing_user["email"] == user.email:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    users_db[user.username] = {
        "username": user.username,
        "email": user.email,
        "password": hash_password(user.password),
        "created_at": datetime.now().isoformat()
    }
    
    return JSONResponse({
        "status": "success",
        "message": "Registration successful"
    })

@app.post("/api/login")
async def login(user: UserLogin, response: Response):
    if user.username not in users_db:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    stored_user = users_db[user.username]
    if stored_user["password"] != hash_password(user.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    session_id = create_session(user.username)
    
    response = JSONResponse({
        "status": "success",
        "message": "Login successful",
        "user": {
            "username": stored_user["username"],
            "email": stored_user["email"]
        }
    })
    
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        max_age=86400,  # 24 hours
        samesite="lax"
    )
    
    return response

@app.post("/api/logout")
async def logout(request: Request, response: Response):
    session_id = request.cookies.get("session_id")
    if session_id and session_id in sessions_db:
        del sessions_db[session_id]
    
    response = JSONResponse({
        "status": "success",
        "message": "Logout successful"
    })
    response.delete_cookie("session_id")
    return response

@app.get("/api/me")
async def get_me(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return JSONResponse({
        "status": "success",
        "user": {
            "username": user["username"],
            "email": user["email"]
        }
    })

@app.post("/api/upload")
async def upload_and_process(file: UploadFile = File(...), request: Request = None):
    # Check authentication
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    file_path = None
    audio_path = None
    clip = None
    
    try:
        # Validate file type
        file_extension = os.path.splitext(file.filename)[1].lower()
        audio_extensions = ['.mp3', '.wav', '.m4a', '.flac', '.ogg', '.aac']
        video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv']
        
        if file_extension not in audio_extensions + video_extensions:
            raise HTTPException(
                status_code=400, 
                detail="Unsupported file type. Please upload audio (.mp3, .wav, .m4a, .flac, .ogg, .aac) or video (.mp4, .avi, .mov, .mkv, .wmv, .flv) files."
            )
        
        # Generate unique filename with clean naming
        clean_original_name = clean_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{clean_original_name}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save uploaded file
        try:
            content = await file.read()
            with open(file_path, "wb") as f:
                f.write(content)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error saving uploaded file: {str(e)}")
        
        audio_path = file_path
        
        # If it's a video file, extract audio
        if file_extension in video_extensions:
            audio_filename = f"{uuid.uuid4().hex}_extracted_audio.wav"  # Use WAV for better compatibility
            audio_path = os.path.join(OUTPUT_DIR, audio_filename)
            
            # Extract audio from video with better error handling
            try:
                # Use moviepy with proper cleanup
                clip = VideoFileClip(file_path)
                
                if clip.audio is None:
                    clip.close()
                    raise HTTPException(status_code=400, detail="Video file has no audio track")
                
                # Extract audio with proper settings and temporary directory
                temp_dir = tempfile.gettempdir()
                audio_clip = clip.audio
                audio_clip.write_audiofile(
                    audio_path, 
                    verbose=False, 
                    logger=None,
                    temp_audiofile_path=temp_dir,
                    bitrate="128k",  # Lower bitrate for faster processing
                    ffmpeg_params=["-ac", "1"]  # Mono audio for smaller file size
                )
                
                # Properly close clips with small delay for Windows
                audio_clip.close()
                del audio_clip
                clip.close()
                del clip
                clip = None
                
                # Force garbage collection
                gc.collect()
                time.sleep(0.1)  # Small delay for Windows file system
                
            except Exception as e:
                # Ensure cleanup on error
                if clip:
                    try:
                        clip.close()
                        del clip
                    except:
                        pass
                
                # Clean up files
                safe_remove_file(file_path)
                    
                raise HTTPException(status_code=500, detail=f"Error extracting audio from video: {str(e)}")
        
        # Transcribe audio using Groq Whisper
        try:
            with open(audio_path, "rb") as audio_file:
                transcription = client.audio.transcriptions.create(
                    file=audio_file,
                    model="whisper-large-v3-turbo",
                    response_format="text",
                    language="en"
                )
            transcript_text = transcription.strip()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error transcribing audio: {str(e)}")
        
        # Generate Meeting Summary + Action Items
        try:
            prompt = f"""
You are an AI meeting assistant. Analyze this meeting transcript and provide:
1. A concise summary of key topics discussed
2. A list of action items with assignees (if mentioned)
3. Important decisions made
4. Next steps or follow-up items

Transcript:
---
{transcript_text}
---

Please format your response as JSON with the following structure:
{{
    "summary": "Brief summary of the meeting",
    "action_items": [
        "Action item 1",
        "Action item 2"
    ],
    "decisions": [
        "Decision 1",
        "Decision 2"
    ],
    "next_steps": [
        "Next step 1",
        "Next step 2"
    ]
}}
"""
            
            summary_response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}]
            )
            
            summary_text = summary_response.choices[0].message.content.strip()
            
            # Try to parse as JSON, fallback to plain text if it fails
            try:
                summary_data = json.loads(summary_text)
            except:
                summary_data = {
                    "summary": summary_text,
                    "action_items": [],
                    "decisions": [],
                    "next_steps": []
                }
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")
        
        return JSONResponse({
            "status": "success",
            "transcript": transcript_text,
            "analysis": summary_data,
            "filename": file.filename,
            "file_type": "video" if file_extension in video_extensions else "audio"
        })
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    finally:
        # Always cleanup files and resources
        try:
            if clip:
                clip.close()
                del clip
        except:
            pass
        
        # Force garbage collection before file cleanup
        gc.collect()
        time.sleep(0.1)  # Small delay for Windows
            
        # Clean up temporary files after processing
        if file_path:
            safe_remove_file(file_path)
            
        if audio_path and audio_path != file_path:
            safe_remove_file(audio_path)

def generate_fallback_analysis(transcript: str) -> str:
    """Generate a basic analysis when AI service is unavailable"""
    words = transcript.split()
    word_count = len(words)
    
    # Basic keyword extraction for topics
    common_meeting_words = ['project', 'task', 'deadline', 'team', 'meeting', 'discuss', 'decision', 'action', 'next', 'follow', 'up']
    found_keywords = [word for word in words if word.lower() in common_meeting_words]
    
    # Generate basic analysis
    analysis = {
        "summary": f"This meeting transcript contains {word_count} words. Key topics mentioned include: {', '.join(set(found_keywords[:5]))}. Due to AI service unavailability, this is a basic automated analysis.",
        "action_items": [
            "Review meeting transcript for specific action items",
            "Follow up on discussed topics",
            "Schedule next meeting if needed"
        ],
        "decisions": [
            "Specific decisions need manual review from transcript"
        ],
        "next_steps": [
            "Manual review of transcript recommended",
            "AI analysis will be available when service is restored"
        ]
    }
    
    return json.dumps(analysis, indent=2)

@app.post("/api/analyze-transcript")
async def analyze_transcript(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if not client:
        raise HTTPException(status_code=500, detail="AI service not available")
    
    try:
        body = await request.json()
        transcript = body.get("transcript", "").strip()
        
        if not transcript:
            raise HTTPException(status_code=400, detail="Transcript text is required")
        
        # Generate analysis using Groq
        print(f"Analyzing transcript of length: {len(transcript)} characters")
        
        prompt = f"""
You are an AI meeting assistant. Analyze this meeting transcript and provide:
1. A concise summary of key topics discussed
2. A list of action items with assignees (if mentioned)
3. Important decisions made
4. Next steps or follow-up items

Transcript:
---
{transcript}
---

Please format your response as JSON with the following structure:
{{
    "summary": "Brief summary of the meeting",
    "action_items": [
        "Action item 1",
        "Action item 2"
    ],
    "decisions": [
        "Decision 1",
        "Decision 2"
    ],
    "next_steps": [
        "Next step 1",
        "Next step 2"
    ]
}}
"""
        
        try:
            print("Calling Groq API...")
            
            # Retry mechanism for API calls
            max_retries = 3
            retry_delay = 1
            
            for attempt in range(max_retries):
                try:
                    response = client.chat.completions.create(
                        model="llama-3.1-8b-instant",
                        messages=[{"role": "user", "content": prompt}],
                        max_tokens=1000,
                        temperature=0.7
                    )
                    
                    print("Groq API call successful")
                    analysis_text = response.choices[0].message.content.strip()
                    print(f"Received response length: {len(analysis_text)} characters")
                    break
                    
                except Exception as api_error:
                    print(f"Attempt {attempt + 1} failed: {str(api_error)}")
                    if attempt == max_retries - 1:
                        # Last attempt failed, use fallback
                        print("All API attempts failed, using fallback analysis...")
                        analysis_text = generate_fallback_analysis(transcript)
                        break
                    else:
                        print(f"Retrying in {retry_delay} seconds...")
                        await asyncio.sleep(retry_delay)
                        retry_delay *= 2  # Exponential backoff
            
        except Exception as groq_error:
            print(f"Groq API error: {str(groq_error)}")
            print(f"Error type: {type(groq_error)}")
            # Use fallback analysis instead of failing
            print("Using fallback analysis due to API error...")
            analysis_text = generate_fallback_analysis(transcript)
        
        # Try to parse as JSON, fallback to plain text if it fails
        try:
            print("Parsing JSON response...")
            analysis_data = json.loads(analysis_text)
            print("JSON parsing successful")
        except json.JSONDecodeError as json_error:
            print(f"JSON parsing failed: {str(json_error)}")
            print(f"Raw response: {analysis_text[:500]}...")
            analysis_data = {
                "summary": analysis_text,
                "action_items": [],
                "decisions": [],
                "next_steps": []
            }
        
        print("Returning successful response")
        return JSONResponse({
            "status": "success",
            "analysis": analysis_data,
            "note": "Analysis completed successfully" if "AI service unavailability" not in analysis_data.get("summary", "") else "AI service temporarily unavailable - basic analysis provided"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in analyze_transcript: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        
        # Try to provide fallback even on unexpected errors
        try:
            fallback_analysis = generate_fallback_analysis(transcript if 'transcript' in locals() else "")
            fallback_data = json.loads(fallback_analysis)
            return JSONResponse({
                "status": "partial_success",
                "analysis": fallback_data,
                "note": "Service temporarily unavailable - basic analysis provided"
            })
        except:
            raise HTTPException(status_code=500, detail="Service temporarily unavailable. Please try again later.")

@app.get("/api/health")
async def health_check():
    """Check API and AI service health"""
    health_status = {
        "api": "healthy",
        "ai_service": "unknown"
    }
    
    if client:
        try:
            # Quick test call to check AI service
            test_response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=10
            )
            health_status["ai_service"] = "healthy"
        except:
            health_status["ai_service"] = "unavailable"
    else:
        health_status["ai_service"] = "not_configured"
    
    return JSONResponse(health_status)
