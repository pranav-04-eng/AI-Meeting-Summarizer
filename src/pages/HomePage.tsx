import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Users, Brain, ChevronRight, Mic, Video, FileAudio } from 'lucide-react';

export function HomePage() {
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState('');
  const [actionItems, setActionItems] = useState<string[]>([]);

  const handleTranscriptSubmit = async () => {
    if (!transcript.trim()) return;
    
    setIsProcessing(true);
    try {
      // Simulate API call - replace with actual backend call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response - replace with actual API response
      setSummary("This meeting focused on quarterly planning and resource allocation. Key topics included budget discussions, team restructuring, and upcoming project deadlines.");
      setActionItems([
        "Review budget allocation by Friday",
        "Schedule team restructuring meeting",
        "Update project timelines",
        "Prepare Q4 presentation materials"
      ]);
    } catch (error) {
      console.error('Error processing transcript:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-primary" />
            <h2 className="text-xl font-bold">AI Meeting Assistant</h2>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <Badge variant="outline" className="px-3 py-1">
              AI-Powered Meeting Intelligence
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Transform Meetings into
              <span className="text-primary block"> Actionable Insights</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Automatically summarize meetings, extract key action items, and never miss important details with our AI-powered meeting assistant.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button size="lg" className="px-8 py-3 text-lg">
                Get Started Free
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
              <Video className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mic className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Auto Transcription</CardTitle>
              <CardDescription>
                Convert audio and video meetings into accurate text transcripts
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>AI Summarization</CardTitle>
              <CardDescription>
                Get concise, intelligent summaries of your meeting content
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Action Planning</CardTitle>
              <CardDescription>
                Automatically extract action items and assign responsibilities
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Transcript Analyzer */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/10">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Try Our AI Summarizer</CardTitle>
              <CardDescription>
                Paste your meeting transcript below to see our AI in action
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">
                    <FileText className="w-4 h-4 mr-1" />
                    Text Transcript
                  </Badge>
                  <Badge variant="secondary">
                    <FileAudio className="w-4 h-4 mr-1" />
                    Audio Files
                  </Badge>
                  <Badge variant="secondary">
                    <Video className="w-4 h-4 mr-1" />
                    Video Files
                  </Badge>
                </div>
                
                <Textarea
                  placeholder="Paste your meeting transcript here... For example:

John: Good morning everyone, let's start with the quarterly review.
Sarah: Thanks John. Our Q3 numbers are looking strong, we've exceeded our targets by 15%.
Mike: That's great news! For Q4, I think we should focus on expanding our marketing efforts.
John: Agreed. Sarah, can you prepare a budget proposal by Friday?
Sarah: Absolutely, I'll have that ready.
Mike: I'll also work on updating our project timelines to reflect the new priorities.
John: Perfect. Let's schedule a follow-up meeting next week to review everything."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                
                <Button 
                  onClick={handleTranscriptSubmit} 
                  disabled={!transcript.trim() || isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 w-5 h-5" />
                      Analyze & Summarize
                    </>
                  )}
                </Button>
              </div>

              {summary && (
                <div className="space-y-4 pt-6 border-t">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Meeting Summary
                    </h3>
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <p className="text-sm">{summary}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {actionItems.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Action Items
                      </h3>
                      <div className="space-y-2">
                        {actionItems.map((item, index) => (
                          <Card key={index} className="bg-primary/5">
                            <CardContent className="p-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                <span className="text-sm">{item}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Ready to Transform Your Meetings?</h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of teams using AI to make their meetings more productive and actionable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2026 AI Meeting Assistant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
