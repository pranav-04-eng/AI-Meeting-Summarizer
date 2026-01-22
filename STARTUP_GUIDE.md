# 🚀 AI Meeting Summarizer - Startup Guide

## Quick Start (Login → Dashboard → Upload)

### 1️⃣ Start Backend Server
```bash
uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

### 2️⃣ Start Frontend Server
```bash
npm run dev
```

### 3️⃣ Complete Flow Test

#### **Step 1: Create Account**
1. Go to: http://localhost:5173
2. Click "Sign Up" button
3. Fill in registration form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `testpass123`

#### **Step 2: Login**
1. Click "Sign In" button
2. Enter credentials:
   - Username: `testuser`
   - Password: `testpass123`
3. Click "Sign In"
4. ✅ **Should automatically redirect to Dashboard**

#### **Step 3: Upload & Analyze**
**Dashboard Features Available:**
- 🎤 **Start Recording** - Click green microphone button
- 📁 **Upload Audio** - Click "Upload Audio" button (.mp3, .wav, .m4a, .flac, .ogg, .aac)
- 🎥 **Upload Video** - Click "Upload Video" button (.mp4, .avi, .mov, .mkv, .wmv, .flv)
- 📝 **Paste Transcript** - Paste text and click "Analyze Transcript"

## 🔧 **What Happens After Upload:**

1. **File Processing** - Progress bar shows upload status
2. **AI Transcription** - Groq Whisper converts audio to text
3. **AI Analysis** - Generates structured insights:
   - 📋 **Meeting Summary**
   - ✅ **Action Items**
   - 🎯 **Key Decisions**
   - 🚀 **Next Steps**

## 🎯 **Expected Flow:**
```
Homepage → Login → Dashboard → Upload/Record → AI Analysis → Results Display
```

## 📁 **Test Files:**
- **Audio**: Upload any .mp3, .wav, .m4a file
- **Video**: Upload any .mp4, .avi, .mov file
- **Transcript**: Paste meeting text directly

## 🔍 **Troubleshooting:**
- **Backend not starting**: Check if port 8000 is free
- **Frontend not starting**: Check if port 5173 is free
- **Upload fails**: Ensure you're logged in and backend is running
- **No analysis results**: Check Groq API key in server.py

## ✅ **Success Indicators:**
- ✅ Login redirects to `/dashboard`
- ✅ Upload buttons are clickable
- ✅ Progress bars show during upload
- ✅ Toast notifications appear
- ✅ Analysis results display with color-coded sections
- ✅ Navbar shows user avatar and logout option

Your AI Meeting Summarizer is ready! 🎉