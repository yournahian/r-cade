"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, 
  Trophy, 
  Wallet, 
  Search, 
  User, 
  Zap, 
  LayoutGrid, 
  Swords, 
  Dice5,
  TrendingUp,
  Activity,
  Coins,
  Lock,
  ChevronLeft,
  ChevronRight,
  Crown,
  Medal,
  ExternalLink
} from 'lucide-react';

// --- Constants & Mock Data ---
const GAME_COST = 50; 

// Featured Games (Carousel)
const FEATURED_GAMES = [
  {
    id: 1,
    title: "Rialo Defender",
    category: "Flagship",
    players: "12.5k",
    image: "https://placehold.co/1200x600/0f172a/e8e3d5?text=PLAY+RIALO+DEFENDER",
    description: "The R-CADE's flagship shooter. Defend the RWA vault from cyber-threats and earn $RLO.",
    tags: ["Official", "Skill-Wager", "Action"],
    link: "/defender",
    isExternal: false,
    cost: 50
  },
  {
    id: 99,
    title: "KOPPPPP",
    category: "Featured Indie",
    players: "5.2k",
    image: "https://placehold.co/1200x600/4c1d95/e8e3d5?text=PLAY+KOPPPPP",
    description: "Survive the chaos in this high-intensity arcade challenge. How long can you last?",
    tags: ["Indie", "Survival", "Arcade"],
    link: "https://koppppp.netlify.app/",
    isExternal: true,
    cost: 0
  }
];

// Main Games List (Grid)
const GAMES = [
  { 
    id: 1, 
    title: "Rialo Defender", 
    category: "Action", 
    players: "12.5k", 
    image: "https://placehold.co/400x300/0f172a/e8e3d5?text=Rialo+Defender", 
    payout: "Win $RLO",
    cost: 50,
    link: "/defender",
    isExternal: false
  },
  {
    id: 99,
    title: "KOPPPPP",
    category: "Indie",
    players: "5.2k",
    image: "https://placehold.co/400x300/4c1d95/e8e3d5?text=KOPPPPP",
    payout: "High Score",
    cost: 0,
    link: "https://koppppp.netlify.app/",
    isExternal: true
  },
  { 
    id: 2, 
    title: "Asset Trader", 
    category: "Prediction", 
    players: "8.2k", 
    image: "https://placehold.co/400x300/1e1b4b/e8e3d5?text=Asset+Trader", 
    payout: "98% APY",
    cost: 0,
    link: "#",
    isExternal: false
  },
  { 
    id: 3, 
    title: "R-Racers", 
    category: "Racing", 
    players: "5.1k", 
    image: "https://placehold.co/400x300/312e81/a9ddd3?text=RiRacer", 
    payout: "Pool Prize",
    cost: 0,
    link: "#",
    isExternal: false
  },
  { 
    id: 4, 
    title: "Vault Breaker", 
    category: "Strategy", 
    players: "3.4k", 
    image: "https://placehold.co/400x300/111827/d1d5db?text=Vault+Breaker", 
    payout: "1v1",
    cost: 0,
    link: "#",
    isExternal: false
  },
  { 
    id: 5, 
    title: "Token Chess", 
    category: "Skill", 
    players: "9.9k", 
    image: "https://placehold.co/400x300/4c1d95/e8e3d5?text=Token+Chess&v=3", 
    payout: "Tourney",
    cost: 0,
    link: "#",
    isExternal: false
  },
  { 
    id: 6, 
    title: "Real Estate Tycoon", 
    category: "Sim", 
    players: "15k", 
    image: "https://placehold.co/400x300/14532d/86efac?text=RE+Tycoon", 
    payout: "x500",
    cost: 0,
    link: "#",
    isExternal: false
  },
];

const TOP_PLAYERS = [
  { rank: 1, name: "CryptoKing_99", score: "1,250,000", game: "Rialo Defender", avatar: "CK", color: "from-yellow-400 to-orange-500" },
  { rank: 2, name: "RWA_Whale", score: "980,000", game: "Asset Trader", avatar: "RW", color: "from-gray-300 to-gray-400" },
  { rank: 3, name: "SpeedDemon", score: "850,500", game: "KOPPPPP", avatar: "SD", color: "from-orange-700 to-orange-800" },
  { rank: 4, name: "PixelHunter", score: "720,000", game: "Rialo Defender", avatar: "PH", color: "from-blue-500 to-indigo-600" },
];

const ASSETS = [
  { id: 1, name: "Gold Plating", type: "Skin", price: 500, image: "https://placehold.co/200x200/d4af37/000?text=Gold+Skin", rarity: "Legendary" },
  { id: 2, name: "Plasma Cannon", type: "Weapon", price: 1200, image: "https://placehold.co/200x200/ef4444/fff?text=Plasma", rarity: "Epic" },
  { id: 3, name: "Speed Thruster", type: "Upgrade", price: 300, image: "https://placehold.co/200x200/3b82f6/fff?text=Speed", rarity: "Rare" },
  { id: 4, name: "Rialo Badge", type: "Cosmetic", price: 100, image: "https://placehold.co/200x200/e8e3d5/000?text=Badge", rarity: "Common" },
];

const CHALLENGES = [
  { id: 1, challenger: "CryptoKing_99", game: "Token Chess", stake: 200, mode: "1v1" },
  { id: 2, challenger: "RWA_Whale", game: "Rialo Defender", stake: 1000, mode: "High Score" },
  { id: 3, challenger: "SpeedDemon", game: "R-Racers", stake: 500, mode: "Race" },
];

const CATEGORIES = [
  { name: "All Games", icon: LayoutGrid },
  { name: "Skill", icon: Swords },
  { name: "Prediction", icon: TrendingUp },
  { name: "Casino", icon: Dice5 },
];

export default function RCade() {
  const [currentView, setCurrentView] = useState<'games' | 'market' | 'betting'>('games');
  const [activeCategory, setActiveCategory] = useState("All Games");
  const [searchQuery, setSearchQuery] = useState(""); 
  const [walletConnected, setWalletConnected] = useState(false);
  const [balance, setBalance] = useState(1250); 
  const [showBuyModal, setShowBuyModal] = useState(false);
  
  // Carousel State
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  // Filter Games by Category AND Search Query
  const filteredGames = currentView === 'games' 
    ? GAMES.filter(g => {
        const matchesCategory = activeCategory === "All Games" || g.category === activeCategory;
        const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }) 
    : [];
  
  // --- Auto Scroll Logic ---
  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, []);

  const startAutoScroll = () => {
    stopAutoScroll();
    autoScrollRef.current = setInterval(() => {
      setCurrentFeaturedIndex((prev) => (prev + 1) % FEATURED_GAMES.length);
    }, 5000); // 5 seconds per slide
  };

  const stopAutoScroll = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
  };

  const handleManualScroll = (direction: 'left' | 'right') => {
    stopAutoScroll();
    if (direction === 'left') {
      setCurrentFeaturedIndex((prev) => (prev === 0 ? FEATURED_GAMES.length - 1 : prev - 1));
    } else {
      setCurrentFeaturedIndex((prev) => (prev + 1) % FEATURED_GAMES.length);
    }
    setTimeout(startAutoScroll, 5000);
  };

  // --- Handlers ---
  const handlePlayGame = (cost: number, link: string, isExternal: boolean) => {
    if (balance >= cost) {
      if (cost > 0) setBalance(prev => prev - cost);
      
      if (isExternal) {
        window.open(link, '_blank');
      } else {
        if (link !== "#") {
            try {
                // Use standard navigation. In preview this might catch an error, in prod it works.
                window.location.href = link;
            } catch (e) {
                // Fallback for preview environments that block relative path navigation on blobs
                console.error("Navigation simulated due to preview environment restriction.", e);
                alert(`Navigating to ${link}`);
            }
        } else {
            alert("This game is coming soon!");
        }
      }
    } else {
      setShowBuyModal(true);
    }
  };

  const handlePurchaseAsset = (price: number, name: string) => {
    if (balance >= price) {
      setBalance(prev => prev - price);
      alert(`Successfully purchased ${name}!`);
    } else {
      setShowBuyModal(true);
    }
  };

  const handleBuyTokens = (amount: number, cost: number) => {
    alert(`Processing payment of $${cost}...`);
    setTimeout(() => {
      setBalance(prev => prev + amount);
      setShowBuyModal(false);
      alert(`Success! +${amount} RLO added to wallet.`);
    }, 1000);
  };

  const tickerItems = [...Array(10)].map((_, i) => ({
    id: i,
    user: `User_${902 + i}`,
    amount: Math.floor(Math.random() * 500) + 50,
    time: `${Math.floor(Math.random() * 10) + 1}m ago`
  }));

  // --- Render Sections ---

  const renderGames = () => (
    <>
      {/* Featured Carousel */}
      <div className="relative w-full h-[500px] rounded-[2rem] overflow-hidden mb-12 group border border-white/10 shadow-2xl shadow-black">
        {FEATURED_GAMES.map((game, index) => (
          <div 
            key={game.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentFeaturedIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <img src={game.image} alt={game.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent flex flex-col justify-end p-12">
              <div className="flex items-center gap-3 mb-4">
                 <span className="flex items-center gap-1 px-3 py-1 bg-[#a9ddd3] text-black text-[10px] font-black rounded-full uppercase tracking-widest"><Zap className="w-3 h-3 fill-black" /> {game.category}</span>
                 {game.cost > 0 && <span className="text-[#a9ddd3] text-xs font-mono font-bold tracking-widest uppercase"> Cost: {game.cost} RLO</span>}
              </div>
              <h1 className="text-5xl md:text-8xl font-black mb-4 text-white italic tracking-tighter uppercase">{game.title}</h1>
              <p className="text-gray-400 max-w-2xl text-lg mb-8 font-medium leading-relaxed">{game.description}</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => handlePlayGame(game.cost, game.link, game.isExternal)} 
                  className="bg-[#e8e3d5] hover:bg-white text-black px-10 py-5 rounded-2xl font-black text-lg flex items-center gap-3 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(232,227,213,0.3)]"
                >
                    {game.isExternal ? <ExternalLink className="w-6 h-6" /> : <Gamepad2 className="w-6 h-6" />}
                    {game.cost > 0 ? `PLAY FOR ${game.cost} RLO` : 'PLAY NOW'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Manual Controls */}
        <button 
          onClick={(e) => { e.stopPropagation(); handleManualScroll('left'); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 p-3 rounded-full text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-110"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleManualScroll('right'); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 p-3 rounded-full text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-110"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {FEATURED_GAMES.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-2 h-2 rounded-full transition-all ${idx === currentFeaturedIndex ? 'bg-[#a9ddd3] w-6' : 'bg-white/30'}`} 
            />
          ))}
        </div>
      </div>

      {/* Main Content Layout: Grid + Top Players */}
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Left Column: Games */}
        <div className="flex-1">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 no-scrollbar">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.length > 0 ? filteredGames.map((game) => (
              <div key={game.id} className="group bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/5 hover:border-[#a9ddd3] hover:shadow-[0_0_40px_rgba(169,221,211,0.15)] transition-all duration-300 cursor-pointer relative">
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute top-4 left-4 bg-black/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-[#a9ddd3] flex items-center gap-1 z-10 border border-[#a9ddd3]/20 shadow-lg">
                    <Activity className="w-3 h-3" /> {game.players}
                  </div>
                  <img src={game.image} alt={game.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-[#a9ddd3]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                    <button 
                      onClick={() => handlePlayGame(game.cost, game.link, game.isExternal)} 
                      className="flex flex-col items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                    >
                      {game.cost > 0 ? <Lock className="w-8 h-8 text-black mb-1" /> : <Gamepad2 className="w-8 h-8 text-black mb-1" />}
                      <span className="text-black font-black text-lg tracking-tighter">
                        {game.cost > 0 ? `PAY ${game.cost} RLO` : 'PLAY NOW'}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#a9ddd3] transition-colors">{game.title}</h3>
                  </div>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">{game.category}</p>
                  <div className="flex items-center justify-between text-sm bg-[#111] p-3 rounded-lg border border-white/5">
                    <span className="text-gray-400 text-xs">Potential Win</span>
                    <span className="text-[#a9ddd3] font-bold font-mono">{game.payout}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-12 text-center text-gray-500 italic">No games found matching "{searchQuery}"</div>
            )}
          </div>
        </div>

        {/* Right Column: Top Players (Hall of Fame) */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-[#111] rounded-3xl p-6 border border-white/5 sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h3 className="text-xl font-black italic text-white tracking-wide">TOP PLAYERS</h3>
            </div>
            
            <div className="space-y-4">
              {TOP_PLAYERS.map((player) => (
                <div key={player.rank} className="flex items-center gap-4 group cursor-pointer hover:bg-[#1a1a1a] p-2 rounded-xl transition-colors">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${player.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                      {player.avatar}
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-black rounded-full border border-white/10 flex items-center justify-center">
                      <span className={`text-[10px] font-bold ${player.rank === 1 ? 'text-yellow-500' : 'text-gray-400'}`}>#{player.rank}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-white group-hover:text-[#a9ddd3] transition-colors">{player.name}</h4>
                    <p className="text-xs text-gray-500">{player.game}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[#a9ddd3] font-mono font-bold text-xs">{player.score}</div>
                    <div className="text-[9px] text-gray-600 uppercase">Score</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <button className="text-xs font-bold text-gray-500 hover:text-white flex items-center justify-center gap-2 w-full">
                VIEW FULL LEADERBOARD <Medal className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );

  const renderMarketplace = () => (
    <div className="animate-in fade-in zoom-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-black text-white italic">ASSET <span className="text-[#e8e3d5]">MARKET</span></h2>
          <p className="text-gray-400">Trade skins, weapons, and upgrades.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[#111] rounded-lg text-sm text-gray-400 hover:text-white border border-white/5">Skins</button>
          <button className="px-4 py-2 bg-[#111] rounded-lg text-sm text-gray-400 hover:text-white border border-white/5">Weapons</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {ASSETS.map((asset) => (
          <div key={asset.id} className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden hover:border-[#e8e3d5] transition-colors group">
            <div className="h-48 bg-[#111] flex items-center justify-center p-4 relative">
              <span className={`absolute top-3 right-3 px-2 py-1 text-[10px] font-bold uppercase rounded ${asset.rarity === 'Legendary' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'}`}>
                {asset.rarity}
              </span>
              <img src={asset.image} className="h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" alt={asset.name} />
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg mb-1">{asset.name}</h3>
              <p className="text-xs text-gray-500 uppercase font-bold mb-4">{asset.type}</p>
              <div className="flex items-center justify-between">
                <span className="text-[#e8e3d5] font-black text-xl">{asset.price} RLO</span>
                <button onClick={() => handlePurchaseAsset(asset.price, asset.name)} className="bg-[#e8e3d5] hover:bg-white text-black px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide">
                  Buy
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBetting = () => (
    <div className="animate-in slide-in-from-right duration-500">
      <h2 className="text-4xl font-black text-white italic mb-2">LIVE <span className="text-[#a9ddd3]">BETTING</span></h2>
      <p className="text-gray-400 mb-8">Challenge players or bet against the house.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* P2P Challenges */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-[#a9ddd3]" /> Open P2P Challenges</h3>
            <button className="text-xs bg-[#111] hover:bg-[#222] px-3 py-1 rounded text-[#a9ddd3] border border-[#a9ddd3]/20">+ Create Challenge</button>
          </div>
          <div className="space-y-3">
            {CHALLENGES.map((chal) => (
              <div key={chal.id} className="bg-[#0a0a0a] border border-white/5 p-4 rounded-xl flex items-center justify-between hover:border-[#a9ddd3]/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center text-xs font-bold">
                    {chal.challenger.substring(0,2)}
                  </div>
                  <div>
                    <div className="font-bold text-white">{chal.challenger}</div>
                    <div className="text-xs text-gray-500">{chal.game} • {chal.mode}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Stake</div>
                    <div className="font-mono font-bold text-[#a9ddd3]">{chal.stake} RLO</div>
                  </div>
                  <button onClick={() => balance >= chal.stake ? alert('Challenge Accepted!') : setShowBuyModal(true)} className="bg-[#a9ddd3] hover:bg-white text-black px-4 py-2 rounded-lg font-bold text-xs uppercase">
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* House Betting */}
        <div className="bg-[#111] rounded-2xl p-6 border border-white/5 h-fit">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-6"><Dice5 className="w-5 h-5 text-purple-400" /> House Games</h3>
          
          <div className="mb-6 p-4 bg-[#0a0a0a] rounded-xl border border-white/5">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-bold text-gray-300">Rialo Price Prediction</span>
              <span className="text-xs text-green-400 font-mono">+180% Payout</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">Will $RLO be above $1.20 in 5 mins?</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-green-900/20 border border-green-500/50 text-green-400 py-2 rounded-lg font-bold text-xs hover:bg-green-900/40">HIGHER</button>
              <button className="flex-1 bg-red-900/20 border border-red-500/50 text-red-400 py-2 rounded-lg font-bold text-xs hover:bg-red-900/40">LOWER</button>
            </div>
          </div>

          <div className="p-4 bg-[#0a0a0a] rounded-xl border border-white/5">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-bold text-gray-300">Coin Flip</span>
              <span className="text-xs text-[#a9ddd3] font-mono">Double or Nothing</span>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-white/5 border border-white/10 text-white py-2 rounded-lg font-bold text-xs hover:bg-white/10">HEADS</button>
              <button className="flex-1 bg-white/5 border border-white/10 text-white py-2 rounded-lg font-bold text-xs hover:bg-white/10">TAILS</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#a9ddd3] selection:text-black overflow-x-hidden">
      
      {/* Ticker Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-scroll { animation: scroll 30s linear infinite; }
        .animate-scroll:hover { animation-play-state: paused; }
      `}} />

      {/* --- Navbar --- */}
      <nav className="border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div onClick={() => setCurrentView('games')} className="flex items-center gap-1 cursor-pointer group select-none">
              <div className="w-10 h-10 bg-[#e8e3d5] rounded-sm flex items-center justify-center transform group-hover:-translate-y-1 transition-transform border-b-4 border-[#a9ddd3]">
              <span className="text-black font-black text-2xl">R</span>
              </div>
              <div className="h-1 w-3 bg-[#e8e3d5] mx-1 rounded-full"></div>
              <span className="text-3xl font-black tracking-tighter text-white italic">CADE</span>
          </div>

          <div className="hidden md:flex gap-8">
            <button onClick={() => setCurrentView('games')} className={`font-bold text-sm tracking-widest uppercase hover:text-[#a9ddd3] transition-colors ${currentView === 'games' ? 'text-[#a9ddd3]' : 'text-gray-500'}`}>Games</button>
            <button onClick={() => setCurrentView('market')} className={`font-bold text-sm tracking-widest uppercase hover:text-[#a9ddd3] transition-colors ${currentView === 'market' ? 'text-[#a9ddd3]' : 'text-gray-500'}`}>Market</button>
            <button onClick={() => setCurrentView('betting')} className={`font-bold text-sm tracking-widest uppercase hover:text-[#a9ddd3] transition-colors ${currentView === 'betting' ? 'text-[#a9ddd3]' : 'text-gray-500'}`}>Betting</button>
          </div>

          <div className="flex items-center gap-4">
            <div onClick={() => setShowBuyModal(true)} className="flex items-center gap-3 bg-[#111] pr-4 pl-2 py-1.5 rounded-full border border-white/5 hover:border-[#a9ddd3] transition-colors cursor-pointer group hover:bg-[#1a1a1a]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#a9ddd3] to-[#e8e3d5] flex items-center justify-center text-black shadow-lg shadow-[#a9ddd3]/20">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] text-gray-500 uppercase font-bold group-hover:text-[#a9ddd3]">Balance</span>
                <span className="font-bold text-[#e8e3d5]">{balance.toLocaleString()} RLO</span>
              </div>
              <div className="bg-[#a9ddd3] rounded-full w-5 h-5 flex items-center justify-center text-black font-bold text-xs ml-1">+</div>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {currentView === 'games' && renderGames()}
        {currentView === 'market' && renderMarketplace()}
        {currentView === 'betting' && renderBetting()}

        {/* --- Live Ticker --- */}
        <div className="mt-24 border-t border-white/5 pt-8 overflow-hidden relative">
          <div className="flex items-center justify-between mb-6 px-6">
            <h2 className="text-2xl font-black italic tracking-tighter text-white">LIVE <span className="text-[#e8e3d5]">FEED</span></h2>
            <div className="flex items-center gap-2 text-xs text-[#a9ddd3] font-mono">
              <div className="w-2 h-2 bg-[#a9ddd3] rounded-full animate-pulse"></div>
              REAL-TIME
            </div>
          </div>
          <div className="flex w-full overflow-hidden mask-linear relative">
            <div className="flex gap-4 animate-scroll whitespace-nowrap">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <div key={i} className="min-w-[280px] bg-[#0a0a0a] p-4 rounded-xl border border-white/5 flex items-center gap-3 hover:border-[#e8e3d5]/30 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-[#111] border border-white/5 flex items-center justify-center text-xs font-mono text-gray-500">TX-{item.id}</div>
                  <div>
                    <div className="flex items-center gap-2">
                       <span className="text-white font-bold text-sm">{item.user}</span>
                       <span className="text-[10px] bg-green-500/20 text-green-400 px-1 rounded">WON</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">minted <span className="text-[#a9ddd3] font-bold">{Math.floor(Math.random()*500)} RLO</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* --- Buy Tokens Modal --- */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-[#a9ddd3]/10 relative animate-in zoom-in duration-200">
            <button onClick={() => setShowBuyModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#a9ddd3] rounded-full flex items-center justify-center mx-auto mb-4 text-black shadow-lg shadow-[#a9ddd3]/30">
                <Coins className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white italic">TOP UP WALLET</h2>
              <p className="text-gray-400 text-sm mt-2">You need RLO tokens to play games and trade assets.</p>
            </div>

            <div className="space-y-3">
              {[
                { amount: 100, cost: 5, label: "Starter" },
                { amount: 500, cost: 20, label: "Popular" },
                { amount: 1500, cost: 50, label: "Whale" },
              ].map((opt) => (
                <button 
                  key={opt.amount}
                  onClick={() => handleBuyTokens(opt.amount, opt.cost)}
                  className="w-full flex items-center justify-between bg-[#0a0a0a] hover:bg-[#222] border border-white/5 hover:border-[#a9ddd3] p-4 rounded-xl transition-all group"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[#e8e3d5] font-bold text-lg">{opt.amount} RLO</span>
                    <span className="text-[10px] uppercase text-gray-500 font-bold">{opt.label} Pack</span>
                  </div>
                  <div className="bg-[#a9ddd3] text-black font-black px-4 py-2 rounded-lg text-sm group-hover:scale-105 transition-transform">
                    ${opt.cost}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-[10px] text-gray-600 uppercase">Secure Payment via Stripe / Crypto</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}