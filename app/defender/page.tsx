"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Rocket, Trophy, Play, RotateCcw, ShieldAlert } from 'lucide-react';

// --- Game Constants ---
const FPS = 60;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 12;
const ENEMY_SPEED_BASE = 2;
const ENEMY_SPAWN_RATE_MS = 1000;
const PLAYER_SIZE = 20;
const BULLET_RADIUS = 4;
const ENEMY_SIZE = 20;

export default function DefenderGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [health, setHealth] = useState(100);

  // Game state refs
  const scoreRef = useRef(0);
  const animationFrameId = useRef<number>(0);
  const lastTime = useRef<number>(0);
  const lastEnemySpawn = useRef<number>(0);
  
  // Entities
  const player = useRef({ x: 0, y: 0, angle: 0, vx: 0, vy: 0 });
  const bullets = useRef<any[]>([]);
  const enemies = useRef<any[]>([]);
  const particles = useRef<any[]>([]);
  
  const input = useRef({ 
    w: false, a: false, s: false, d: false, 
    mouseX: 0, mouseY: 0, mouseDown: false 
  });

  // --- Input Handling ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w') input.current.w = true;
      if (key === 'a') input.current.a = true;
      if (key === 's') input.current.s = true;
      if (key === 'd') input.current.d = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w') input.current.w = false;
      if (key === 'a') input.current.a = false;
      if (key === 's') input.current.s = false;
      if (key === 'd') input.current.d = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      input.current.mouseX = e.clientX - rect.left;
      input.current.mouseY = e.clientY - rect.top;
    };
    const handleMouseDown = () => { input.current.mouseDown = true; };
    const handleMouseUp = () => { input.current.mouseDown = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // --- Game Loop Logic ---
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setHealth(100);
    scoreRef.current = 0;
    
    // Reset Entities
    const canvas = canvasRef.current;
    if (canvas) {
        player.current = { x: canvas.width / 2, y: canvas.height / 2, angle: 0, vx: 0, vy: 0 };
    }
    bullets.current = [];
    enemies.current = [];
    particles.current = [];
    input.current.mouseDown = false; 
    
    lastTime.current = performance.now();
    lastEnemySpawn.current = 0;
    
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = requestAnimationFrame(gameLoop);
  };

  const spawnEnemy = (width: number, height: number, difficultyMultiplier: number) => {
    let x, y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? -ENEMY_SIZE : width + ENEMY_SIZE;
      y = Math.random() * height;
    } else {
      x = Math.random() * width;
      y = Math.random() < 0.5 ? -ENEMY_SIZE : height + ENEMY_SIZE;
    }
    
    enemies.current.push({
      x, y,
      speed: (ENEMY_SPEED_BASE + Math.random()) * difficultyMultiplier,
      hp: 1 + Math.floor(scoreRef.current / 500)
    });
  };

  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particles.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color
      });
    }
  };

  const gameLoop = useCallback((time: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    lastTime.current = time;
    const difficultyMultiplier = 1 + scoreRef.current / 2000;

    // --- Update ---
    // 1. Player Movement
    let dx = 0;
    let dy = 0;
    if (input.current.w) dy -= 1;
    if (input.current.s) dy += 1;
    if (input.current.a) dx -= 1;
    if (input.current.d) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;
    }

    player.current.x += dx * PLAYER_SPEED;
    player.current.y += dy * PLAYER_SPEED;
    player.current.x = Math.max(PLAYER_SIZE, Math.min(canvas.width - PLAYER_SIZE, player.current.x));
    player.current.y = Math.max(PLAYER_SIZE, Math.min(canvas.height - PLAYER_SIZE, player.current.y));

    const angle = Math.atan2(input.current.mouseY - player.current.y, input.current.mouseX - player.current.x);
    player.current.angle = angle;

    // 2. Shooting
    if (input.current.mouseDown) {
      if (time % 150 < 20) { 
        bullets.current.push({
            x: player.current.x + Math.cos(angle) * 20,
            y: player.current.y + Math.sin(angle) * 20,
            vx: Math.cos(angle) * BULLET_SPEED,
            vy: Math.sin(angle) * BULLET_SPEED
        });
      }
    }

    // 3. Bullets
    for (let i = bullets.current.length - 1; i >= 0; i--) {
      const b = bullets.current[i];
      b.x += b.vx;
      b.y += b.vy;

      if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
        bullets.current.splice(i, 1);
      }
    }

    // 4. Enemies
    if (time - lastEnemySpawn.current > Math.max(200, ENEMY_SPAWN_RATE_MS / difficultyMultiplier)) {
        spawnEnemy(canvas.width, canvas.height, difficultyMultiplier);
        lastEnemySpawn.current = time;
    }

    for (let i = enemies.current.length - 1; i >= 0; i--) {
        const e = enemies.current[i];
        const angleToPlayer = Math.atan2(player.current.y - e.y, player.current.x - e.x);
        
        e.x += Math.cos(angleToPlayer) * e.speed;
        e.y += Math.sin(angleToPlayer) * e.speed;

        // Collision: Enemy vs Player
        const dist = Math.hypot(player.current.x - e.x, player.current.y - e.y);
        if (dist < PLAYER_SIZE + ENEMY_SIZE) {
            setHealth(prev => {
                const newHealth = prev - 20;
                if (newHealth <= 0) return 0; 
                return newHealth;
            });
            createParticles(e.x, e.y, '#ef4444', 10);
            enemies.current.splice(i, 1);
            continue;
        }

        // Collision: Enemy vs Bullet
        for (let j = bullets.current.length - 1; j >= 0; j--) {
            const b = bullets.current[j];
            const distB = Math.hypot(b.x - e.x, b.y - e.y);
            
            if (distB < ENEMY_SIZE + BULLET_RADIUS) {
                bullets.current.splice(j, 1);
                e.hp--;
                
                if (e.hp <= 0) {
                    enemies.current.splice(i, 1);
                    createParticles(e.x, e.y, '#fbbf24', 8);
                    scoreRef.current += 100;
                    setScore(scoreRef.current); 
                } else {
                    createParticles(e.x, e.y, '#ffffff', 2);
                }
                break; 
            }
        }
    }

    // 5. Particles
    for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) particles.current.splice(i, 1);
    }


    // --- Render ---
    ctx.fillStyle = '#0f172a'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x += 50) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
    for (let y = 0; y < canvas.height; y += 50) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
    ctx.stroke();

    // Draw Player
    ctx.save();
    ctx.translate(player.current.x, player.current.y);
    ctx.rotate(player.current.angle);
    ctx.fillStyle = '#e8e3d5'; 
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-10, 10);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-10, -10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Draw Bullets
    ctx.fillStyle = '#a9ddd3'; 
    ctx.shadowColor = '#a9ddd3';
    ctx.shadowBlur = 5;
    bullets.current.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, BULLET_RADIUS, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw Enemies
    enemies.current.forEach(e => {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.fillStyle = '#ef4444'; 
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.fillRect(-ENEMY_SIZE/2, -ENEMY_SIZE/2, ENEMY_SIZE, ENEMY_SIZE);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(-5, -5, 4, 4);
        ctx.fillRect(1, -5, 4, 4);
        ctx.restore();
    });

    // Draw Particles
    particles.current.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    });
    
    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, []); 

  // Handle Game Over
  useEffect(() => {
    if (health <= 0 && gameState === 'playing') {
        setGameState('gameover');
        if (score > highScore) setHighScore(score);
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    }
  }, [health, gameState, score, highScore]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden font-sans select-none">
      
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full cursor-crosshair"
      />

      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none">
        
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-white font-bold text-xl drop-shadow-md">
                <ShieldAlert className="w-6 h-6 text-red-500" />
                <span>Hull Integrity</span>
            </div>
            <div className="w-64 h-4 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                <div 
                    className={`h-full transition-all duration-300 ${health > 50 ? 'bg-green-500' : health > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.max(0, health)}%` }}
                />
            </div>
        </div>

        <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-white font-bold text-2xl drop-shadow-md">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <span>{score.toLocaleString()}</span>
            </div>
            {highScore > 0 && (
                <div className="text-slate-400 text-sm font-mono">HI: {highScore.toLocaleString()}</div>
            )}
        </div>
      </div>

      {gameState === 'start' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl text-center max-w-md animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-[#e8e3d5] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#e8e3d5]/50">
                    <Rocket className="w-10 h-10 text-slate-900" />
                </div>
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight uppercase">Rialo Defender</h1>
                <p className="text-slate-400 mb-8">Defend the sector from the incoming swarm.</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8 text-sm text-slate-300">
                    <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                        <span className="font-bold block text-white mb-1">WASD</span>
                        Move Ship
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                        <span className="font-bold block text-white mb-1">MOUSE</span>
                        Aim & Shoot
                    </div>
                </div>

                <button 
                    onClick={startGame}
                    className="w-full bg-[#a9ddd3] hover:bg-[#8ccbc0] text-slate-900 font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#a9ddd3]/20 pointer-events-auto"
                >
                    <Play className="w-5 h-5 fill-current" />
                    START MISSION
                </button>
            </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/40 backdrop-blur-md z-10">
            <div className="bg-slate-900 p-8 rounded-2xl border border-red-500/30 shadow-2xl text-center max-w-md animate-in fade-in zoom-in duration-300">
                <h2 className="text-5xl font-black text-red-500 mb-2 drop-shadow-sm">CRITICAL FAILURE</h2>
                <div className="text-white text-2xl font-mono mb-8">Score: {score.toLocaleString()}</div>
                
                <button 
                    onClick={startGame}
                    className="w-full bg-white hover:bg-slate-200 text-slate-900 font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 pointer-events-auto"
                >
                    <RotateCcw className="w-5 h-5" />
                    RETRY SYSTEM
                </button>
            </div>
        </div>
      )}
    </div>
  );
}