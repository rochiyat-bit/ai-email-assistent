import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, Sparkles, Zap, Shield, Clock, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">AI Email Assistant</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signin">
              <Button>Get Started Free</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto flex flex-col items-center justify-center gap-8 px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          AI-Powered Email Management
        </div>

        <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          Transform Your Gmail Inbox with{" "}
          <span className="text-primary">AI Intelligence</span>
        </h1>

        <p className="max-w-2xl text-lg text-muted-foreground">
          Automatically categorize, summarize, and manage hundreds of emails daily.
          Get smart AI-generated replies and never miss important messages again.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/auth/signin">
            <Button size="lg" className="gap-2">
              <Mail className="h-5 w-5" />
              Connect Gmail Now
            </Button>
          </Link>
          <Button size="lg" variant="outline">
            Watch Demo
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          🎉 7-day free trial • No credit card required • Cancel anytime
        </p>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Everything You Need to Master Your Inbox
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              title="AI Email Summarization"
              description="Get one-line summaries of every email. Understand your inbox at a glance without reading everything."
            />

            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Smart Categorization"
              description="Automatically organize emails into Important, Transactional, and Promotional categories."
            />

            <FeatureCard
              icon={<Mail className="h-6 w-6" />}
              title="Thread Consolidation"
              description="Group related emails together with unified summaries. See full conversations at once."
            />

            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="AI Reply Generation"
              description="Generate professional email responses in seconds. Choose your tone and customize."
            />

            <FeatureCard
              icon={<Clock className="h-6 w-6" />}
              title="Scheduled Digests"
              description="Get customizable email digests 1-4 times daily. Stay informed without constant checking."
            />

            <FeatureCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="Advanced Analytics"
              description="Track email patterns, top senders, and productivity metrics over time."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="mb-4 text-3xl font-bold">
          Ready to Transform Your Email Experience?
        </h2>
        <p className="mb-8 text-lg text-muted-foreground">
          Join thousands of users saving 2+ hours per day on email management
        </p>
        <Link href="/auth/signin">
          <Button size="lg" className="gap-2">
            <Mail className="h-5 w-5" />
            Start Free Trial
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2024 AI Email Assistant. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
