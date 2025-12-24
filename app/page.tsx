"use client";
import React, { useState } from 'react';
// import Link from 'next/link'; // Using <a> tags for preview stability
import { 
  Gamepad2, 
  Trophy, 
  Wallet, 
  Flame, 
  Search, 
  User, 
  Zap, 
  LayoutGrid, 
  Swords, 
  Dice5,
  TrendingUp,
  Activity
} from 'lucide-react';

// --- Mock Data ---
const FEATURED_GAME = {
  id: 1,
  title: "Rialo Defender",
  category: "Flagship",
  players: "12.5k",
  image: "https://placehold.co/1200x600/0f172a/e8e3d5?text=PLAY+RIALO+DEFENDER",
  description: "The R-CADE's flagship shooter. Defend the RWA vault from cyber-threats and earn $RLO.",
  tags: ["Official", "Skill-Wager", "Action"]
};

const GAMES = [
  { 
    id: 2, 
    title: "Asset Trader", 
    category: "Prediction", 
    players: "8.2k", 
    image: "https://placehold.co/400x300/1e1b4b/e8e3d5?text=Asset+Trader", 
    payout: "98% APY" 
  },
  { 
    id: 3, 
    title: "R-Racers", 
    category: "Racing", 
    players: "5.1k", 
    image: "https://placehold.co/400x300/312e81/a9ddd3?text=RiRacer", 
    payout: "Pool Prize" 
  },
  { 
    id: 4, 
    title: "Vault Breaker", 
    category: "Strategy", 
    players: "3.4k", 
    image: "https://placehold.co/400x300/111827/d1d5db?text=Vault+Breaker", 
    payout: "1v1" 
  },
  { 
    id: 5, 
    title: "Token Chess", 
    category: "Skill", 
    players: "9.9k", 
    // FIXED: Changed to a new color scheme and added version param to force refresh
    image: "https://placehold.co/400x300/4c1d95/e8e3d5?text=Token+Chess&v=2", 
    payout: "Tourney" 
  },
  { 
    id: 6, 
    title: "Real Estate Tycoon", 
    category: "Sim", 
    players: "15k", 
    image: "https://placehold.co/400x300/14532d/86efac?text=RE+Tycoon", 
    payout: "x500" 
  },
];

const CATEGORIES = [
  { name: "All Games", icon: LayoutGrid },
  { name: "Skill", icon: Swords },
  { name: "Prediction", icon: TrendingUp },
  { name: "Casino", icon: Dice5 },
];

export default function RCade() {
  const [activeCategory, setActiveCategory] = useState("All Games");
  const [walletConnected, setWalletConnected] = useState(false);
  const [balance, setBalance] = useState(1250); 

  const filteredGames = activeCategory === "All Games" 
    ? GAMES 
    : GAMES.filter(g => g.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#a9ddd3] selection:text-black">
      
      {/* --- Navbar --- */}
      <nav className="border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* R-CADE BRANDING */}
          <a href="/">
            <div className="flex items-center gap-1 cursor-pointer group select-none">
                <div className="w-10 h-10 bg-[#e8e3d5] rounded-sm flex items-center justify-center transform group-hover:-translate-y-1 transition-transform border-b-4 border-[#a9ddd3]">
                <span className="text-black font-black text-2xl">R</span>
                </div>
                <div className="h-1 w-3 bg-[#e8e3d5] mx-1 rounded-full"></div>
                <span className="text-3xl font-black tracking-tighter text-white italic">CADE</span>
            </div>
          </a>

          {/* Search */}
          <div className="hidden md:flex items-center bg-[#111] rounded-full px-4 py-2 w-96 border border-white/5 focus-within:border-[#a9ddd3] transition-colors">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input 
              type="text" 
              placeholder="Search the arcade..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-600 text-[#e8e3d5]"
            />
          </div>

          {/* Wallet Actions */}
          <div className="flex items-center gap-4">
            {walletConnected ? (
              <div className="flex items-center gap-3 bg-[#111] pr-4 pl-2 py-1.5 rounded-full border border-white/5 hover:border-[#a9ddd3] transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#a9ddd3] to-[#e8e3d5] flex items-center justify-center text-black shadow-lg shadow-[#a9ddd3]/20">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] text-gray-500 uppercase font-bold group-hover:text-[#a9ddd3]">Connected</span>
                  <span className="font-bold text-[#e8e3d5]">{balance.toLocaleString()} RLO</span>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setWalletConnected(true)}
                className="bg-[#a9ddd3] text-black px-6 py-2.5 rounded-full font-black hover:bg-[#e8e3d5] transition-all transform hover:scale-105 flex items-center gap-2 uppercase tracking-wide text-xs"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* --- Hero Banner --- */}
        <div className="relative w-full h-[500px] rounded-[2rem] overflow-hidden mb-12 group cursor-pointer border border-white/10 hover:border-[#a9ddd3]/50 transition-all shadow-2xl shadow-black">
          <img 
            src={FEATURED_GAME.image} 
            alt="Hero" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent flex flex-col justify-end p-12">
            
            <div className="flex items-center gap-3 mb-4">
               <span className="flex items-center gap-1 px-3 py-1 bg-[#a9ddd3] text-black text-[10px] font-black rounded-full uppercase tracking-widest">
                  <Zap className="w-3 h-3 fill-black" /> Flagship
               </span>
               <span className="text-[#a9ddd3] text-xs font-mono font-bold tracking-widest uppercase"> Season 1 Live</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black mb-4 text-white italic tracking-tighter">
              RIALO <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e8e3d5] to-[#a9ddd3]">DEFENDER</span>
            </h1>
            
            <p className="text-gray-400 max-w-2xl text-lg mb-8 font-medium leading-relaxed">
              {FEATURED_GAME.description}
            </p>
            
            <div className="flex gap-4">
              {/* Link to the Game Page */}
              <a href="/defender">
                <button className="bg-[#e8e3d5] hover:bg-white text-black px-10 py-5 rounded-2xl font-black text-lg flex items-center gap-3 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(232,227,213,0.3)]">
                    <Gamepad2 className="w-6 h-6" /> PLAY NOW
                </button>
              </a>
              <button className="bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-white/10 text-white px-8 py-5 rounded-2xl font-bold flex items-center gap-2 transition-all hover:border-[#a9ddd3]">
                <Trophy className="w-5 h-5 text-[#a9ddd3]" /> LEADERBOARD
              </button>
            </div>
          </div>
        </div>

        {/* --- Category Tabs --- */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-10 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all border ${
                activeCategory === cat.name 
                  ? "bg-[#1a1a1a] text-[#e8e3d5] border-[#e8e3d5]" 
                  : "bg-transparent text-gray-500 border-transparent hover:text-white hover:bg-[#111]"
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* --- Game Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <div key={game.id} className="group bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/5 hover:border-[#a9ddd3] hover:shadow-[0_0_40px_rgba(169,221,211,0.15)] transition-all duration-300 cursor-pointer relative">
              
              {/* Image Container */}
              <div className="relative h-56 overflow-hidden">
                <div className="absolute top-4 left-4 bg-black/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-[#a9ddd3] flex items-center gap-1 z-10 border border-[#a9ddd3]/20 shadow-lg">
                  <Activity className="w-3 h-3" />
                  {game.players} Online
                </div>
                <img 
                  src={game.image} 
                  alt={game.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-110"
                />
                
                {/* Hover Play Overlay */}
                <div className="absolute inset-0 bg-[#a9ddd3]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <Gamepad2 className="w-12 h-12 text-black" />
                    <span className="text-black font-black text-xl tracking-tighter">START GAME</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-xl font-bold text-white group-hover:text-[#a9ddd3] transition-colors">{game.title}</h3>
                </div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">{game.category}</p>
                
                <div className="flex items-center justify-between text-sm bg-[#111] p-3 rounded-lg border border-white/5 group-hover:border-[#a9ddd3]/30 transition-colors">
                  <span className="text-gray-400 text-xs">Potential Yield</span>
                  <span className="text-[#a9ddd3] font-bold font-mono">{game.payout}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- Live Ticker (Stock Market Style) --- */}
        <div className="mt-24 border-t border-white/5 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black italic tracking-tighter text-white">LIVE <span className="text-[#e8e3d5]">FEED</span></h2>
            <div className="flex items-center gap-2 text-xs text-[#a9ddd3] font-mono">
              <div className="w-2 h-2 bg-[#a9ddd3] rounded-full animate-pulse"></div>
              REAL-TIME
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 overflow-hidden mask-linear">
            {[1,2,3,4].map((_, i) => (
              <div key={i} className="flex-1 bg-[#0a0a0a] p-4 rounded-xl border border-white/5 flex items-center gap-3 hover:border-[#e8e3d5]/30 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-[#111] border border-white/5 flex items-center justify-center text-xs font-mono text-gray-500 group-hover:text-[#e8e3d5] transition-colors">
                  TX-{i}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                     <span className="text-white font-bold text-sm">User_{902+i}</span>
                     <span className="text-[10px] bg-green-500/20 text-green-400 px-1 rounded">WON</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">minted <span className="text-[#a9ddd3] font-bold">250 RLO</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}