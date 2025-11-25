import Link from 'next/link';
import { ArrowRight, MessageSquare, Zap, Shield, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">AI Message Writer</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-muted-foreground hover:text-foreground transition-colors touch-target flex items-center"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors touch-target"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Craft Perfect Messages with
            <span className="text-primary"> Multi-Agent AI</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Transform your raw thoughts into polished, professional communications. 
            Compare responses from multiple AI models and choose the best one for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-medium hover:bg-primary/90 transition-colors touch-target flex items-center justify-center gap-2"
            >
              Start Writing <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="border border-border px-8 py-4 rounded-lg text-lg font-medium hover:bg-accent transition-colors touch-target"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <FeatureCard
            icon={<Zap className="h-8 w-8" />}
            title="Multi-Model Comparison"
            description="Generate responses from Claude, GPT, Gemini, and more. Vote for the best and improve over time."
          />
          <FeatureCard
            icon={<Users className="h-8 w-8" />}
            title="Multi-Agent System"
            description="Specialized agents analyze context, calibrate tone, and ensure quality for every message."
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8" />}
            title="Privacy First"
            description="Your conversations are encrypted and stored locally. No data leaves your control."
          />
        </div>

        {/* Accessibility Note */}
        <div className="mt-24 p-6 bg-card rounded-lg border border-border text-center">
          <h2 className="text-2xl font-semibold mb-4">Built for Everyone</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Designed with neurodivergent users in mind. Features include dyslexia-friendly fonts,
            high contrast mode, reduced motion options, and clear visual hierarchy.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-border">
        <div className="text-center text-muted-foreground">
          <p>AI Message Writer Assistant - Your personal communication companion</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
