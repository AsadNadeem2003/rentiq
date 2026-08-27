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
  Cpu,
  ArrowRightLeft,
  Server,
  Database,
  Terminal,
  Filter,
  MapPin,
  Image as ImageIcon,
  User,
  AlertTriangle,
  RefreshCw,
  Send,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClientDocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("getting-started");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // --- Interactive Playgrounds State ---
  // 1. Rent Split Calculator
  const [rentPrice, setRentPrice] = useState(75000);
  const [roommates, setRoommates] = useState(3);

  // 2. PKR Price Formatter Demo
  const [priceInput, setPriceInput] = useState(25000000);

  // 3. CNIC Validator Demo
  const [cnicInput, setCnicInput] = useState("35201-1234567-1");

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

  const formatPakistaniCurrency = (amount: number) => {
    if (!amount || amount <= 0) return "PKR 0";
    if (amount >= 10000000) {
      const crore = amount / 10000000;
      return `${crore % 1 === 0 ? crore : crore.toFixed(2)} Crore`;
    }
    if (amount >= 100000) {
      const lac = amount / 100000;
      return `${lac % 1 === 0 ? lac : lac.toFixed(2)} Lac`;
    }
    return `PKR ${amount.toLocaleString("en-PK")}`;
  };

  const isCnicValid = (cnic: string) => {
    return /^\d{5}-\d{7}-\d{1}$/.test(cnic);
  };

  const navItems = [
    { id: "getting-started", label: "Getting Started & User Guide", icon: Sparkles },
    { id: "component-mapping", label: "Component & API Flow Matrix", icon: Cpu },
    { id: "auth-security", label: "Auth & Security Architecture", icon: Lock },
    { id: "landlord-guide", label: "Landlords & Listing Rules", icon: Home },
    { id: "tenant-verification", label: "Tenant CNIC Verification", icon: ShieldCheck },
    { id: "realtime-chat", label: "Real-Time Encrypted Chat", icon: MessageSquare },
    { id: "playgrounds", label: "Interactive Playgrounds", icon: Calculator },
    { id: "api-reference", label: "Complete REST API Reference", icon: Code },
    { id: "faq", label: "Frequently Asked Questions", icon: HelpCircle },
  ];

  const faqs = [
    {
      q: "How does Rentiq ensure tenant identity verification?",
      a: "Rentiq requires a 13-digit Pakistani CNIC (e.g. 35201-1234567-1) submitted via Account Settings (/settings). All CNIC data is AES-256-GCM encrypted before database insertion. Once validated, a green Verified Renter 🛡️ badge appears on profile and property listings.",
    },
    {
      q: "What currency formatting rules are used across Pakistan?",
      a: "Prices are formatted using standard Pakistani Lac and Crore units. For instance, PKR 5,000,000 displays as 50 Lac, and PKR 25,000,000 displays as 2.5 Crore, giving local users instant readability.",
    },
    {
      q: "Is my chat conversation with property owners encrypted?",
      a: "Yes. All direct messages are encrypted server-side using AES-256-GCM encryption in CryptoService before database storage. Messages are decrypted only for authorized conversation participants.",
    },
    {
      q: "How does the Roommate Rent Split calculator work?",
      a: "Landlords can enable 'Rent Sharing' on properties. Tenants can specify roommate count, and the platform automatically calculates exact per-person monthly PKR share.",
    },
    {
      q: "What is the token expiration strategy for user sessions?",
      a: "Access tokens expire after 15 minutes in-memory, while long-lived 7-day Refresh Tokens are stored in HttpOnly, SameSite=Strict cookies. Silent token renewal runs automatically in the background via Axios response interceptor.",
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/70 text-gray-900">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white py-12 md:py-16 px-4 md:px-8 border-b border-emerald-800/60 shadow-xl relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30 mb-4 backdrop-blur-md">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                Enterprise Client & Technical Documentation Portal
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                Rentiq <span className="text-emerald-400 font-extrabold">(KirayaPad)</span> Docs
              </h1>
              <p className="mt-2 text-emerald-100/90 text-sm md:text-base max-w-3xl font-medium leading-relaxed">
                Complete User Guide, Component-by-Component API Data Flow Matrix, Security Blueprint, Interactive Demos & End-to-End REST API Specification.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/feed">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 shadow-md">
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
                placeholder="Search topics (e.g. Component Flow, CNIC verification, AES encryption, API endpoints, Lac/Crore)..."
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

      {/* Main Documentation Body */}
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
                <div className="bg-emerald-50 rounded-xl p-3.5 text-xs text-emerald-900 border border-emerald-100 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Platform Operational
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>NestJS 10 + Next.js 15 Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-8">
            {/* MODULE 1: GETTING STARTED & USER GUIDE */}
            {activeTab === "getting-started" && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      1. Getting Started & User Guide
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">
                      How general users, buyers, and tenants navigate Rentiq
                    </p>
                  </div>
                </div>

                <div className="space-y-6 text-gray-700 text-sm md:text-base">
                  <p className="leading-relaxed">
                    <strong>Rentiq (KirayaPad)</strong> is Pakistan’s direct Peer-to-Peer (P2P) property rental and sales platform. It allows users to browse verified properties, connect directly with property owners via encrypted chat, and split rent transparently without middleman fees.
                  </p>

                  {/* Step 1: Browsing Properties */}
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/80 space-y-3">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Search className="w-5 h-5 text-emerald-600" />
                      Step 1: Browsing & Filtering Properties (`/feed`)
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Visit the property feed to explore houses, apartments, and commercial spaces across Pakistan.
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 text-xs md:text-sm text-gray-700 pl-2">
                      <li><strong>City Filter:</strong> Filter listings by major Pakistani cities (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan).</li>
                      <li><strong>Listing Type:</strong> Toggle between <strong>RENT</strong> and <strong>SALE</strong> properties.</li>
                      <li><strong>PKR Price Range:</strong> Set budget constraints formatted in Lac and Crore.</li>
                      <li><strong>Roommate Filter:</strong> Filter properties that explicitly allow Rent Sharing / Roommates.</li>
                      <li><strong>Dual View Mode:</strong> Switch between standard Card Grid view and interactive Leaflet Map View.</li>
                    </ul>
                  </div>

                  {/* Step 2: Contacting Property Owners */}
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/80 space-y-3">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-emerald-600" />
                      Step 2: Contacting Property Owners (`/properties/[id]`)
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Click any property to view its image gallery, location pin, amenities, and owner details.
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 text-xs md:text-sm text-gray-700 pl-2">
                      <li>Click <strong>Message Owner</strong> to initiate an instant encrypted chat session.</li>
                      <li>If the property allows roommates, use the built-in <strong>Roommate Rent Split Calculator</strong> to see your exact per-person monthly share.</li>
                      <li>Verified owners display the green <strong>Verified Renter 🛡️</strong> badge on their profile.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 2: COMPONENT & API FLOW MATRIX (COMPONENT BY COMPONENT) */}
            {activeTab === "component-mapping" && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      2. Component-by-Component API Data Flow Matrix
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">
                      Exact mapping of Frontend Components to Backend NestJS Services, Routes & Database Tables
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Below is the complete architectural trace showing how every frontend page component connects to the NestJS backend API, which DTOs are validated, and which database tables are queried:
                  </p>

                  <div className="space-y-4">
                    {/* Component 1: Navbar */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-emerald-900 text-white px-4 py-3 font-bold text-sm flex items-center justify-between">
                        <span className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-emerald-400" /> Component: Navbar.tsx</span>
                        <span className="text-xs bg-emerald-700 px-2 py-0.5 rounded text-emerald-100">Global Header</span>
                      </div>
                      <div className="p-4 bg-gray-50/50 text-xs md:text-sm space-y-2 text-gray-700">
                        <div><strong>Trigger Actions:</strong> Unread message count badge, Auth status check, Logout toggle.</div>
                        <div><strong>Backend Endpoint:</strong> <code className="bg-gray-200 px-1.5 py-0.5 rounded font-mono text-emerald-800">GET /api/conversations</code></div>
                        <div><strong>Backend Controller / Service:</strong> <code className="font-mono text-gray-800">ConversationsController &rarr; ConversationsService.findAllForUser()</code></div>
                        <div><strong>Socket Event:</strong> <code className="font-mono text-amber-700">SocketContext (unreadCount)</code> updates on <code className="font-mono">newMessage</code> event.</div>
                      </div>
                    </div>

                    {/* Component 2: Signup & Login */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-emerald-900 text-white px-4 py-3 font-bold text-sm flex items-center justify-between">
                        <span className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-400" /> Component: (auth)/signup & (auth)/login</span>
                        <span className="text-xs bg-emerald-700 px-2 py-0.5 rounded text-emerald-100">Authentication</span>
                      </div>
                      <div className="p-4 bg-gray-50/50 text-xs md:text-sm space-y-2 text-gray-700">
                        <div><strong>Trigger Actions:</strong> User registration & credential authentication.</div>
                        <div><strong>Backend Endpoints:</strong> <code className="bg-gray-200 px-1.5 py-0.5 rounded font-mono text-emerald-800">POST /api/auth/signup</code> & <code className="bg-gray-200 px-1.5 py-0.5 rounded font-mono text-emerald-800">POST /api/auth/login</code></div>
                        <div><strong>Validation Pipe:</strong> <code className="font-mono text-gray-800">CreateUserDto</code> & <code className="font-mono text-gray-800">LoginDto</code> via <code className="font-mono">class-validator</code>.</div>
                        <div><strong>Auth Flow:</strong> Returns <code className="font-mono">accessToken</code> (15-min) and sets <code className="font-mono">refreshToken</code> in HttpOnly cookie.</div>
                        <div><strong>Database Operation:</strong> Hashes password using <code className="font-mono">bcrypt</code> and inserts into <code className="font-mono">User</code> table.</div>
                      </div>
                    </div>

                    {/* Component 3: Property Feed */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-emerald-900 text-white px-4 py-3 font-bold text-sm flex items-center justify-between">
                        <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-400" /> Component: feed/page.tsx & MapView.tsx</span>
                        <span className="text-xs bg-emerald-700 px-2 py-0.5 rounded text-emerald-100">Property Feed</span>
                      </div>
                      <div className="p-4 bg-gray-50/50 text-xs md:text-sm space-y-2 text-gray-700">
                        <div><strong>Trigger Actions:</strong> Fetching listings with live city, price, beds, and roommate filters.</div>
                        <div><strong>Backend Endpoint:</strong> <code className="bg-gray-200 px-1.5 py-0.5 rounded font-mono text-emerald-800">GET /api/properties?city=Lahore&type=RENT&minPrice=10000</code></div>
                        <div><strong>Backend Service:</strong> <code className="font-mono text-gray-800">PropertiesService.findAll(query)</code> with Prisma <code className="font-mono">where</code> clause.</div>
                        <div><strong>Database Table:</strong> Selects from <code className="font-mono">Property</code> table joined with owner profile.</div>
                      </div>
                    </div>

                    {/* Component 4: Post Listing */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-emerald-900 text-white px-4 py-3 font-bold text-sm flex items-center justify-between">
                        <span className="flex items-center gap-2"><Home className="w-4 h-4 text-emerald-400" /> Component: properties/new & LocationPickerMap.tsx</span>
                        <span className="text-xs bg-emerald-700 px-2 py-0.5 rounded text-emerald-100">Listing Creation</span>
                      </div>
                      <div className="p-4 bg-gray-50/50 text-xs md:text-sm space-y-2 text-gray-700">
                        <div><strong>Trigger Actions:</strong> Submitting new property details, PKR price, roommate settings, map coordinates, and photos.</div>
                        <div><strong>Backend Endpoint:</strong> <code className="bg-gray-200 px-1.5 py-0.5 rounded font-mono text-emerald-800">POST /api/properties</code> (Multipart Form-Data)</div>
                        <div><strong>File Storage:</strong> <code className="font-mono text-gray-800">MulterModule</code> handles image uploads to Supabase Storage bucket <code className="font-mono">properties</code>.</div>
                        <div><strong>Validation DTO:</strong> <code className="font-mono">CreatePropertyDto</code> checks price (1k to 2B PKR), title (5-100 chars), beds/baths (0-30).</div>
                      </div>
                    </div>

                    {/* Component 5: Settings / CNIC */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-emerald-900 text-white px-4 py-3 font-bold text-sm flex items-center justify-between">
                        <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Component: settings/page.tsx</span>
                        <span className="text-xs bg-emerald-700 px-2 py-0.5 rounded text-emerald-100">CNIC Identity Verification</span>
                      </div>
                      <div className="p-4 bg-gray-50/50 text-xs md:text-sm space-y-2 text-gray-700">
                        <div><strong>Trigger Actions:</strong> Submitting 13-digit Pakistani CNIC number for verification.</div>
                        <div><strong>Backend Endpoint:</strong> <code className="bg-gray-200 px-1.5 py-0.5 rounded font-mono text-emerald-800">PATCH /api/auth/verify</code></div>
                        <div><strong>Client Validation:</strong> Zod schema checks CNIC regex <code className="font-mono">^\d&#123;5&#125;-\d&#123;7&#125;-\d&#123;1&#125;$</code>.</div>
                        <div><strong>Encryption:</strong> <code className="font-mono text-gray-800">CryptoService.encrypt()</code> encrypts CNIC using AES-256-GCM before DB insertion. Updates <code className="font-mono">isVerified = true</code>.</div>
                      </div>
                    </div>

                    {/* Component 6: Real-Time Chat */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-emerald-900 text-white px-4 py-3 font-bold text-sm flex items-center justify-between">
                        <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-emerald-400" /> Component: inbox/page.tsx & chat/[id]/page.tsx</span>
                        <span className="text-xs bg-emerald-700 px-2 py-0.5 rounded text-emerald-100">Encrypted Chat</span>
                      </div>
                      <div className="p-4 bg-gray-50/50 text-xs md:text-sm space-y-2 text-gray-700">
                        <div><strong>Trigger Actions:</strong> Viewing conversation list, fetching message history, sending direct messages.</div>
                        <div><strong>Backend Endpoints:</strong> <code className="bg-gray-200 px-1.5 py-0.5 rounded font-mono text-emerald-800">GET /api/conversations/:id/messages</code> & <code className="bg-gray-200 px-1.5 py-0.5 rounded font-mono text-emerald-800">POST /api/conversations</code></div>
                        <div><strong>WebSocket Gateway:</strong> <code className="font-mono text-gray-800">ChatGateway</code> on Socket.io. Emits <code className="font-mono">joinRoom</code>, <code className="font-mono">sendMessage</code>, <code className="font-mono">newMessage</code>.</div>
                        <div><strong>Encryption:</strong> Messages decrypted on-the-fly via <code className="font-mono">CryptoService.decrypt()</code> for authorized participants.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 3: AUTH & SECURITY ARCHITECTURE */}
            {activeTab === "auth-security" && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      3. Authentication & Security Architecture
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">
                      Dual-Token Authentication, AES-256-GCM Encryption, and Supabase RLS Policies
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Security Directive 1 */}
                  <div className="p-5 rounded-2xl bg-gray-900 text-white space-y-3">
                    <div className="text-emerald-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                      <Key className="w-4 h-4" /> 1. Dual-Token Authentication System
                    </div>
                    <ul className="list-disc list-inside text-xs md:text-sm text-gray-300 space-y-1.5 leading-relaxed">
                      <li><strong>Access Token:</strong> Short-lived <strong>15-minute expiration</strong> stored in client memory.</li>
                      <li><strong>Refresh Token:</strong> Long-lived <strong>7-day expiration</strong> stored as a bcrypt hash in PostgreSQL.</li>
                      <li><strong>HttpOnly Cookie:</strong> Transmitted via <code className="text-emerald-300 font-mono">HttpOnly, SameSite=Strict, Path=/api/auth</code> browser cookie (unreadable by client JS / XSS).</li>
                      <li><strong>Silent Renewal:</strong> Axios 401 response interceptor in <code className="text-emerald-300 font-mono">AuthContext.tsx</code> automatically calls <code className="text-emerald-300 font-mono">/api/auth/refresh</code> and retries requests seamlessly.</li>
                    </ul>
                  </div>

                  {/* Security Directive 2 */}
                  <div className="p-5 rounded-2xl bg-gray-900 text-white space-y-3">
                    <div className="text-emerald-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                      <Shield className="w-4 h-4" /> 2. AES-256-GCM Message & CNIC Encryption
                    </div>
                    <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                      All chat message texts and 13-digit CNIC numbers are encrypted via NestJS <code className="text-emerald-300 font-mono">CryptoService</code> before SQL insertion and decrypted upon retrieval. Secret key is stored in <code className="text-emerald-300 font-mono">ENCRYPTION_KEY</code> environment variable.
                    </p>
                  </div>

                  {/* Security Directive 3 */}
                  <div className="p-5 rounded-2xl bg-gray-900 text-white space-y-3">
                    <div className="text-emerald-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                      <Database className="w-4 h-4" /> 3. PostgreSQL Row Level Security (RLS)
                    </div>
                    <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                      Supabase Row Level Security policies are active on <code className="text-emerald-300 font-mono">User</code>, <code className="text-emerald-300 font-mono">Property</code>, <code className="text-emerald-300 font-mono">Conversation</code>, and <code className="text-emerald-300 font-mono">Message</code> tables, ensuring users can only read/modify authorized rows.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 4: LANDLORD & LISTING RULES */}
            {activeTab === "landlord-guide" && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                    <Home className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      4. Landlord & Listing Creation Rules
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">
                      Field constraints, Pakistani currency formatting, and map coordinates
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs md:text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-200 text-gray-900 font-bold">
                          <th className="p-3">Field Name</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Constraint</th>
                          <th className="p-3">Error Format</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-gray-700">
                        <tr>
                          <td className="p-3 font-bold text-gray-900">title</td>
                          <td className="p-3">String</td>
                          <td className="p-3">5 to 100 characters</td>
                          <td className="p-3 text-red-600">Title must be between 5 and 100 characters</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-gray-900">description</td>
                          <td className="p-3">String</td>
                          <td className="p-3">15 to 2,000 characters</td>
                          <td className="p-3 text-red-600">Description must be between 15 and 2000 characters</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-gray-900">price</td>
                          <td className="p-3">Number</td>
                          <td className="p-3">1,000 to 2,000,000,000 PKR</td>
                          <td className="p-3 text-red-600">Price must be between PKR 1,000 and 2 Billion</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-gray-900">type</td>
                          <td className="p-3">Enum</td>
                          <td className="p-3">RENT or SALE</td>
                          <td className="p-3 text-red-600">Type must be either RENT or SALE</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-gray-900">beds / baths</td>
                          <td className="p-3">Integer</td>
                          <td className="p-3">0 to 30</td>
                          <td className="p-3 text-red-600">Maximum 30 bedrooms/bathrooms allowed</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-gray-900">cnicNumber</td>
                          <td className="p-3">String</td>
                          <td className="p-3">Pakistani Regex</td>
                          <td className="p-3 text-mono text-gray-800">^\d&#123;5&#125;-\d&#123;7&#125;-\d&#123;1&#125;$</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs md:text-sm text-emerald-900 space-y-1">
                    <div className="font-bold text-emerald-900">Pakistani Area Unit Conversions:</div>
                    <div className="text-emerald-800 leading-relaxed">
                      • <strong>1 Marla:</strong> ~225 Sq. Ft. &nbsp;|&nbsp; • <strong>1 Kanal:</strong> 20 Marla (~5,400 Sq. Ft.)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 5: TENANT CNIC VERIFICATION */}
            {activeTab === "tenant-verification" && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      5. Tenant CNIC Identity Verification
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">
                      Earning the green Verified Renter 🛡️ badge
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-gray-700">
                  <p className="leading-relaxed">
                    To eliminate fake accounts and build trust between Pakistani landlords and tenants, users can verify their account by submitting their 13-digit National CNIC number.
                  </p>

                  <div className="p-4 bg-gray-900 text-white rounded-xl space-y-2">
                    <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider">CNIC Verification Protocol</div>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-gray-300">
                      <li>User opens <Link href="/settings" className="text-emerald-400 font-bold hover:underline">/settings</Link> page.</li>
                      <li>User enters CNIC matching format <code className="text-emerald-300 font-mono">35201-1234567-1</code>.</li>
                      <li>Client Zod validation verifies format before network dispatch.</li>
                      <li>Backend validates payload, encrypts CNIC using AES-256-GCM, and updates <code className="text-emerald-300 font-mono">isVerified = true</code>.</li>
                      <li>Green <strong className="text-emerald-400">Verified Renter 🛡️</strong> badge automatically appears in header and property listings.</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 6: REAL-TIME CHAT */}
            {activeTab === "realtime-chat" && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      6. Real-Time Encrypted Inbox & Chat
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">
                      Socket.io WebSockets + AES-256-GCM encrypted persistence
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-gray-700">
                  <p className="leading-relaxed">
                    Chat direct messages run over real-time WebSockets on port 3001 and persist securely in PostgreSQL.
                  </p>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs text-gray-800">
                    <div className="font-bold text-gray-900">Socket.io Gateway Event Reference:</div>
                    <div className="font-mono text-xs space-y-1">
                      <div>• <strong className="text-emerald-700 font-sans">joinRoom:</strong> <code className="bg-gray-200 px-1 py-0.5 rounded text-emerald-800">socket.emit('joinRoom', &#123; conversationId &#125;)</code></div>
                      <div>• <strong className="text-emerald-700 font-sans">sendMessage:</strong> <code className="bg-gray-200 px-1 py-0.5 rounded text-emerald-800">socket.emit('sendMessage', &#123; conversationId, text &#125;)</code></div>
                      <div>• <strong className="text-emerald-700 font-sans">newMessage:</strong> <code className="bg-gray-200 px-1 py-0.5 rounded text-emerald-800">socket.on('newMessage', (message) =&gt; &#123; ... &#125;)</code></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 7: INTERACTIVE PLAYGROUNDS */}
            {activeTab === "playgrounds" && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-xs space-y-8">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      7. Interactive Live Playgrounds
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">
                      Test Pakistani currency formatting, CNIC regex validation, and rent splitting live
                    </p>
                  </div>
                </div>

                {/* Playground 1: Rent Splitter */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-600" />
                    A. Roommate Rent Split Calculator Demo
                  </h3>
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                          Total Monthly Rent (PKR)
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

                {/* Playground 2: PKR Price Formatter */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    B. Live Pakistani Currency Formatter (`Lac` / `Crore`)
                  </h3>
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                        Type PKR Price Amount
                      </label>
                      <input
                        type="number"
                        value={priceInput}
                        onChange={(e) => setPriceInput(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-gray-900 text-sm"
                      />
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-emerald-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-500 font-medium">Formatted Output:</span>
                        <div className="text-xl font-black text-emerald-700">
                          {formatPakistaniCurrency(priceInput)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Playground 3: CNIC Regex Validator */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    C. Live CNIC Regex Validator Demo
                  </h3>
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                        Type 13-Digit Pakistani CNIC
                      </label>
                      <input
                        type="text"
                        value={cnicInput}
                        onChange={(e) => setCnicInput(e.target.value)}
                        placeholder="35201-1234567-1"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-gray-900 text-sm font-mono"
                      />
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-emerald-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-500 font-medium">Validation Status:</span>
                        <div className="text-base font-bold mt-0.5">
                          {isCnicValid(cnicInput) ? (
                            <span className="text-emerald-600 flex items-center gap-1.5">
                              <CheckCircle2 className="w-5 h-5" /> Valid CNIC Format (Verified Renter 🛡️ Eligible)
                            </span>
                          ) : (
                            <span className="text-red-500 flex items-center gap-1.5">
                              <AlertTriangle className="w-5 h-5" /> Invalid Format (Must match 55555-7777777-1)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 8: COMPLETE REST API REFERENCE */}
            {activeTab === "api-reference" && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                    <Code className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      8. Complete REST API Endpoint Specification
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">
                      NestJS API endpoints, Request payloads, Headers, and cURL commands
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-emerald-900 text-sm">Live Production API Base URL</div>
                      <code className="text-xs text-emerald-700 font-mono">https://rentiq-backend-qmd6.onrender.com/api</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard("https://rentiq-backend-qmd6.onrender.com/api", "api-base")}
                      className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      {copiedText === "api-base" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* API Endpoint 1: Fetch Properties */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-900 text-white px-4 py-3 font-mono text-xs md:text-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-green-500 text-black font-bold rounded text-xs">GET</span>
                        <span className="text-emerald-400 font-bold">/api/properties</span>
                      </div>
                      <span className="text-gray-400 text-xs">Public</span>
                    </div>
                    <div className="p-4 space-y-3 text-xs md:text-sm bg-gray-50/50">
                      <div><strong>Query Parameters:</strong> <code className="font-mono text-gray-700">city, type (RENT/SALE), minPrice, maxPrice, beds, isRoommateAllowed</code></div>
                      <div><strong>cURL Command:</strong></div>
                      <pre className="bg-gray-900 text-emerald-300 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                        curl -X GET "https://rentiq-backend-qmd6.onrender.com/api/properties?city=Lahore&type=RENT"
                      </pre>
                    </div>
                  </div>

                  {/* API Endpoint 2: Register User */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-900 text-white px-4 py-3 font-mono text-xs md:text-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-500 text-white font-bold rounded text-xs">POST</span>
                        <span className="text-emerald-400 font-bold">/api/auth/signup</span>
                      </div>
                      <span className="text-gray-400 text-xs">Public</span>
                    </div>
                    <div className="p-4 space-y-3 text-xs md:text-sm bg-gray-50/50">
                      <div><strong>Request Body JSON:</strong></div>
                      <pre className="bg-gray-900 text-gray-200 p-3 rounded-lg font-mono text-xs overflow-x-auto">
{`{
  "name": "Asad Nadeem",
  "email": "asad@example.com",
  "password": "Password123!"
}`}
                      </pre>
                    </div>
                  </div>

                  {/* API Endpoint 3: Submit CNIC Verification */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-900 text-white px-4 py-3 font-mono text-xs md:text-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-500 text-black font-bold rounded text-xs">PATCH</span>
                        <span className="text-emerald-400 font-bold">/api/auth/verify</span>
                      </div>
                      <span className="text-amber-400 text-xs font-bold">Bearer Auth Required</span>
                    </div>
                    <div className="p-4 space-y-3 text-xs md:text-sm bg-gray-50/50">
                      <div><strong>Headers:</strong> <code className="font-mono text-gray-700">Authorization: Bearer &lt;accessToken&gt;</code></div>
                      <div><strong>Request Body JSON:</strong></div>
                      <pre className="bg-gray-900 text-gray-200 p-3 rounded-lg font-mono text-xs overflow-x-auto">
{`{
  "cnicNumber": "35201-1234567-1"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 9: FAQ */}
            {activeTab === "faq" && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      9. Frequently Asked Questions
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
