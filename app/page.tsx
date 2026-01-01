"use client";
import React, { useState, useEffect, useRef } from 'react';
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
  Activity, 
  ShoppingBag, 
  Coins, 
  ArrowRightLeft, 
  Users, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  Crown, 
  Medal, 
  ExternalLink, 
  PieChart, 
  History, 
  Check, 
  Loader2, 
  CreditCard, 
  AlertTriangle 
} from 'lucide-react';
import { ethers } from 'ethers'; // ✅ Imported for Real Contract Calls

// --- Web3 Config ---
const TESTNET_CHAIN_ID_HEX = '0x14a34'; // Base Sepolia (84532)
// Your Deployed RialoToken Contract Address
const CONTRACT_ADDRESS = "0x4F05c8615B50C243B5611aBc883f71d4258E9eb4"; 

// ABI to interact with RialoToken.sol
const CONTRACT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function buyTokens() payable",
  "function playGame(uint256 amount, string gameId)",
  "function decimals() view returns (uint8)",
  "event GamePlayed(address indexed player, uint256 cost, string gameId)"
];

// --- Constants & Mock Data ---
const GAME_COST = 50; 
const EXCHANGE_RATE = 0.10; // 1 RLO = $0.10

const FEATURED_GAMES = [
  {
    id: 999,
    title: "Zip Zap Puzzle",
    category: "New Release",
    players: "1.2k",
    image: "https://placehold.co/1200x600/3b0764/e8e3d5?text=PLAY+ZIP+ZAP",
    description: "Connect the RWA circuits in this high-speed logic puzzle. Fix the flow before time runs out!",
    tags: ["Puzzle", "Logic", "Official"],
    link: "/zipzap",
    isExternal: false,
    cost: 25
  },
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

const GAMES = [
  { id: 999, title: "Zip Zap Puzzle", category: "Logic", players: "1.2k", image: "https://placehold.co/400x300/3b0764/e8e3d5?text=Zip+Zap", payout: "Win $RLO", cost: 25, link: "/zipzap", isExternal: false },
  { id: 1, title: "Rialo Defender", category: "Action", players: "12.5k", image: "https://placehold.co/400x300/0f172a/e8e3d5?text=Rialo+Defender", payout: "Win $RLO", cost: 50, link: "/defender", isExternal: false },
  { id: 99, title: "KOPPPPP", category: "Indie", players: "5.2k", image: "https://placehold.co/400x300/4c1d95/e8e3d5?text=KOPPPPP", payout: "High Score", cost: 0, link: "https://koppppp.netlify.app/", isExternal: true },
  { id: 2, title: "Asset Trader", category: "Prediction", players: "8.2k", image: "https://placehold.co/400x300/1e1b4b/e8e3d5?text=Asset+Trader", payout: "98% APY", cost: 0, link: "#", isExternal: false },
  { id: 3, title: "R-Racers", category: "Racing", players: "5.1k", image: "https://placehold.co/400x300/312e81/a9ddd3?text=RiRacer", payout: "Pool Prize", cost: 0, link: "#", isExternal: false },
  { id: 4, title: "Vault Breaker", category: "Strategy", players: "3.4k", image: "https://placehold.co/400x300/111827/d1d5db?text=Vault+Breaker", payout: "1v1", cost: 0, link: "#", isExternal: false },
  { id: 5, title: "Token Chess", category: "Skill", players: "9.9k", image: "https://placehold.co/400x300/4c1d95/e8e3d5?text=Token+Chess&v=3", payout: "Tourney", cost: 0, link: "#", isExternal: false },
  { id: 6, title: "Real Estate Tycoon", category: "Sim", players: "15k", image: "https://placehold.co/400x300/14532d/86efac?text=RE+Tycoon", payout: "x500", cost: 0, link: "#", isExternal: false },
];

const ASSETS = [
  { id: 1, name: "Gold Plating", type: "Skin", price: 500, image: "https://placehold.co/200x200/d4af37/000?text=Gold+Skin", rarity: "Legendary" },
  { id: 2, name: "Plasma Cannon", type: "Weapon", price: 1200, image: "https://placehold.co/200x200/ef4444/fff?text=Plasma", rarity: "Epic" },
  { id: 3, name: "Speed Thruster", type: "Upgrade", price: 300, image: "https://placehold.co/200x200/3b82f6/fff?text=Speed", rarity: "Rare" },
  { id: 4, name: "Rialo Badge", type: "Cosmetic", price: 100, image: "https://placehold.co/200x200/e8e3d5/000?text=Badge", rarity: "Common" },
];

const CHALLENGES = [
  { id: 1, challenger: "LogicMaster", game: "Zip Zap Puzzle", stake: 50, mode: "Time Attack" },
  { id: 2, challenger: "RWA_Whale", game: "Rialo Defender", stake: 1000, mode: "High Score" },
  { id: 3, challenger: "SpeedDemon", game: "R-Racers", stake: 500, mode: "Race" },
];

const TOP_PLAYERS = [
  { rank: 1, name: "CryptoKing_99", score: "1,250,000", game: "Rialo Defender", avatar: "CK", color: "from-yellow-400 to-orange-500" },
  { rank: 2, name: "LogicMaster", score: "50,200", game: "Zip Zap Puzzle", avatar: "LM", color: "from-purple-500 to-pink-500" },
  { rank: 3, name: "SpeedDemon", score: "850,500", game: "KOPPPPP", avatar: "SD", color: "from-orange-700 to-orange-800" },
  { rank: 4, name: "PixelHunter", score: "720,000", game: "Rialo Defender", avatar: "PH", color: "from-blue-500 to-indigo-600" },
];

const CATEGORIES = [
  { name: "All Games", icon: LayoutGrid },
  { name: "Skill", icon: Swords },
  { name: "Prediction", icon: TrendingUp },
  { name: "Casino", icon: Dice5 },
];

// Define TickerItem interface
interface TickerItem {
  id: number;
  user: string;
  amount: number;
  time: string;
}

type ActivityLogItem = {
  id: number;
  text: string;
  time: string;
  type: 'win' | 'loss' | 'purchase' | 'play' | 'system';
};

export default function RCade() {
  const [currentView, setCurrentView] = useState<'games' | 'market' | 'betting' | 'account'>('games');
  const [activeCategory, setActiveCategory] = useState("All Games");
  const [searchQuery, setSearchQuery] = useState(""); 
  
  // Wallet State
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [ethBalance, setEthBalance] = useState("0.0000"); 
  const [rloBalance, setRloBalance] = useState(0); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [walletError, setWalletError] = useState("");

  // Persistent State (Local)
  const [inventory, setInventory] = useState<number[]>([]); 
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
  const [showBuyModal, setShowBuyModal] = useState(false);

  // Carousel & Ticker State
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  // --- Persistence Logic ---
  useEffect(() => {
    const savedInventory = localStorage.getItem('rcade_inventory');
    if (savedInventory) setInventory(JSON.parse(savedInventory));

    const savedLog = localStorage.getItem('rcade_activity');
    if (savedLog) setActivityLog(JSON.parse(savedLog));
    
    // Check wallet connection
    const savedWallet = localStorage.getItem('rcade_wallet_addr');
    if (savedWallet) {
        setWalletConnected(true);
        setWalletAddress(savedWallet);
        fetchEthBalance(savedWallet);
        updateRloBalance(savedWallet); // Fetch from contract
    }

    // Generate Ticker Items Client Side
    const generatedTicker = [...Array(10)].map((_, i) => ({
        id: i,
        user: `User_${902 + i}`,
        amount: Math.floor(Math.random() * 500) + 50,
        time: `${Math.floor(Math.random() * 10) + 1}m ago`
    }));
    setTickerItems(generatedTicker);
  }, []);

  const updateBalance = (newBalance: number) => {
    setRloBalance(newBalance);
    // Removed localstorage sync for balance to prioritize on-chain data
  };

  const addToInventory = (assetId: number) => {
    const newInventory = [...inventory, assetId];
    setInventory(newInventory);
    localStorage.setItem('rcade_inventory', JSON.stringify(newInventory));
  };

  const logActivity = (text: string, type: ActivityLogItem['type']) => {
    const newItem: ActivityLogItem = {
      id: Date.now(),
      text,
      time: 'Just now',
      type
    };
    const newLog = [newItem, ...activityLog].slice(0, 20); 
    setActivityLog(newLog);
    localStorage.setItem('rcade_activity', JSON.stringify(newLog));
  };

  // --- Real Web3 Logic ---
  const fetchEthBalance = async (address: string) => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
            const balanceHex = await (window as any).ethereum.request({
                method: 'eth_getBalance',
                params: [address, 'latest'],
            });
            const balanceWei = parseInt(balanceHex, 16);
            setEthBalance((balanceWei / 1e18).toFixed(4));
        } catch (err) {
            console.error("Failed to fetch ETH balance", err);
        }
    }
  };

  const updateRloBalance = async (address: string) => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
          try {
              const provider = new ethers.BrowserProvider((window as any).ethereum);
              const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
              const rawBalance = await contract.balanceOf(address);
              // Assuming 18 decimals, format properly
              const formatted = ethers.formatUnits(rawBalance, 18);
              setRloBalance(Math.floor(parseFloat(formatted)));
          } catch (e) {
              console.error("Failed to fetch RLO", e);
          }
      }
  };

  const switchToBaseSepolia = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
            await (window as any).ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: TESTNET_CHAIN_ID_HEX }],
            });
            return true;
        } catch (switchError: any) {
            if (switchError.code === 4902) {
                 alert("Please add Base Sepolia network to your wallet.");
            }
            console.error(switchError);
            return false;
        }
    }
    return false;
  };

  const handleConnectWallet = async () => {
    setIsProcessing(true);
    setWalletError("");

    if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
            const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
            await switchToBaseSepolia();
            
            if (accounts.length > 0) {
                const address = accounts[0];
                setWalletConnected(true);
                setWalletAddress(address);
                localStorage.setItem('rcade_wallet_addr', address);
                
                await fetchEthBalance(address);
                await updateRloBalance(address);
                
                logActivity('Wallet Connected', 'system');
                setShowConnectModal(false);
            }
        } catch (error: any) {
            console.error(error);
            setWalletError("Connection failed. Please check your wallet.");
        }
    } else {
        setWalletError("No wallet detected. Please install MetaMask.");
    }
    setIsProcessing(false);
  };

  const handleDisconnect = () => {
    if (confirm("Disconnect wallet?")) {
        setWalletConnected(false);
        setWalletAddress("");
        setEthBalance("0.0000");
        setRloBalance(0);
        localStorage.removeItem('rcade_wallet_addr');
    }
  };

  // --- Interactions ---
  const handlePlayGame = async (cost: number, link: string, isExternal: boolean) => {
    if (!walletConnected && cost > 0) {
      setShowConnectModal(true);
      return;
    }

    if (cost > 0) {
      if (rloBalance < cost) {
        alert("Insufficient RLO tokens! Please top up.");
        setShowBuyModal(true);
        return;
      }

      setIsProcessing(true);
      
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        // Burn Tokens Transaction (Spending to Play)
        const tx = await contract.playGame(ethers.parseUnits(cost.toString(), 18), "Game Fee");
        console.log("Play Tx:", tx.hash);
        await tx.wait(); // Wait for confirmation
        
        await updateRloBalance(walletAddress); 
        logActivity(`Played Game`, 'play');
        
        if (isExternal) window.open(link, '_blank');
        else window.location.href = link;
        
        setIsProcessing(false);

      } catch (error) {
        console.error("Game Transaction failed", error);
        alert("Transaction rejected or failed.");
        setIsProcessing(false);
      }
    } else {
      // Free game
      if (isExternal) window.open(link, '_blank');
      else window.location.href = link;
    }
  };

  const handlePurchaseAsset = (asset: typeof ASSETS[0]) => {
    if (!walletConnected) {
        setShowConnectModal(true);
        return;
    }
    if (inventory.includes(asset.id)) {
        alert("You already own this item!");
        return;
    }
    
    // For asset purchase, we are burning RLO tokens via the contract
    if (rloBalance >= asset.price) {
        (async () => {
            try {
                setIsProcessing(true);
                const provider = new ethers.BrowserProvider((window as any).ethereum);
                const signer = await provider.getSigner();
                const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
                
                // Burning the asset price amount
                const tx = await contract.playGame(ethers.parseUnits(asset.price.toString(), 18), `Asset: ${asset.name}`);
                await tx.wait();

                addToInventory(asset.id);
                await updateRloBalance(walletAddress);
                logActivity(`Purchased ${asset.name}`, 'purchase');
                alert(`Successfully purchased ${asset.name}!`);
            } catch (e) {
                console.error(e);
                alert("Purchase Transaction Failed");
            } finally {
                setIsProcessing(false);
            }
        })();
    } else {
        alert("Insufficient RLO Balance");
        setShowBuyModal(true);
    }
  };

  const handleBuyTokens = async (amount: number, costUSD: number) => {
    if (!walletConnected) {
        setShowBuyModal(false);
        setShowConnectModal(true);
        return;
    }

    setIsProcessing(true);

    if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
            await switchToBaseSepolia();

            // Convert mock USD cost to rough ETH value for testnet (e.g. 0.00001 ETH)
            const ethAmount = (costUSD * 0.00001).toFixed(6); 
            
            const provider = new ethers.BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            const tx = await contract.buyTokens({ value: ethers.parseEther(ethAmount) });
            console.log("Mint Tx:", tx.hash);
            await tx.wait();

            alert(`Successfully minted ${amount} RLO!`);
            await updateRloBalance(walletAddress);
            await fetchEthBalance(walletAddress); 
            logActivity(`Minted ${amount} RLO`, 'win');
            setShowBuyModal(false);

        } catch (error: any) {
            console.error(error);
            alert("Transaction failed or rejected.");
        }
    } else {
        alert("Wallet not found.");
    }
    setIsProcessing(false);
  };

  // --- UI Helpers ---
  const startAutoScroll = () => {
    stopAutoScroll();
    autoScrollRef.current = setInterval(() => {
      setCurrentFeaturedIndex((prev) => (prev + 1) % FEATURED_GAMES.length);
    }, 5000); 
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

  // Filter Games
  const filteredGames = currentView === 'games' 
    ? GAMES.filter(g => {
        const matchesCategory = activeCategory === "All Games" || g.category === activeCategory;
        const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }) 
    : [];

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

        <button onClick={(e) => { e.stopPropagation(); handleManualScroll('left'); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 p-3 rounded-full text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-110">
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleManualScroll('right'); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 p-3 rounded-full text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-110">
          <ChevronRight className="w-8 h-8" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {FEATURED_GAMES.map((_, idx) => (
            <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentFeaturedIndex ? 'bg-[#a9ddd3] w-6' : 'bg-white/30'}`} />
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all border ${activeCategory === cat.name ? "bg-[#1a1a1a] text-[#e8e3d5] border-[#e8e3d5]" : "bg-transparent text-gray-500 border-transparent hover:text-white hover:bg-[#111]"}`}>
                <cat.icon className="w-4 h-4" /> {cat.name}
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
                    <button onClick={() => handlePlayGame(game.cost, game.link, game.isExternal)} className="flex flex-col items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {game.cost > 0 ? <Lock className="w-8 h-8 text-black mb-1" /> : <Gamepad2 className="w-8 h-8 text-black mb-1" />}
                      <span className="text-black font-black text-lg tracking-tighter">{game.cost > 0 ? `PAY ${game.cost} RLO` : 'PLAY NOW'}</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white group-hover:text-[#a9ddd3] transition-colors">{game.title}</h3>
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

        {/* Top Players */}
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
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${player.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>{player.avatar}</div>
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
                  </div>
                </div>
              ))}
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
        {ASSETS.map((asset) => {
          const isOwned = inventory.includes(asset.id);
          return (
            <div key={asset.id} className={`bg-[#0a0a0a] rounded-2xl border ${isOwned ? 'border-[#a9ddd3]/50' : 'border-white/5'} overflow-hidden hover:border-[#e8e3d5] transition-colors group relative`}>
              {isOwned && <div className="absolute top-2 left-2 bg-[#a9ddd3] text-black text-[10px] font-bold px-2 py-1 rounded z-10 flex items-center gap-1"><Check className="w-3 h-3" /> OWNED</div>}
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
                  <button 
                    onClick={() => handlePurchaseAsset(asset)} 
                    disabled={isOwned}
                    className={`${isOwned ? 'bg-[#1a1a1a] text-gray-500 cursor-default' : 'bg-[#e8e3d5] hover:bg-white text-black'} px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide transition-colors`}
                  >
                    {isOwned ? 'Owned' : 'Buy'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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
                  <button onClick={() => rloBalance >= chal.stake ? alert('Challenge Accepted!') : setShowBuyModal(true)} className="bg-[#a9ddd3] hover:bg-white text-black px-4 py-2 rounded-lg font-bold text-xs uppercase">
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

  const renderAccount = () => (
    <div className="animate-in fade-in zoom-in duration-500 max-w-4xl mx-auto">
      <div className="bg-[#111] border border-white/10 rounded-3xl p-8 mb-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#a9ddd3] to-[#e8e3d5] flex items-center justify-center text-black shadow-2xl shadow-[#a9ddd3]/20">
            <User className="w-12 h-12" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">Player_One</h2>
            <p className="text-gray-400">Level 5 • R-CADE Member</p>
            {walletConnected && <p className="text-xs text-[#a9ddd3] font-mono mt-1">{walletAddress}</p>}
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm text-gray-500 uppercase font-bold">Total Net Worth</p>
            <h3 className="text-4xl font-black text-[#e8e3d5]">${((rloBalance * EXCHANGE_RATE) + 1250).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
            <p className="text-xs text-[#a9ddd3]">≈ {rloBalance.toLocaleString()} RLO + Assets</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
            <p className="text-gray-500 text-xs uppercase font-bold mb-1">Liquid Funds</p>
            <p className="text-2xl font-bold text-white">{rloBalance.toLocaleString()} <span className="text-sm text-[#a9ddd3]">RLO</span></p>
            {walletConnected && (
              <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                <Coins className="w-3 h-3" /> {ethBalance} ETH
              </p>
            )}
          </div>
          <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
            <p className="text-gray-500 text-xs uppercase font-bold mb-1">Asset Value</p>
            <p className="text-2xl font-bold text-white">
                {ASSETS.filter(a => inventory.includes(a.id)).length} <span className="text-sm text-[#a9ddd3]">Items</span>
            </p>
            <p className="text-xs text-gray-600 mt-1">
                Value: {ASSETS.filter(a => inventory.includes(a.id)).reduce((acc, curr) => acc + curr.price, 0).toLocaleString()} RLO
            </p>
          </div>
          <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
            <p className="text-gray-500 text-xs uppercase font-bold mb-1">Performance</p>
            <p className="text-2xl font-bold text-green-400">+12.5%</p>
            <p className="text-xs text-gray-600 mt-1">All Time</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><PieChart className="w-5 h-5 text-[#a9ddd3]" /> My Assets</h3>
        {inventory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {ASSETS.filter(a => inventory.includes(a.id)).map((asset) => (
                <div key={asset.id} className="flex items-center gap-3 bg-[#0a0a0a] p-3 rounded-xl border border-white/5 hover:border-[#a9ddd3]/30 transition-colors">
                <img src={asset.image} className="w-12 h-12 object-contain bg-[#111] rounded-lg p-1" alt={asset.name} />
                <div>
                    <p className="font-bold text-sm text-white">{asset.name}</p>
                    <p className="text-xs text-gray-500">{asset.type} • {asset.rarity}</p>
                </div>
                </div>
            ))}
            </div>
        ) : (
            <div className="text-gray-500 italic mb-8 p-4 bg-[#0a0a0a] rounded-xl border border-white/5 text-center">No assets purchased yet. Visit the Market!</div>
        )}

        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><History className="w-5 h-5 text-[#a9ddd3]" /> Recent Activity</h3>
        <div className="space-y-2">
            {activityLog.length > 0 ? activityLog.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-[#0a0a0a] p-3 rounded-xl border border-white/5 text-sm">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.type === 'win' ? 'bg-green-500' : item.type === 'loss' ? 'bg-red-500' : item.type === 'purchase' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                        <span className="text-gray-300">{item.text}</span>
                    </div>
                    <span className="font-mono text-gray-500">{item.time}</span>
                </div>
            )) : (
                <div className="text-gray-500 italic p-3 text-center">No recent activity.</div>
            )}
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
            <button onClick={() => setCurrentView('account')} className={`font-bold text-sm tracking-widest uppercase hover:text-[#a9ddd3] transition-colors ${currentView === 'account' ? 'text-[#a9ddd3]' : 'text-gray-500'}`}>Account</button>
          </div>

          <div className="flex items-center gap-4">
            <div onClick={() => !walletConnected ? setShowConnectModal(true) : handleDisconnect()} className="flex items-center gap-3 bg-[#111] pr-4 pl-2 py-1.5 rounded-full border border-white/5 hover:border-[#a9ddd3] transition-colors cursor-pointer group hover:bg-[#1a1a1a]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#a9ddd3] to-[#e8e3d5] flex items-center justify-center text-black shadow-lg shadow-[#a9ddd3]/20">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] text-gray-500 uppercase font-bold group-hover:text-[#a9ddd3]">{walletConnected ? 'Connected' : 'Connect'}</span>
                <span className="font-bold text-[#e8e3d5]">{walletConnected ? `${walletAddress.substring(0,6)}...` : 'Wallet'}</span>
              </div>
            </div>
            {walletConnected && (
                <div onClick={() => setShowBuyModal(true)} className="bg-[#a9ddd3] rounded-full w-8 h-8 flex items-center justify-center text-black font-bold text-lg cursor-pointer hover:scale-110 transition-transform">+</div>
            )}
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {currentView === 'games' && renderGames()}
        {currentView === 'market' && renderMarketplace()}
        {currentView === 'betting' && renderBetting()}
        {currentView === 'account' && renderAccount()}

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
                    <p className="text-xs text-gray-500 mt-0.5">minted <span className="text-[#a9ddd3] font-bold">{item.amount} RLO</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* --- Connect Wallet Modal --- */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-[#a9ddd3]/10 relative animate-in zoom-in duration-200">
            <button onClick={() => setShowConnectModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#a9ddd3] rounded-full flex items-center justify-center mx-auto mb-4 text-black shadow-lg shadow-[#a9ddd3]/30">
                <Wallet className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white italic">CONNECT WALLET</h2>
              <p className="text-gray-400 text-sm mt-2">Select your Web3 provider to continue.</p>
              {walletError && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200 text-xs text-left">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {walletError}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleConnectWallet}
                disabled={isProcessing}
                className="w-full flex items-center gap-4 bg-[#0a0a0a] hover:bg-[#222] border border-white/5 hover:border-[#a9ddd3] p-4 rounded-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin text-[#a9ddd3]" /> : <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-orange-600" />}
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-[#e8e3d5] font-bold text-lg">MetaMask</span>
                    <span className="text-[10px] text-gray-500 uppercase">Browser Extension</span>
                </div>
              </button>
              
              {['Coinbase Wallet', 'WalletConnect'].map((provider) => (
                <button 
                  key={provider}
                  disabled={true}
                  className="w-full flex items-center gap-4 bg-[#0a0a0a] opacity-50 border border-white/5 p-4 rounded-xl cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-gray-600" />
                  </div>
                  <span className="text-gray-500 font-bold text-lg">{provider}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- Buy Tokens Modal --- */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-[#a9ddd3]/10 relative animate-in zoom-in duration-200">
            <button onClick={() => !isProcessing && setShowBuyModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white disabled:opacity-0" disabled={isProcessing}>✕</button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#a9ddd3] rounded-full flex items-center justify-center mx-auto mb-4 text-black shadow-lg shadow-[#a9ddd3]/30">
                {isProcessing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Coins className="w-8 h-8" />}
              </div>
              <h2 className="text-2xl font-black text-white italic">{isProcessing ? 'PROCESSING...' : 'TOP UP WALLET'}</h2>
              <p className="text-gray-400 text-sm mt-2">{isProcessing ? 'Confirming transaction on Base Sepolia' : 'Purchase RLO tokens to play & trade.'}</p>
            </div>

            {!isProcessing && (
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
                    <div className="bg-[#a9ddd3] text-black font-black px-4 py-2 rounded-lg text-sm group-hover:scale-105 transition-transform flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> ${opt.cost}
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            <div className="mt-6 text-center">
              <p className="text-[10px] text-gray-600 uppercase flex items-center justify-center gap-2">
                <Lock className="w-3 h-3" /> Secure Web3 Transaction
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}