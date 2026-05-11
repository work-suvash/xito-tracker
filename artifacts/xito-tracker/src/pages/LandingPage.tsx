import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { containerVariants, itemVariants, cardVariants } from "@/components/ui/page-transition";
import { 
  Camera, 
  Video, 
  Calendar, 
  CreditCard, 
  FolderOpen, 
  LayoutDashboard,
  CheckCircle2,
  ChevronRight,
  Star
} from "lucide-react";

const heroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Camera className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">Xito Tracker</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link href="/sign-up">
            <Button>Get Started</Button>
          </Link>
        </div>
      </motion.header>

      <main className="flex-1">
        {/* Hero Section */}
        <motion.section
          variants={heroVariants}
          initial="hidden"
          animate="visible"
          className="py-24 px-6 text-center max-w-5xl mx-auto flex flex-col items-center"
        >
          <motion.div variants={heroItem} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-8">
            Now available for Wedding Professionals
          </motion.div>
          <motion.h1 variants={heroItem} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            The Command Center for <br className="hidden md:block"/>
            <span className="text-primary">Creative Professionals</span>
          </motion.h1>
          <motion.p variants={heroItem} className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Manage clients, projects, files, deadlines, and payments with absolute precision. Stop juggling tools and start focusing on your craft.
          </motion.p>
          <motion.div variants={heroItem} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button size="lg" className="h-12 px-8 text-base w-full">
                Start for free <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base w-full sm:w-auto">
              View Demo
            </Button>
          </motion.div>
          
          <motion.div variants={heroItem} className="mt-20 w-full max-w-4xl mx-auto rounded-xl border bg-card text-card-foreground shadow-2xl overflow-hidden ring-1 ring-white/10">
            <div className="aspect-video bg-muted flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-background/50" />
              <LayoutDashboard className="h-24 w-24 text-muted-foreground/30" />
              <div className="absolute inset-0 flex items-center justify-center bg-background/5 backdrop-blur-sm">
                <span className="text-2xl font-bold text-muted-foreground/50">App Preview</span>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Features Section */}
        <section className="py-24 px-6 bg-muted/50">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need to run your studio</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built specifically for the workflows of modern wedding photographers and videographers.
              </p>
            </motion.div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[
                { title: "Client Management", desc: "Track every lead and booked couple with detailed profiles and timelines.", icon: Camera },
                { title: "Project Pipelines", desc: "Kanban boards for your entire post-production workflow.", icon: LayoutDashboard },
                { title: "File Organization", desc: "Keep track of raws, catalogs, and final deliverables in one place.", icon: FolderOpen },
                { title: "Smart Calendar", desc: "Never miss a wedding, shoot, or delivery deadline again.", icon: Calendar },
                { title: "Payment Tracking", desc: "Monitor retainers, balances, and total revenue automatically.", icon: CreditCard },
                { title: "Video Workflows", desc: "Specialized fields for multi-cam, audio, and highlight reels.", icon: Video },
              ].map((feature, i) => (
                <motion.div key={i} variants={cardVariants}>
                  <Card className="border-none shadow-md bg-background h-full">
                    <CardContent className="pt-6">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl font-bold tracking-tight mb-16 text-center"
            >
              Trusted by top studios
            </motion.h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid md:grid-cols-3 gap-8"
            >
              {[
                { name: "Sarah Jenkins", role: "Wedding Photographer", quote: "Xito Tracker completely transformed how I run my business. I save at least 10 hours a week on admin work alone." },
                { name: "Michael Chen", role: "Cinematographer", quote: "Finally, a tool that actually understands the post-production pipeline for wedding films. Absolute game changer." },
                { name: "Elena Rodriguez", role: "Destination Photographer", quote: "The financial tracking and deadline management gives me peace of mind when I'm traveling. Worth every penny." }
              ].map((t, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <Card className="bg-muted/30 h-full">
                    <CardContent className="pt-6">
                      <div className="flex gap-1 mb-4 text-primary">
                        {[1,2,3,4,5].map(star => <Star key={star} className="h-4 w-4 fill-current" />)}
                      </div>
                      <p className="text-lg italic mb-6">"{t.quote}"</p>
                      <div>
                        <p className="font-semibold">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24 px-6 bg-muted/50">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                No hidden fees. Cancel anytime.
              </p>
            </motion.div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              {[
                { name: "Starter", price: "$0", desc: "Perfect for getting started", features: ["Up to 5 active projects", "Basic client management", "Standard calendar"] },
                { name: "Pro", price: "$29", desc: "For growing studios", popular: true, features: ["Unlimited projects", "Advanced analytics", "Financial tracking", "Priority support"] },
                { name: "Studio", price: "$79", desc: "For multi-shooter teams", features: ["Everything in Pro", "Team collaboration", "Custom workflows", "API access"] }
              ].map((tier, i) => (
                <motion.div key={i} variants={cardVariants}>
                  <Card className={`relative h-full ${tier.popular ? 'border-primary shadow-lg scale-105 z-10' : ''}`}>
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </div>
                    )}
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-extrabold">{tier.price}</span>
                        <span className="text-muted-foreground">/mo</span>
                      </div>
                      <p className="text-muted-foreground mb-6">{tier.desc}</p>
                      <Link href="/sign-up">
                        <Button className="w-full mb-8" variant={tier.popular ? "default" : "outline"}>
                          Get Started
                        </Button>
                      </Link>
                      <div className="space-y-3">
                        {tier.features.map((f, j) => (
                          <div key={j} className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <span className="text-sm">{f}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="py-24 px-6 text-center"
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold tracking-tight mb-6">Ready to elevate your studio?</h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join thousands of creative professionals who trust Xito Tracker to run their business.
            </p>
            <Link href="/sign-up">
              <Button size="lg" className="h-12 px-8 text-base">
                Create Your Free Account
              </Button>
            </Link>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t bg-muted/20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
              <Camera className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-bold">Xito Tracker</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Xito Tracker. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
