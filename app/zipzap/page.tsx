"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Play, Zap, CheckCircle, Timer, Home, RefreshCw } from 'lucide-react';
// Using <a> tag instead of Next Link for preview environment stability
// import Link from 'next/link';

// --- Game Constants ---
const GRID_SIZE = 5;
const TILE_TYPES = ['straight', 'corner', 't-shape', 'cross'];
const LEVELS = [
  { time: 90, cost: 50, reward: 100, difficulty: 'Normal' },
  { time: 60, cost: 100, reward: 250, difficulty: 'Hard' },
  { time: 45, cost: 200, reward: 500, difficulty: 'Expert' }
];

type Tile = {
  type: string;
  rotation: number; // 0, 90, 180, 270
  powered: boolean;
  x: number;
  y: number;
  fixed: boolean; 
};

export default function ZipZapGame() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'gameover'>('start');
  const [grid, setGrid] = useState<Tile[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [levelIndex, setLevelIndex] = useState(0);

  // --- Core Logic: Connection Rules ---
  
  // Base connections for Rotation 0: [Up, Right, Down, Left]
  const BASE_CONNECTIONS: Record<string, boolean[]> = {
    'straight': [true, false, true, false],  // Vertical pipe
    'corner':   [true, true, false, false],  // L-shape (Top & Right)
    't-shape':  [false, true, true, true],   // T-shape (Right, Down, Left)
    'cross':    [true, true, true, true]     // + shape (All directions)
  };

  // Helper: Get connections for a specific tile based on its current rotation
  const getTileConnections = (tile: Tile) => {
    const base = BASE_CONNECTIONS[tile.type];
    const shift = (tile.rotation / 90) % 4;
    
    // Rotate the connection array
    // If shift is 1 (90deg clockwise), Up(0) moves to Right(1), etc.
    const rotated = [false, false, false, false];
    for (let i = 0; i < 4; i++) {
      rotated[(i + shift) % 4] = base[i];
    }
    return rotated; // [Up, Right, Down, Left]
  };

  // Helper: Check if two tiles are logically connected
  const isConnected = (current: Tile, neighbor: Tile, directionToNeighbor: 'up'|'right'|'down'|'left') => {
    const currConns = getTileConnections(current);
    const neighConns = getTileConnections(neighbor);

    // Map directions to array indices: 0:Up, 1:Right, 2:Down, 3:Left
    if (directionToNeighbor === 'up') {
      // Current must output Up (0), Neighbor must accept Down (2)
      return currConns[0] && neighConns[2];
    }
    if (directionToNeighbor === 'right') {
      // Current must output Right (1), Neighbor must accept Left (3)
      return currConns[1] && neighConns[3];
    }
    if (directionToNeighbor === 'down') {
      // Current must output Down (2), Neighbor must accept Up (0)
      return currConns[2] && neighConns[0];
    }
    if (directionToNeighbor === 'left') {
      // Current must output Left (3), Neighbor must accept Right (1)
      return currConns[3] && neighConns[1];
    }
    return false;
  };

  // --- Game Flow ---

  const initLevel = useCallback(() => {
    const newGrid: Tile[] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        // Randomize
        let type = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
        let rotation = Math.floor(Math.random() * 4) * 90;
        let fixed = false;

        // Force Start (Top-Left) to point Right/Down roughly to give a fair start
        if (x === 0 && y === 0) { 
          type = 'corner'; 
          rotation = 90; // Rot 90 corner = Right & Down 
          fixed = true; 
        } 
        // Force End (Bottom-Right) to accept from Up/Left
        if (x === GRID_SIZE - 1 && y === GRID_SIZE - 1) { 
          type = 'corner'; 
          rotation = 270; // Rot 270 corner = Left & Up
          fixed = true; 
        }

        newGrid.push({ type, rotation, powered: false, x, y, fixed });
      }
    }
    
    // Initial flow check
    const gridWithPower = calculatePower(newGrid);
    
    setGrid(gridWithPower);
    setTimeLeft(LEVELS[levelIndex].time);
    setGameState('playing');
  }, [levelIndex]);

  // BFS to trace power flow from (0,0)
  const calculatePower = (currentGrid: Tile[]): Tile[] => {
    // Reset power
    const nextGrid = currentGrid.map(t => ({ ...t, powered: false }));
    
    // Start at 0,0
    const startTile = nextGrid[0];
    startTile.powered = true;
    
    const queue = [startTile];
    const visited = new Set<string>();
    visited.add(`${startTile.x},${startTile.y}`);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      
      const neighbors = [
        { x: curr.x, y: curr.y - 1, dir: 'up' },
        { x: curr.x, y: curr.y + 1, dir: 'down' },
        { x: curr.x - 1, y: curr.y, dir: 'left' },
        { x: curr.x + 1, y: curr.y, dir: 'right' }
      ];

      for (const n of neighbors) {
        // Bounds check
        if (n.x >= 0 && n.x < GRID_SIZE && n.y >= 0 && n.y < GRID_SIZE) {
          const neighborIndex = n.y * GRID_SIZE + n.x;
          const neighborTile = nextGrid[neighborIndex];

          if (!visited.has(`${n.x},${n.y}`)) {
            // Logic Check
            if (isConnected(curr, neighborTile, n.dir as any)) {
              neighborTile.powered = true;
              visited.add(`${n.x},${n.y}`);
              queue.push(neighborTile);
            }
          }
        }
      }
    }
    return nextGrid;
  };

  const handleTileClick = (index: number) => {
    if (gameState !== 'playing' || grid[index].fixed) return;

    // Create a NEW grid array with a NEW object for the modified tile to ensure immutability
    const newGrid = grid.map((tile, i) => {
      if (i === index) {
        return { ...tile, rotation: (tile.rotation + 90) % 360 };
      }
      return tile;
    });
    
    // Recalculate Flow
    const poweredGrid = calculatePower(newGrid);
    setGrid(poweredGrid);

    // Check Win (Is Bottom-Right Powered?)
    const endTile = poweredGrid[poweredGrid.length - 1];
    if (endTile.powered) {
      setScore(prev => prev + LEVELS[levelIndex].reward + (timeLeft * 10));
      setGameState('won');
    }
  };

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 1) {
                setGameState('gameover');
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center justify-center p-4 select-none">
      
      {/* HUD */}
      <div className="w-full max-w-md flex justify-between items-center mb-8">
        <a href="/" className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 transition">
            <Home className="w-6 h-6 text-slate-400" />
        </a>
        <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl shadow-inner">
                <Timer className={`w-5 h-5 ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`} />
                <span className={`font-mono font-bold text-xl ${timeLeft < 10 ? 'text-red-500' : 'text-white'}`}>{timeLeft}s</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl shadow-inner">
                <Zap className="w-5 h-5 text-purple-500" />
                <span className="font-mono font-bold text-xl text-purple-400">{score}</span>
            </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="bg-slate-900 p-4 rounded-2xl border-4 border-slate-800 shadow-2xl relative">
        
        {/* Grid - Removed gap-2 to make pipes visually connect */}
        <div 
            className="grid" 
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
        >
            {grid.map((tile, i) => (
                <div 
                    key={i}
                    onClick={() => handleTileClick(i)}
                    className={`
                        w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center transition-all duration-300 relative
                        ${tile.fixed 
                            ? 'bg-slate-950' 
                            : 'bg-slate-900 cursor-pointer hover:bg-slate-800'
                        }
                        border border-slate-800/30
                    `}
                >
                    <div 
                        className={`transition-all duration-300 ease-in-out w-full h-full relative
                            ${tile.powered ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'text-slate-700'}
                        `}
                        style={{ transform: `rotate(${tile.rotation}deg)` }}
                    >
                        {/* Visuals for pipes based on Base Connection Logic [Up, Right, Down, Left] */}
                        
                        {/* Straight (Vertical Base) */}
                        {tile.type === 'straight' && (
                            <div className="w-4 h-full bg-current mx-auto" />
                        )}

                        {/* Corner (Top-Right Base) */}
                        {tile.type === 'corner' && (
                            <div className="relative w-full h-full">
                                <div className="absolute top-0 right-1/2 w-4 h-1/2 bg-current translate-x-1/2" />
                                <div className="absolute top-1/2 right-0 w-1/2 h-4 bg-current -translate-y-1/2" />
                                <div className="absolute top-1/2 right-1/2 w-4 h-4 bg-current -translate-y-1/2 translate-x-1/2 rounded-full" />
                            </div>
                        )}

                        {/* T-Shape (Right-Down-Left Base) */}
                        {tile.type === 't-shape' && (
                            <div className="relative w-full h-full">
                                <div className="absolute top-1/2 left-0 w-full h-4 bg-current -translate-y-1/2" />
                                <div className="absolute top-1/2 left-1/2 w-4 h-1/2 bg-current -translate-x-1/2" />
                            </div>
                        )}

                        {/* Cross (All Base) */}
                        {tile.type === 'cross' && (
                            <div className="relative w-full h-full">
                                <div className="absolute top-0 left-1/2 w-4 h-full bg-current -translate-x-1/2" />
                                <div className="absolute top-1/2 left-0 w-full h-4 bg-current -translate-y-1/2" />
                            </div>
                        )}
                        
                        {/* Source/Sink Indicators */}
                        {tile.fixed && i === 0 && <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"><div className="w-3 h-3 bg-green-400 rounded-full animate-ping" /></div>}
                        {tile.fixed && i === grid.length-1 && <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"><div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_red]" /></div>}
                    </div>
                </div>
            ))}
        </div>

        {/* Start Overlay */}
        {gameState === 'start' && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-20 p-6 text-center animate-in fade-in zoom-in">
                <div className="w-20 h-20 bg-purple-900/50 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-purple-900/20">
                    <Zap className="w-10 h-10 text-purple-400 animate-pulse" />
                </div>
                <h1 className="text-5xl font-black text-white italic mb-2 tracking-tighter">ZIP ZAP</h1>
                <p className="text-slate-400 mb-8 max-w-xs">Rotate the nodes to restore power flow from Start to End.</p>
                
                <div className="space-y-3 w-full max-w-xs">
                    {LEVELS.map((lvl, idx) => (
                        <button 
                            key={idx}
                            onClick={() => { setLevelIndex(idx); initLevel(); }} 
                            className="w-full bg-slate-800 hover:bg-purple-600 border border-slate-700 hover:border-purple-400 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-between transition-all group"
                        >
                            <span className="group-hover:translate-x-1 transition-transform">{lvl.difficulty}</span>
                            <span className="text-xs bg-black/30 px-2 py-1 rounded text-purple-200">{lvl.time}s</span>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-red-950/95 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-20 p-6 text-center animate-in zoom-in">
                <h2 className="text-5xl font-black text-red-500 mb-2">SYSTEM FAILURE</h2>
                <p className="text-white mb-8 opacity-80">The circuit remained incomplete.</p>
                <button onClick={initLevel} className="bg-white text-black font-black py-4 px-10 rounded-xl flex items-center gap-2 hover:scale-105 transition-transform shadow-xl">
                    <RefreshCw className="w-5 h-5" /> RETRY
                </button>
            </div>
        )}

        {/* Won Overlay */}
        {gameState === 'won' && (
            <div className="absolute inset-0 bg-green-950/95 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-20 p-6 text-center animate-in zoom-in">
                <CheckCircle className="w-20 h-20 text-green-400 mb-6 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
                <h2 className="text-5xl font-black text-white mb-2">POWER ONLINE</h2>
                <p className="text-green-200 mb-8 font-mono">Score: {score}</p>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button onClick={initLevel} className="bg-green-500 hover:bg-green-400 text-black font-black py-4 px-8 rounded-xl shadow-lg shadow-green-900/50 transition-transform hover:scale-105">
                        NEXT LEVEL
                    </button>
                    <a href="/" className="text-slate-400 hover:text-white text-sm font-bold mt-4">
                        RETURN TO R-CADE
                    </a>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}