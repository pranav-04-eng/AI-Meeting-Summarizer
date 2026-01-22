import { ReactNode } from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="mb-8 p-4 bg-white/10 rounded-full backdrop-blur-sm">
            <Brain className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-center">
            AI Meeting Assistant
          </h1>
          <p className="text-xl text-center text-white/90 max-w-md">
            Transform your meetings into actionable insights with the power of artificial intelligence
          </p>
          <div className="mt-8 flex items-center gap-2 text-white/80">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm">Powered by Advanced AI Technology</span>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 space-y-6">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                <Brain className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{description}</p>
            </div>
            
            {children}
          </div>
          
          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            © 2026 AI Meeting Assistant. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
