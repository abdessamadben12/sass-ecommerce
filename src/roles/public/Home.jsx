import React from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Users, Store, BarChart3, Mail } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <header className="sticky top-0 z-40 backdrop-blur bg-slate-950/70 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-400/20 border border-emerald-300/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="text-lg font-semibold tracking-wide">EtsyEx Market</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <a className="hover:text-white" href="#features">Features</a>
            <a className="hover:text-white" href="#audience">For Sellers</a>
            <a className="hover:text-white" href="#insights">Insights</a>
            <a className="hover:text-white" href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="/login" className="px-4 py-2 text-sm rounded-lg border border-white/20 hover:border-white/40">
              Admin Login
            </a>
            <a href="#get-started" className="px-4 py-2 text-sm rounded-lg bg-emerald-400 text-slate-950 font-medium hover:bg-emerald-300">
              Get Started
            </a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_10%_0%,rgba(16,185,129,0.25),transparent),radial-gradient(700px_500px_at_90%_10%,rgba(59,130,246,0.18),transparent)]" />
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-emerald-300 text-sm font-medium">Marketplace Command Center</p>
              <h1 className="mt-4 text-4xl md:text-5xl font-semibold leading-tight">
                Manage your multi-seller marketplace with clarity and control.
              </h1>
              <p className="mt-4 text-slate-300 text-base">
                Built for operations teams: monitor shops, review products, track transactions, and automate marketing
                — all from one professional dashboard.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a id="get-started" href="/login" className="px-5 py-3 rounded-lg bg-emerald-400 text-slate-950 font-medium hover:bg-emerald-300">
                  Access Admin
                </a>
                <a href="#features" className="px-5 py-3 rounded-lg border border-white/20 text-white hover:border-white/40">
                  Explore Features
                </a>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-slate-300">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-300" /> Verified sellers</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-300" /> Fraud monitoring</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-300" /> Marketing automation</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-300" /> Reports & analytics</div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-white/5">
                  <p className="text-xs text-slate-400">Total Revenue</p>
                  <p className="text-2xl font-semibold">€128,430</p>
                  <p className="text-xs text-emerald-300">+12.4% MoM</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-white/5">
                  <p className="text-xs text-slate-400">Active Shops</p>
                  <p className="text-2xl font-semibold">1,284</p>
                  <p className="text-xs text-emerald-300">+86 this month</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-white/5">
                  <p className="text-xs text-slate-400">Pending Reviews</p>
                  <p className="text-2xl font-semibold">312</p>
                  <p className="text-xs text-amber-300">Needs attention</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-white/5">
                  <p className="text-xs text-slate-400">Tickets</p>
                  <p className="text-2xl font-semibold">64</p>
                  <p className="text-xs text-emerald-300">SLA on track</p>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-400/20 to-blue-400/10 border border-white/10">
                <p className="text-sm">Centralize approvals, payouts, and communications with confidence.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Key Features</h2>
          <a href="#get-started" className="text-sm text-emerald-300 flex items-center gap-1">
            Start now <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
            <h3 className="mt-4 font-semibold">Compliance & Moderation</h3>
            <p className="mt-2 text-sm text-slate-300">Approve products, review sellers, and maintain marketplace quality with audit logs.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <BarChart3 className="w-6 h-6 text-blue-300" />
            <h3 className="mt-4 font-semibold">Analytics & Reports</h3>
            <p className="mt-2 text-sm text-slate-300">Real-time KPIs, revenue tracking, and custom reports for stakeholders.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <Mail className="w-6 h-6 text-violet-300" />
            <h3 className="mt-4 font-semibold">Marketing Automation</h3>
            <p className="mt-2 text-sm text-slate-300">Segment audiences, send campaigns, and manage promotions from one place.</p>
          </div>
        </div>
      </section>

      <section id="audience" className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-slate-900 border border-white/10">
            <Users className="w-6 h-6 text-emerald-300" />
            <h3 className="mt-4 text-xl font-semibold">For Buyers</h3>
            <p className="mt-2 text-sm text-slate-300">A safe, verified marketplace with consistent delivery and professional support.</p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-900 border border-white/10">
            <Store className="w-6 h-6 text-blue-300" />
            <h3 className="mt-4 text-xl font-semibold">For Sellers</h3>
            <p className="mt-2 text-sm text-slate-300">Powerful tools to grow, track performance, and streamline commissions.</p>
          </div>
        </div>
      </section>

      <section id="insights" className="max-w-6xl mx-auto px-6 py-16">
        <div className="p-8 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-blue-500/10 border border-white/10">
          <h2 className="text-2xl font-semibold">Operational Insights</h2>
          <p className="mt-2 text-sm text-slate-300">Track KPIs, monitor risk, and take action quickly with built-in dashboards.</p>
          <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">Avg. approval time: 4h</div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">Refund rate: 1.2%</div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">Support SLA: 96%</div>
          </div>
        </div>
      </section>

      <section id="faq" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <div className="mt-6 grid md:grid-cols-2 gap-6 text-sm text-slate-300">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <p className="font-semibold text-white">Is this dashboard customizable?</p>
            <p className="mt-2">Yes, modules and reports can be extended based on your business needs.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <p className="font-semibold text-white">Does it support multiple seller tiers?</p>
            <p className="mt-2">You can manage tiers, commissions, and targeted promotions.</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <span>© 2026 EtsyEx Market. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a className="hover:text-white" href="/login">Admin</a>
            <a className="hover:text-white" href="#features">Features</a>
            <a className="hover:text-white" href="#faq">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
