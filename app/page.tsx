"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Youtube, Globe, Sparkles, Copy, History, Shield, ArrowRight, Check, Zap, Star } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export default function Home() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-emerald-600 animate-pulse" />
              <span className="text-xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                ContentRepurpose.ai
              </span>
            </div>
            <div className="flex gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" className="hover:scale-105 transition-transform duration-300">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:scale-105 transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center space-y-8 animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium animate-slide-down border border-emerald-200 dark:border-emerald-800">
            <Zap className="h-4 w-4 animate-pulse" />
            AI-Powered Content Repurposing
          </div>

          {/* Heading */}
          <div className="space-y-6 animate-fade-in-up animation-delay-200">
            <h1 className="text-5xl md:text-7xl font-bold text-balance leading-tight text-gray-900 dark:text-white">
              Turn One Piece of Content
              <br />
              <span className="bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent animate-gradient">
                Into Ten
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 text-balance max-w-3xl mx-auto">
              Paste a YouTube link or blog post URL and instantly get 5 tweets, a LinkedIn post, and an email summary.
              <span className="block mt-2 font-semibold text-gray-900 dark:text-gray-100">
                Save 10+ hours every week.
              </span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in-up animation-delay-400">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-lg px-8 h-14 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 h-14 border-2 border-gray-300 dark:border-gray-700 hover:scale-105 transition-all duration-300">
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Trust Badge */}
          <p className="text-sm text-gray-600 dark:text-gray-400 animate-fade-in-up animation-delay-600">
            <Check className="inline h-4 w-4 text-emerald-600 mr-1" />
            5 free credits on signup | No credit card required
          </p>
        </div>

        {/* Stats Cards */}
        <ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6 pt-20">
            <Card className="border-2 border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-500 hover:shadow-lg group hover:-translate-y-2 bg-white dark:bg-gray-900">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  5
                </div>
                <p className="font-bold text-xl text-gray-900 dark:text-white">Tweets Generated</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Short, catchy tweets optimized with hashtags and engagement hooks
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 dark:border-gray-800 hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-500 hover:shadow-lg group hover:-translate-y-2 bg-white dark:bg-gray-900">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-linear-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-3xl font-bold group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  1
                </div>
                <p className="font-bold text-xl text-gray-900 dark:text-white">LinkedIn Post</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Professional post formatted for maximum reach in your network
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 dark:border-gray-800 hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-500 hover:shadow-lg group hover:-translate-y-2 bg-white dark:bg-gray-900">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  1
                </div>
                <p className="font-bold text-xl text-gray-900 dark:text-white">Email Summary</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Newsletter-ready content that drives clicks and conversions
                </p>
              </CardContent>
            </Card>
          </div>
        </ScrollReveal>
      </div>

      {/* Trusted By Section */}
      <ScrollReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">Trusted by 100+ Creators</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Join content creators who save hours every week</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
  {[
    {
      name: "Rishav",
      role: "Content Creator & YouTuber",
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dXNlcnxlbnwwfHwwfHx8MA%3D%3D&fm=jpg&q=60&w=3000",
      testimonial: "ContentX saved me 15+ hours weekly. I can now focus on creating instead of repurposing!",
      rating: 5
    },
    {
      name: "Raja",
      role: "Digital Marketing Manager",
      image: "https://images.ctfassets.net/xjcz23wx147q/iegram9XLv7h3GemB5vUR/0345811de2da23fafc79bd00b8e5f1c6/Max_Rehkopf_200x200.jpeg",
      testimonial: "Best investment for our content team. The AI-generated posts are incredibly accurate.",
      rating: 5
    },
    {
      name: "Piyush",
      role: "Newsletter Writer",
      image: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&q=80&w=1000",
      testimonial: "Game changer! I repurpose my newsletters into social content in minutes, not hours.",
      rating: 5
    }
  ].map((user, index) => (
    <Card
      key={index}
      className="border-2 border-gray-200 dark:border-gray-800 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group bg-white dark:bg-gray-900"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-4">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-14 h-14 rounded-full object-cover shadow-lg group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300 shadow-lg">
              {user.name.split(" ").map(n => n[0]).join("")}
            </div>
          )}
          <div>
            <p className="font-bold text-lg text-gray-900 dark:text-white">{user.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{user.role}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {[...Array(user.rating)].map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="text-gray-700 dark:text-gray-300 italic">
          "{user.testimonial}"
        </p>
      </CardContent>
    </Card>
  ))}
          </div>
          {/* Stats Bar */}
          <div className="grid md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-gray-200 dark:border-gray-800">
            {[
              { value: "100+", label: "Active Users" },
              { value: "500+", label: "Content Generated" },
              { value: "3.9/5", label: "User Rating" },
              { value: "90%", label: "Satisfaction Rate" }
            ].map((stat, index) => (
              <div key={index} className="text-center group hover:scale-110 transition-transform duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                <p className="text-4xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* How It Works */}
      <ScrollReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">How It Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Three simple steps to repurpose your content</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative group">
              <div className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                  1
                </div>
                <div className="space-y-2">
                  <Youtube className="h-8 w-8 mx-auto text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Paste Your Link</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Drop in a YouTube video URL or blog post link
                  </p>
                </div>
              </div>
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-linear-to-r from-emerald-400 to-teal-400"></div>
            </div>

            <div className="relative group">
              <div className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 rounded-full bg-linear-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                  2
                </div>
                <div className="space-y-2">
                  <Sparkles className="h-8 w-8 mx-auto text-teal-600 group-hover:scale-110 transition-transform duration-300 animate-pulse" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Magic Happens</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    GPT-4 analyzes and transforms your content
                  </p>
                </div>
              </div>
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-linear-to-r from-teal-400 to-cyan-400"></div>
            </div>

            <div className="text-center space-y-4 group">
              <div className="mx-auto w-20 h-20 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                3
              </div>
              <div className="space-y-2">
                <Copy className="h-8 w-8 mx-auto text-cyan-600 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Copy & Share</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get 7 pieces of content ready to post
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Features */}
      <ScrollReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">Powerful Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Everything you need to scale your content</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, color: "emerald", title: "Secure Authentication", desc: "Email/password login with encrypted data storage" },
              { icon: Youtube, color: "red", title: "YouTube Transcripts", desc: "Automatic extraction of video transcripts for conversion" },
              { icon: Globe, color: "teal", title: "Blog Scraping", desc: "Smart content extraction from any blog post URL" },
              { icon: Sparkles, color: "cyan", title: "GPT-4 Powered", desc: "Advanced AI for high-quality content generation" },
              { icon: History, color: "blue", title: "Generation History", desc: "Access all your generated content anytime" },
              { icon: Copy, color: "emerald", title: "One-Click Copy", desc: "Copy any generated content to clipboard instantly" }
            ].map((feature, index) => (
              <Card key={index} className="border-2 border-gray-200 dark:border-gray-800 hover:shadow-lg hover:-translate-y-2 transition-all duration-500 group bg-white dark:bg-gray-900" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="pt-6 space-y-3">
                  <feature.icon className={`h-10 w-10 text-${feature.color}-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`} />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* CTA Section */}
      <ScrollReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card className="border-2 border-gray-200 dark:border-gray-800 bg-linear-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-2xl transition-all duration-500">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">Ready to 10x Your Content?</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Join thousands of creators who are repurposing content effortlessly
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-lg px-8 h-14 shadow-lg hover:scale-105 transition-all duration-300">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                5 free credits • No credit card required • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </ScrollReveal>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <span className="font-bold text-gray-900 dark:text-white">ContentRepurpose.ai</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 ContentRepurpose. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

function ScrollReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
      }`}
    >
      {children}
    </div>
  )
}
