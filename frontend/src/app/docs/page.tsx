"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Shield,
  Home,
  UserCheck,
  Lock,
  MessageSquare,
  Code,
  HelpCircle,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Calculator,
  ArrowRight,
  Building2,
  Sparkles,
  Zap,
  DollarSign,
  Key,
  ShieldCheck,
  FileText,
  Layers,
  Smartphone,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClientDocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Interactive Rent Split Calculator State in Docs
  const [rentPrice, setRentPrice] = useState(60000);
  const [roommates, setRoommates] = useState(3);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const calculateSplit = () => {
    if (!roommates || roommates < 1) return rentPrice;
    return Math.round(rentPrice / roommates);
  };

  const navItems = [
    { id: "overview", label: "Overview & Platform", icon: Sparkles },
    { id: "tenant-guide", label: "Tenant & Buyer Guide", icon: ShieldCheck },
    { id: "landlord-guide", label: "Landlord & Owner Guide", icon: Home },
    { id: "security-arch", label: "Security & Encryption", icon: Lock },
    { id: "chat-inbox", label: "Encrypted Chat & Inbox", icon: MessageSquare },
    { id: "developer-api", label: "API & Developer Hub", icon: Code },
    { id: "faq", label: "Frequently Asked Questions", icon: HelpCircle },
  ];

  const faqs = [
    {
      q: "How does Rentiq ensure tenant identity verification?",
      a: "Rentiq requires a 13-digit Pakistani CNIC (e.g. 35201-1234567-1) submitted via Account Settings. All CNIC data is AES-256-GCM encrypted before storage. Once validated, a green Verified Renter 🛡️ badge appears on profile and listings.",
    },
    {
      q: "What currency formatting rules are used across Pakistan?",
      a: "Prices are formatted using standard Pakistani Lac and Crore units. For instance, PKR 5,000,000 displays as 50 Lac, and PKR 25,000,000 displays as 2.5 Crore, giving local users instant price readability.",
    },
    {
      q: "Is my chat conversation with property owners encrypted?",
      a: "Yes. All direct messages are encrypted server-side using AES-256-GCM encryption before database insertion. Messages are decrypted only for authorized conversation participants.",
    },
    {
      q: "How does the Roommate Rent Split calculator work?",
      a: "Landlords can enable 'Rent Sharing' on properties. Tenants can specify roommate count, and the platform automatically calculates exact per-person monthly PKR share.",
    },
    {
      q: "What is the token expiration strategy for user sessions?",
      a: "Access tokens expire after 15 minutes in-memory, while long-lived 7-day Refresh Tokens are stored in HttpOnly, SameSite=Strict cookies. Silent token renewal runs automatically in the background.",
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/70 text-gray-900">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 text-white py-12 md:py-16 px-4 md:px-8 border-b border-emerald-700/50 shadow-lg relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30 mb-4 backdrop-blur-md">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Enterprise Client Documentation Portal v1.0
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                Rentiq <span className="text-emerald-400 font-extrabold">(KirayaPad)</span> Docs
              </h1>
              <p className="mt-2 text-emerald-100/90 text-sm md:text-base max-w-2xl font-medium">
                End-to-End User Manual, Security Blueprint, API Reference & Tenant Verification Portal for Pakistan's P2P Rental Ecosystem.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/feed">
                <Button className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold gap-2 shadow-md">
                  <Building2 className="w-4 h-4" /> Live Property Feed
                </Button>
              </Link>
              <a
                href="https://rentiq-backend-qmd6.onrender.com/api/properties"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" className="border-emerald-500/40 text-emerald-100 hover:bg-emerald-800/60 font-semibold gap-2">
                  <ExternalLink className="w-4 h-4 text-emerald-400" /> Live Backend API
                </Button>
              </a>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search documentation (e.g. CNIC verification, AES encryption, PKR price formatting, API endpoints)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 bg-white shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-medium placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded-md font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Documentation Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 space-y-1">
              <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Documentation Modules
              </div>

              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/60"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-600"}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}

              <div className="pt-4 mt-4 border-t border-gray-100">
                <div className="bg-emerald-50 rounded-xl p-3.5 text-xs text-emerald-900 border border-emerald-100">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> System Status
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Backend & Database Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Viewer */}
          <div className="lg:col-span-9 space-y-8">
            {/* TAB 1: OVERVIEW & PLATFORM */}
            {activeTab === "overview" && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      Platform Overview & Architecture
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">
                      Next-Gen Peer-to-Peer Real Estate Ecosystem tailored for Pakistan
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  <strong>Rentiq (KirayaPad)</strong> is a state-of-the-art Peer-to-Peer (P2P) Property Rental & Sales platform designed to eliminate opaque commissions, streamline tenant verification via CNIC identity badges, and provide localized Pakistani currency formatting.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-emerald-50/30 border border-emerald-100">
                    <Building2 className="w-6 h-6 text-emerald-600 mb-2" />
                    <h3 className="font-bold text-gray-900 text-sm">P2P Listings</h3>
                    <p className="text-xs text-gray-600 mt-1">Direct contact between property owners, buyers, and tenants without broker markup.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-emerald-50/30 border border-emerald-100">
                    <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
                    <h3 className="font-bold text-gray-900 text-sm">Verified Renter 🛡️</h3>
                    <p className="text-xs text-gray-600 mt-1">13-digit Pakistani CNIC validation yielding trusted green verification badges.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-emerald-50/30 border border-emerald-100">
                    <Lock className="w-6 h-6 text-emerald-600 mb-2" />
                    <h3 className="font-bold text-gray-900 text-sm">AES-256 Encryption</h3>
                    <p className="text-xs text-gray-600 mt-1">Server-side encryption for direct chat messages & identity numbers before storage.</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 text-xs md:text-sm text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-2 text-amber-900">
                    <Zap className="w-4 h-4 text-amber-600" /> High-Performance Tech Stack
                  </div>
                  <p className="text-amber-800/90 leading-relaxed">
                    Built with <strong>Next.js 15 (App Router, React 19)</strong> on the frontend, <strong>NestJS 10</strong> microservices on the backend, <strong>PostgreSQL with Row Level Security (RLS)</strong> on Supabase, and real-time <strong>Socket.io</strong> message streaming.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: TENANT & BUYER GUIDE */}
            {activeTab === "tenant-guide" && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      Tenant & Buyer Guide
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">
                      Search properties, calculate rent split, and get verified
                    </p>
                  </div>
                </div>

                {/* CNIC Verification Section */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    1. National CNIC Identity Verification
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Tenants earn the official green <strong>Verified Renter 🛡️</strong> badge by navigating to <Link href="/settings" className="text-emerald-700 font-bold hover:underline">/settings</Link> and submitting their 13-digit Pakistani CNIC.
                  </p>

                  <div className="bg-gray-900 text-white rounded-xl p-4 font-mono text-xs flex items-center justify-between">
                    <div>
                      <span className="text-gray-400">// Accepted CNIC Regex Pattern:</span>
                      <div className="text-emerald-400 font-bold mt-1">^\d&#123;5&#125;-\d&#123;7&#125;-\d&#123;1&#125;$ &nbsp;(e.g. 35201-1234567-1)</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard("35201-1234567-1", "cnic")}
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
                    >
                      {copiedText === "cnic" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Interactive Rent Split Widget inside Docs */}
                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-emerald-600" />
                    2. Interactive Roommate Rent-Split Calculator
                  </h3>
                  <p className="text-sm text-gray-600">
                    Test how Rentiq automatically splits total monthly PKR rent among roommates:
                  </p>

                  <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                          Total Rent (PKR)
                        </label>
                        <input
                          type="number"
                          value={rentPrice}
                          onChange={(e) => setRentPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-gray-900 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                          Number of Roommates
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={roommates}
                          onChange={(e) => setRoommates(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-gray-900 text-sm"
                        />
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-emerald-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-500 font-medium">Per Person Monthly Share:</span>
                        <div className="text-xl font-black text-emerald-700">
                          PKR {calculateSplit().toLocaleString()} / person
                        </div>
                      </div>
                      <div className="text-xs font-semibold px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full">
                        {roommates} Way Split
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LANDLORD & OWNER GUIDE */}
            {activeTab === "landlord-guide" && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                    <Home className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      Landlord & Property Owner Guide
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">
                      Post property listings, set Pakistani currency values, and control status
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Pakistani Currency Utility (`Lac` & `Crore`)
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Rentiq automatically converts numerical price inputs into standard Pakistani units:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="font-bold text-gray-900">Input: PKR 5,000,000</div>
                      <div className="text-emerald-700 font-extrabold mt-1">Formatted: 50 Lac</div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="font-bold text-gray-900">Input: PKR 25,000,000</div>
                      <div className="text-emerald-700 font-extrabold mt-1">Formatted: 2.5 Crore</div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h4 className="font-bold text-gray-900 text-sm mb-2">1-Click Price Quick Adders in Form:</h4>
                    <div className="flex flex-wrap gap-2">
                      {["+ 1 Lac", "+ 5 Lac", "+ 50 Lac", "+ 1 Crore"].map((btn) => (
                        <span key={btn} className="px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                          {btn}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="font-bold text-gray-900 text-sm mb-2">Listing Status Lifecycle:</h4>
                    <div className="flex flex-wrap gap-3">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">AVAILABLE</span>
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">RENTED</span>
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-bold">SOLD</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SECURITY & ENCRYPTION */}
            {activeTab === "security-arch" && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      Security & Privacy Architecture
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">
                      AES-256-GCM, Dual-Token Auth & PostgreSQL Row Level Security (RLS)
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gray-900 text-white space-y-2">
                    <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                      <Key className="w-4 h-4" /> 1. AES-256-GCM Server-Side Encryption
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      All direct chat message texts and 13-digit CNIC numbers are encrypted via <code className="text-emerald-300 font-mono">CryptoService</code> in NestJS before inserting into PostgreSQL tables.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-900 text-white space-y-2">
                    <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                      <Shield className="w-4 h-4" /> 2. Dual-Token HttpOnly Authentication
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      15-Minute Access Tokens stored in memory + 7-Day Refresh Tokens stored in <code className="text-emerald-300 font-mono">HttpOnly, SameSite=Strict</code> cookies. Silent renewal handles expired sessions automatically.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-900 text-white space-y-2">
                    <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4" /> 3. Database Row Level Security (RLS)
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Strict policies active on <code className="text-emerald-300 font-mono">Property</code>, <code className="text-emerald-300 font-mono">Conversation</code>, and <code className="text-emerald-300 font-mono">Message</code> tables on Supabase.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: CHAT & INBOX */}
            {activeTab === "chat-inbox" && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      Encrypted Real-Time Inbox & Chat
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">
                      Socket.io real-time delivery with Verified Renter badges
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-gray-700">
                  <p>
                    Rentiq features an end-to-end integrated messaging system accessed via <Link href="/inbox" className="text-emerald-700 font-bold hover:underline">/inbox</Link>.
                  </p>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                    <div className="font-bold text-gray-900">Real-Time WebSocket Events:</div>
                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 font-mono">
                      <li>joinRoom &mdash; Joins authenticated conversation room</li>
                      <li>sendMessage &mdash; Encrypts and emits message payload</li>
                      <li>newMessage &mdash; Decrypts and pushes message to receiver client</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: DEVELOPER API HUB */}
            {activeTab === "developer-api" && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                    <Code className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      API & Developer Hub
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">
                      NestJS 10 REST endpoints, DTO validation, and Swagger UI
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div>
                      <div className="font-bold text-emerald-900 text-sm">Live Production API Base URL</div>
                      <code className="text-xs text-emerald-700 font-mono">https://rentiq-backend-qmd6.onrender.com/api</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard("https://rentiq-backend-qmd6.onrender.com/api", "api-url")}
                      className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      {copiedText === "api-url" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-900 text-sm">Key REST Endpoints:</h3>
                    <div className="bg-gray-900 text-gray-200 rounded-xl p-4 font-mono text-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-green-500 text-black font-bold rounded">GET</span>
                        <span>/api/properties &mdash; Fetch property feed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-500 text-white font-bold rounded">POST</span>
                        <span>/api/auth/signup &mdash; Register new user</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-500 text-white font-bold rounded">POST</span>
                        <span>/api/auth/login &mdash; Authenticate user & issue cookie</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-500 text-black font-bold rounded">PATCH</span>
                        <span>/api/auth/verify &mdash; Submit CNIC for verification</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: FAQ */}
            {activeTab === "faq" && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      Frequently Asked Questions
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">
                      Common client questions regarding security, verification, and features
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                        className="w-full flex items-center justify-between p-4 text-left bg-gray-50/60 hover:bg-gray-50 font-bold text-gray-900 text-sm transition-colors"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-500 transition-transform ${
                            openFaq === index ? "rotate-180 text-emerald-600" : ""
                          }`}
                        />
                      </button>

                      {openFaq === index && (
                        <div className="p-4 bg-white border-t border-gray-100 text-xs md:text-sm text-gray-600 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
