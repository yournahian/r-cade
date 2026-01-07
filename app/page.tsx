"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, Trophy, Wallet, Flame, Search, User, Zap, LayoutGrid, Swords, Dice5, 
  TrendingUp, Activity, ShoppingBag, Coins, ArrowRightLeft, Users, Lock, ChevronLeft, 
  ChevronRight, Crown, Medal, ExternalLink, PieChart, History, Check, Loader2, 
  CreditCard, AlertTriangle, Edit3, PlusCircle
} from 'lucide-react';
import { ethers } from 'ethers'; 

// --- Web3 Config ---
const TESTNET_CHAIN_ID_HEX = '0x14a34'; // Base Sepolia (84532)
const CONTRACT_ADDRESS = "0x4F05c8615B50C243B5611aBc883f71d4258E9eb4"; 

// ABI
const CONTRACT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function buyTokens() payable",
  "function playGame(uint256 amount, string gameId)",
  "function decimals() view returns (uint8)",
  "event GamePlayed(address indexed player, uint256 cost, string gameId)"
];

// --- Constants ---
const GAME_COST = 50; 
const ETH_PER_RLO = 0.000004; // 100 RLO = 0.0004 ETH

// --- Data ---
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
  const [username, setUsername] = useState("");
  const [ethBalance, setEthBalance] = useState("0.0000"); 
  const [rloBalance, setRloBalance] = useState(0); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [walletError, setWalletError] = useState("");

  // Persistent State (Local)
  const [balance, setBalance] = useState(0); // Initial balance 0
  const [inventory, setInventory] = useState<number[]>([]); 
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false); 

  // Stats
  const [performance, setPerformance] = useState(0);
  const [netWorth, setNetWorth] = useState(0);

  // Carousel & Ticker State
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  // --- Persistence Logic ---
  useEffect(() => {
    // Inventory & Activity Persistence
    const savedInventory = localStorage.getItem('rcade_inventory');
    if (savedInventory) setInventory(JSON.parse(savedInventory));

    const savedLog = localStorage.getItem('rcade_activity');
    if (savedLog) setActivityLog(JSON.parse(savedLog));
    
    // Wallet Persistence
    const savedWallet = localStorage.getItem('rcade_wallet_addr');
    if (savedWallet) {
        setWalletConnected(true);
        setWalletAddress(savedWallet);
        fetchEthBalance(savedWallet);
        updateRloBalance(savedWallet); 
        
        // Load username
        const savedUser = localStorage.getItem(`rcade_user_${savedWallet}`);
        if (savedUser) {
            setUsername(savedUser);
        } else {
            const randName = `Player_${Math.floor(Math.random() * 10000)}`;
            setUsername(randName);
            localStorage.setItem(`rcade_user_${savedWallet}`, randName);
        }
    }

    // Ticker (Client-Side Only)
    const generatedTicker = [...Array(10)].map((_, i) => ({
        id: i,
        user: `User_${902 + i}`,
        amount: Math.floor(Math.random() * 500) + 50,
        time: `${Math.floor(Math.random() * 10) + 1}m ago`
    }));
    setTickerItems(generatedTicker);
  }, []);

  // Recalculate Performance & Net Worth
  useEffect(() => {
    // 0.0004 ETH per 100 RLO -> 1 RLO = 0.000004 ETH
    // USD Price approx: 0.000004 * 3000 = $0.012
    const MOCK_USD_PER_RLO = 0.012; 
    
    const assetValueRLO = ASSETS.filter(a => inventory.includes(a.id)).reduce((acc, curr) => acc + curr.price, 0);
    const totalWealthRLO = rloBalance + assetValueRLO;
    const totalWealthUSD = totalWealthRLO * MOCK_USD_PER_RLO;
    
    setNetWorth(totalWealthUSD);
    
    // Performance Algo: Current vs 0 start
    let perf = 0;
    if (totalWealthUSD > 0) {
        perf = parseFloat((totalWealthUSD / 10).toFixed(2));
    }
    setPerformance(perf);
  }, [rloBalance, inventory]);

  const updateBalanceLocal = (newBalance: number) => {
    setRloBalance(newBalance);
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

  const handleUpdateUsername = (newName: string) => {
    if (newName.trim()) {
        setUsername(newName);
        if (walletAddress) {
            localStorage.setItem(`rcade_user_${walletAddress}`, newName);
        }
        setShowUsernameModal(false);
    }
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
      try {
          if (typeof window !== 'undefined' && (window as any).ethereum) {
              const provider = new ethers.BrowserProvider((window as any).ethereum);
              const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
              const rawBalance = await contract.balanceOf(address);
              // Assuming 18 decimals, format properly
              const formatted = ethers.formatUnits(rawBalance, 18);
              setRloBalance(Math.floor(parseFloat(formatted)));
          }
      } catch (e) {
          console.error("Failed to fetch RLO from contract (Check network)", e);
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
                 alert("Please add Base Sepolia network to your wallet to continue.");
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
                
                // Load/Init Username
                const savedUser = localStorage.getItem(`rcade_user_${address}`);
                if (!savedUser) {
                     const randName = `Player_${Math.floor(Math.random() * 10000)}`;
                     setUsername(randName);
                     localStorage.setItem(`rcade_user_${address}`, randName);
                } else {
                    setUsername(savedUser);
                }

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
        setUsername("");
        localStorage.removeItem('rcade_wallet_addr');
    }
  };

  // --- Interactions ---
  
  const handleBuyTokens = async (amount: number) => {
    if (!walletConnected) {
        setShowBuyModal(false);
        setShowConnectModal(true);
        return;
    }

    setIsProcessing(true);

    if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
            await switchToBaseSepolia();

            // Calculate exact ETH cost using constant
            const costETH = (amount * ETH_PER_RLO).toFixed(7);

            const provider = new ethers.BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            // Send Transaction with GAS LIMIT explicit setting to avoid estimation errors
            const tx = await contract.buyTokens({ 
                value: ethers.parseEther(costETH),
                gasLimit: 300000 
            });
            console.log("Mint Tx:", tx.hash);
            
            await tx.wait(); // Wait for confirmation

            alert(`Successfully minted ${amount} RLO!`);
            
            await updateRloBalance(walletAddress);
            await fetchEthBalance(walletAddress); 
            logActivity(`Minted ${amount} RLO`, 'win');
            setShowBuyModal(false);

        } catch (error: any) {
            console.error(error);
            if (error.code === 4001 || error?.info?.error?.code === 4001) {
                alert("Transaction rejected.");
            } else {
                alert(`Transaction Failed: ${error.reason || "Check Balance & Network"}`);
            }
        }
    } else {
        alert("Wallet not found.");
    }
    setIsProcessing(false);
  };

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
        
        // Burn Tokens Transaction
        const tx = await contract.playGame(ethers.parseUnits(cost.toString(), 18), "Game Fee", {
             gasLimit: 150000 
        });
        console.log("Play Tx:", tx.hash);
        await tx.wait();
        
        await updateRloBalance(walletAddress); 
        logActivity(`Played Game`, 'play');
        
        if (isExternal) window.open(link, '_blank');
        else window.location.href = link;
        
      } catch (error: any) {
        console.error("Game Transaction failed", error);
        if (error.code === 4001 || error?.info?.error?.code === 4001) {
             alert("Play transaction cancelled.");
        } else {
             alert("Transaction failed. Check balance & network.");
        }
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Free game
      if (isExternal) window.open(link, '_blank');
      else window.location.href = link;
    }
  };

  const handlePurchaseAsset = async (asset: typeof ASSETS[0]) => {
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
        try {
            setIsProcessing(true);
            const provider = new ethers.BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            
            // Burning the asset price amount
            const tx = await contract.playGame(ethers.parseUnits(asset.price.toString(), 18), `Asset: ${asset.name}`, {
                gasLimit: 150000
            });
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
    } else {
        alert("Insufficient RLO Balance");
        setShowBuyModal(true);
    }
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

  const filteredGames = currentView === 'games' 
    ? GAMES.filter(g => {
        const matchesCategory = activeCategory === "All Games" || g.category === activeCategory;
        const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }) 
    : [];
    
  const filteredAssets = currentView === 'market'
    ? ASSETS.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

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
              <span className="text-3xl font-black tracking-tighter text-white italic">CADE <span className="text-xs text-[#a9ddd3] ml-1 not-italic border border-[#a9ddd3] px-1 rounded">v1.2</span></span>
          </div>

          <div className="hidden md:flex gap-8">
            <button onClick={() => setCurrentView('games')} className={`font-bold text-sm tracking-widest uppercase hover:text-[#a9ddd3] transition-colors ${currentView === 'games' ? 'text-[#a9ddd3]' : 'text-gray-500'}`}>Games</button>
            <button onClick={() => setCurrentView('market')} className={`font-bold text-sm tracking-widest uppercase hover:text-[#a9ddd3] transition-colors ${currentView === 'market' ? 'text-[#a9ddd3]' : 'text-gray-500'}`}>Market</button>
            <button onClick={() => setCurrentView('betting')} className={`font-bold text-sm tracking-widest uppercase hover:text-[#a9ddd3] transition-colors ${currentView === 'betting' ? 'text-[#a9ddd3]' : 'text-gray-500'}`}>Betting</button>
            <button onClick={() => setCurrentView('account')} className={`font-bold text-sm tracking-widest uppercase hover:text-[#a9ddd3] transition-colors ${currentView === 'account' ? 'text-[#a9ddd3]' : 'text-gray-500'}`}>Account</button>
          </div>

          <div className="flex items-center gap-4">
             {/* Navbar Search */}
             <div className="hidden lg:flex items-center bg-[#111] rounded-full px-4 py-2 w-64 border border-white/5 focus-within:border-[#a9ddd3] transition-colors mr-4">
                <Search className="w-4 h-4 text-gray-500 mr-2" />
                <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-600 text-[#e8e3d5]"
                />
             </div>

            <div onClick={() => !walletConnected ? setShowConnectModal(true) : handleDisconnect()} className="flex items-center gap-3 bg-[#111] pr-4 pl-2 py-1.5 rounded-full border border-white/5 hover:border-[#a9ddd3] transition-colors cursor-pointer group hover:bg-[#1a1a1a]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#a9ddd3] to-[#e8e3d5] flex items-center justify-center text-black shadow-lg shadow-[#a9ddd3]/20">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="flex flex-col leading-none">
                 {/* Updated Navbar Display */}
                <span className="text-[10px] text-gray-500 uppercase font-bold group-hover:text-[#a9ddd3]">{username || 'Guest'}</span>
                <span className="font-bold text-[#e8e3d5]">{rloBalance.toLocaleString()} RLO</span>
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
        {currentView === 'account' && (
            <div className="animate-in fade-in zoom-in duration-500 max-w-4xl mx-auto">
              <div className="bg-[#111] border border-white/10 rounded-3xl p-8 mb-8">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#a9ddd3] to-[#e8e3d5] flex items-center justify-center text-black shadow-2xl shadow-[#a9ddd3]/20 relative">
                    <User className="w-12 h-12" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-black text-white">{username}</h2>
                        <button onClick={() => setShowUsernameModal(true)} className="text-gray-500 hover:text-white"><Edit3 className="w-4 h-4" /></button>
                    </div>
                    <p className="text-gray-400">Level 0 • R-CADE Member</p>
                    {walletConnected && <p className="text-xs text-[#a9ddd3] font-mono mt-1">{walletAddress}</p>}
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm text-gray-500 uppercase font-bold">Total Net Worth</p>
                    <h3 className="text-4xl font-black text-[#e8e3d5]">${netWorth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
                    <p className="text-xs text-[#a9ddd3]">≈ {rloBalance.toLocaleString()} RLO</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5 relative">
                    <p className="text-gray-500 text-xs uppercase font-bold mb-1">Liquid Funds</p>
                    <p className="text-2xl font-bold text-white">{rloBalance.toLocaleString()} <span className="text-sm text-[#a9ddd3]">RLO</span></p>
                    {walletConnected && (
                      <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                        <Coins className="w-3 h-3" /> {ethBalance} ETH
                      </p>
                    )}
                    <button 
                        onClick={() => setShowBuyModal(true)} 
                        className="absolute top-4 right-4 bg-[#a9ddd3] hover:bg-white text-black font-bold text-xs px-3 py-1 rounded-lg flex items-center gap-1 transition-colors"
                    >
                        <PlusCircle className="w-3 h-3" /> TOP UP
                    </button>
                  </div>
                  <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
                    <p className="text-gray-500 text-xs uppercase font-bold mb-1">Asset Value</p>
                    <p className="text-2xl font-bold text-white">
                        {ASSETS.filter(a => inventory.includes(a.id)).length} <span className="text-sm text-[#a9ddd3]">Items</span>
                    </p>
                  </div>
                  <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
                    <p className="text-gray-500 text-xs uppercase font-bold mb-1">Performance</p>
                    <p className={`text-2xl font-bold ${performance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {performance >= 0 ? '+' : ''}{performance}%
                    </p>
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
              </div>
            </div>
        )}

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
                  { amount: 100, label: "Starter" },
                  { amount: 500, label: "Popular" },
                  { amount: 1500, label: "Whale" },
                ].map((opt) => (
                  <button 
                    key={opt.amount}
                    onClick={() => handleBuyTokens(opt.amount, opt.amount)}
                    className="w-full flex items-center justify-between bg-[#0a0a0a] hover:bg-[#222] border border-white/5 hover:border-[#a9ddd3] p-4 rounded-xl transition-all group"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-[#e8e3d5] font-bold text-lg">{opt.amount} RLO</span>
                      <span className="text-[10px] uppercase text-gray-500 font-bold">{opt.label} Pack</span>
                    </div>
                    <div className="bg-[#a9ddd3] text-black font-black px-4 py-2 rounded-lg text-sm group-hover:scale-105 transition-transform flex items-center gap-1">
                      {/* Cost is calculated at 0.000004 ETH per RLO */}
                      <CreditCard className="w-3 h-3" /> {(opt.amount * ETH_PER_RLO).toFixed(4)} ETH
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

      {/* --- Edit Username Modal --- */}
      {showUsernameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl relative">
              <button onClick={() => setShowUsernameModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
              <h2 className="text-xl font-bold text-white mb-4">Edit Username</h2>
              <input 
                type="text" 
                placeholder="Enter new username"
                className="w-full bg-[#0a0a0a] border border-white/20 rounded-lg p-3 text-white focus:border-[#a9ddd3] outline-none mb-4"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleUpdateUsername(e.currentTarget.value);
                    }
                }}
              />
              <p className="text-xs text-gray-500">Press Enter to save</p>
          </div>
        </div>
      )}
    </div>
  );
}