import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { 
  Brain, 
  Mic, 
  Video, 
  FileText, 
  Clock, 
  Users, 
  TrendingUp, 
  Upload,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileAudio,
  X,
  Download
} from 'lucide-react';

interface MeetingSummary {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: number;
  status: 'completed' | 'processing' | 'pending';
  summary?: string;
  actionItems?: string[];
}

interface AnalysisResult {
  summary: string;
  action_items: string[];
  decisions: string[];
  next_steps: string[];
}

export function BankingDashboard() {
  const [isRecording, setIsRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();

  // Handle authentication errors
  const handleAuthError = () => {
    toast({
      title: '🔐 Authentication Required',
      description: 'Please log in to continue',
      variant: 'destructive',
    });
    navigate('/login');
  };

  const [recentMeetings] = useState<MeetingSummary[]>([
    {
      id: '1',
      title: 'Weekly Team Standup',
      date: '2026-01-08',
      duration: '45 min',
      participants: 8,
      status: 'completed',
      summary: 'Discussed Q1 goals and sprint planning',
      actionItems: ['Update project timeline', 'Review budget allocation']
    },
    {
      id: '2',
      title: 'Client Presentation',
      date: '2026-01-07',
      duration: '60 min',
      participants: 5,
      status: 'processing'
    },
    {
      id: '3',
      title: 'Product Strategy Meeting',
      date: '2026-01-06',
      duration: '90 min',
      participants: 12,
      status: 'completed',
      summary: 'Product roadmap and feature prioritization',
      actionItems: ['Finalize feature specs', 'Schedule user testing', 'Update design system']
    }
  ]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      toast({
        title: '🎤 Recording Started',
        description: 'Your meeting is being recorded...',
      });
    } catch (error) {
      toast({
        title: '❌ Recording Failed',
        description: 'Could not access microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const handleStopRecording = async () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      
      toast({
        title: '⏹️ Recording Stopped',
        description: 'Processing your recording...',
      });

      // Wait for the blob to be set, then automatically upload
      setTimeout(() => {
        if (recordedBlob) {
          const file = new File([recordedBlob], `recording-${Date.now()}.webm`, {
            type: 'audio/webm'
          });
          handleFileUpload(file, 'audio');
        }
      }, 500);
    }
  };

  const handleFileUpload = async (file: File, fileType: 'audio' | 'video') => {
    if (!file) return;

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast({
        title: '❌ File Too Large',
        description: 'Please select a file smaller than 50MB.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    const audioTypes = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/flac', 'audio/ogg', 'audio/aac', 'audio/webm'];
    const videoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/wmv', 'video/flv'];
    const allowedTypes = fileType === 'audio' ? audioTypes : videoTypes;
    
    if (!allowedTypes.some(type => file.type === type || file.name.toLowerCase().endsWith(type.split('/')[1]))) {
      toast({
        title: '❌ Invalid File Type',
        description: `Please select a valid ${fileType} file.`,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadedFile(file);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      toast({
        title: `📁 Uploading ${fileType}...`,
        description: `Processing ${file.name}`,
      });

      // Real progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 90); // Reserve 10% for processing
          setUploadProgress(percentComplete);
        }
      };

      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 401) {
            handleAuthError();
            reject(new Error('Authentication required'));
          } else if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.detail || `Upload failed: ${xhr.statusText}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
      });

      xhr.open('POST', 'http://localhost:8000/api/upload');
      xhr.withCredentials = true;
      xhr.send(formData);

      const result = await uploadPromise;
      setUploadProgress(100);

      // Set transcript and analysis results
      setTranscript(result.transcript);
      setAnalysisResult(result.analysis);

      toast({
        title: '✅ Analysis Complete!',
        description: `Successfully processed ${result.filename}`,
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: '❌ Upload Failed',
        description: error.message || 'Failed to process file. Please try again.',
        variant: 'destructive',
      });
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAudioUpload = () => {
    audioInputRef.current?.click();
  };

  const handleVideoUpload = () => {
    videoInputRef.current?.click();
  };

  const onAudioFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'audio');
    }
  };

  const onVideoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'video');
    }
  };

  const handleTranscriptAnalysis = async () => {
    if (!transcript.trim()) {
      toast({
        title: '⚠️ No Transcript',
        description: 'Please enter a transcript to analyze',
        variant: 'destructive',
      });
      return;
    }

    if (transcript.trim().length < 50) {
      toast({
        title: '⚠️ Transcript Too Short',
        description: 'Please provide a more detailed transcript (at least 50 characters)',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/analyze-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ transcript: transcript.trim() }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError();
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      const result = await response.json();
      
      if (!result.analysis) {
        throw new Error('Invalid response from server');
      }
      
      setAnalysisResult(result.analysis);

      toast({
        title: '🧠 Analysis Complete!',
        description: 'Successfully analyzed your transcript',
      });

    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: '❌ Analysis Failed',
        description: error.message || 'Failed to analyze transcript. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearResults = () => {
    setAnalysisResult(null);
    setTranscript('');
    setUploadedFile(null);
    setUploadProgress(0);
    setRecordedBlob(null);
  };

  const exportResults = () => {
    if (!analysisResult) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      summary: analysisResult.summary,
      actionItems: analysisResult.action_items,
      decisions: analysisResult.decisions,
      nextSteps: analysisResult.next_steps,
      originalTranscript: transcript
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: '📥 Export Complete!',
      description: 'Analysis results have been downloaded',
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <Navbar />
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={audioInputRef}
        onChange={onAudioFileSelect}
        accept=".mp3,.wav,.m4a,.flac,.ogg,.aac"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={videoInputRef}
        onChange={onVideoFileSelect}
        accept=".mp4,.avi,.mov,.mkv,.wmv,.flv"
        style={{ display: 'none' }}
      />

      {/* Welcome Header */}
      <div className="text-center py-12 px-8">
        <div className="max-w-4xl mx-auto">
          {user && (
            <div className="mb-4">
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
                Welcome back, {user.username}! 👋
              </Badge>
            </div>
          )}
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 leading-tight">
            AI Meeting Assistant
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-light">
            Transform your meetings into actionable insights with AI-powered analysis
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 pb-12 space-y-8">
        {/* Meeting Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-2xl shadow-blue-500/10">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800 dark:text-slate-100">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                Quick Actions
              </CardTitle>
              <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
                Start a new meeting session or upload existing content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Button 
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`h-24 flex flex-col items-center gap-3 text-white font-semibold text-base transition-all duration-200 transform hover:scale-105 ${isRecording ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30' : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30'}`}
                  disabled={isUploading}
                >
                  {isRecording ? <Pause className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>
                
                <Button 
                  onClick={handleAudioUpload}
                  variant="outline" 
                  className="h-24 flex flex-col items-center gap-3 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 text-blue-700 dark:text-blue-300 font-semibold text-base transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                  disabled={isUploading}
                >
                  <FileAudio className="h-7 w-7" />
                  Upload Audio
                </Button>
                
                <Button 
                  onClick={handleVideoUpload}
                  variant="outline" 
                  className="h-24 flex flex-col items-center gap-3 border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/30 dark:hover:to-purple-700/30 text-purple-700 dark:text-purple-300 font-semibold text-base transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                  disabled={isUploading}
                >
                  <Video className="h-7 w-7" />
                  Upload Video
                </Button>
              </div>
              
              {/* Upload Progress */}
              {isUploading && (
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-base font-semibold text-blue-800 dark:text-blue-200">Processing {uploadedFile?.name}...</span>
                    <span className="text-base font-bold text-blue-600 dark:text-blue-400">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-3 bg-blue-100 dark:bg-blue-900" />
                </div>
              )}

              {/* File Upload Success */}
              {uploadedFile && !isUploading && uploadProgress === 100 && (
                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <span className="text-base font-semibold text-green-800 dark:text-green-200">
                        {uploadedFile.name} processed successfully!
                      </span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={clearResults} className="hover:bg-green-100 dark:hover:bg-green-900/30">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transcript Input */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-2xl shadow-purple-500/10">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800 dark:text-slate-100">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                Paste Transcript
              </CardTitle>
              <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
                Or paste your meeting transcript for instant analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Textarea
                placeholder="Paste your meeting transcript here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="min-h-[140px] resize-none text-base bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={isUploading}
              />
              <Button 
                onClick={handleTranscriptAnalysis}
                disabled={!transcript.trim() || isAnalyzing || isUploading}
                className="w-full h-14 bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 hover:from-purple-600 hover:via-indigo-700 hover:to-blue-700 text-white font-semibold text-lg shadow-lg shadow-purple-500/30 transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="mr-3 h-5 w-5" />
                    Analyze Transcript
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysisResult && (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl shadow-green-500/10 animate-in slide-in-from-bottom-4 duration-500">
              <CardHeader className="pb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-t-xl">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-green-800 dark:text-green-200">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-3 text-slate-800 dark:text-slate-200">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Meeting Summary
                  </h3>
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6">
                      <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">{analysisResult.summary}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Items */}
                {analysisResult.action_items.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-3 text-slate-800 dark:text-slate-200">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      Action Items ({analysisResult.action_items.length})
                    </h3>
                    <div className="space-y-3">
                      {analysisResult.action_items.map((item, index) => (
                        <Card key={index} className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all duration-200 animate-in slide-in-from-left-2" style={{animationDelay: `${index * 100}ms`}}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full mt-1.5 flex-shrink-0 shadow-sm"></div>
                              <span className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">{item}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decisions */}
                {analysisResult.decisions.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-3 text-slate-800 dark:text-slate-200">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      Key Decisions ({analysisResult.decisions.length})
                    </h3>
                    <div className="space-y-3">
                      {analysisResult.decisions.map((decision, index) => (
                        <Card key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 hover:shadow-md transition-all duration-200 animate-in slide-in-from-left-2" style={{animationDelay: `${index * 100}ms`}}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mt-1.5 flex-shrink-0 shadow-sm"></div>
                              <span className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">{decision}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                {analysisResult.next_steps.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-3 text-slate-800 dark:text-slate-200">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                      Next Steps ({analysisResult.next_steps.length})
                    </h3>
                    <div className="space-y-3">
                      {analysisResult.next_steps.map((step, index) => (
                        <Card key={index} className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 hover:shadow-md transition-all duration-200 animate-in slide-in-from-left-2" style={{animationDelay: `${index * 100}ms`}}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full mt-1.5 flex-shrink-0 shadow-sm"></div>
                              <span className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">{step}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button onClick={exportResults} className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-500/30 transition-all duration-200 transform hover:scale-[1.02]">
                    <Download className="w-5 h-5 mr-2" />
                    Export Results
                  </Button>
                  <Button variant="outline" onClick={clearResults} className="h-12 px-8 border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-all duration-200">
                    Clear Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}