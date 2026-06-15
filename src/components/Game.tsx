import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Zap, ChevronLeft, ChevronRight, Loader2, FastForward } from 'lucide-react';
import { Transactions, ATTRIBUTION_CODE, BUILDER_CODE } from './Transactions';
import { useSendTransaction, useAccount } from 'wagmi';
import { parseEther, stringToHex } from 'viem';
import { appendERC8021 } from '../lib/erc8021';

export function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [combo, setCombo] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const requestRef = useRef<number>();
  
  // Controls
  const keys = useRef<{ [key: string]: boolean }>({});
  const touchX = useRef<number | null>(null);
  const touchY = useRef<number | null>(null);
  const [isBoosting, setIsBoosting] = useState(false);
  
  const { address } = useAccount();
  const { sendTransactionAsync, isPending: isSubmitting } = useSendTransaction();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitScore = async () => {
    if (!address) return;
    try {
      await sendTransactionAsync({
        to: "0x0000000000000000000000000000000000008021",
        value: parseEther("0"),
        data: appendERC8021(stringToHex(`SUBMIT_SCORE:${score}`), [ATTRIBUTION_CODE, BUILDER_CODE])
      });
      setIsSubmitted(true);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pseudo-3D and Game State Constants
    let playerX = 0; // -1 to 1 local track space
    const fov = 300;
    const cameraDepth = 10;
    
    let trackZ = 0;
    let currentSpeed = 10;
    let baseSpeed = 10;
    let warpEnergy = 0;
    let isWarping = false;
    let warpCooldown = 0;
    let comboMultiplier = 1;

    let segments: { z: number; curve: number; }[] = [];
    let entities: { type: 'orb' | 'obstacle' | 'shard'; x: number; z: number; collected?: boolean }[] = [];
    let particles: { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; color: string }[] = [];

    let currentScore = 0;
    let frameCount = 0;

    // Track Generation
    const segmentLength = 200;
    const trackCurve = 0;
    for(let i=0; i<500; i++) {
        segments.push({ z: i * segmentLength, curve: Math.sin(i * 0.1) * 2 });
        if (i > 10 && i % 3 === 0) {
            const rand = Math.random();
            let type: 'orb' | 'obstacle' | 'shard' = 'orb';
            if (rand > 0.8) type = 'obstacle';
            else if (rand > 0.75) type = 'shard';
            entities.push({ type, x: (Math.random() - 0.5) * 4, z: i * segmentLength });
        }
    }

    const spawnParticle = (x: number, y: number, z: number, color: string, count: number) => {
        for(let i=0; i<count; i++) {
            particles.push({
                x, y, z,
                vx: (Math.random() - 0.5) * 50,
                vy: (Math.random() - 0.5) * 50,
                vz: Math.random() * 50 + 20,
                life: 1.0,
                color
            });
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key] = false; };
    
    // Touch Logic
    const handleTouchStart = (e: TouchEvent) => {
      touchX.current = e.touches[0].clientX;
      touchY.current = e.touches[0].clientY;
      keys.current['Space'] = true; // Boost
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchX.current) return;
      const dx = e.touches[0].clientX - touchX.current;
      const dy = e.touches[0].clientY - touchY.current!;
      
      // Swipe Warp
      if (Math.abs(dx) > 50 && warpEnergy >= 100) {
          isWarping = true;
          playerX += dx > 0 ? 1.5 : -1.5;
          warpEnergy = 0;
          warpCooldown = 30;
          spawnParticle(playerX * 100, 0, trackZ + 200, '#e879f9', 30);
          touchX.current = e.touches[0].clientX; // reset
      } else {
          // Normal steer
          playerX += dx * 0.005;
          touchX.current = e.touches[0].clientX;
      }
    };
    const handleTouchEnd = () => { touchX.current = null; keys.current['Space'] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    // Main Game Loop
    const update = () => {
      if (gameOver) return;
      
      // Inputs
      if (keys.current['ArrowLeft'] || keys.current['a']) playerX -= 0.05;
      if (keys.current['ArrowRight'] || keys.current['d']) playerX += 0.05;
      
      // Boundaries
      playerX = Math.max(-2, Math.min(2, playerX));

      // Speed & Boost
      const isBoostingNow = keys.current['Shift'] || keys.current[' '] || keys.current['ArrowUp'] || keys.current['w'];
      setIsBoosting(!!isBoostingNow);
      
      if (isBoostingNow && !isWarping) {
          currentSpeed += 0.5;
      } else {
          currentSpeed -= 0.2;
      }
      
      baseSpeed = 10 + (currentScore / 2000);
      currentSpeed = Math.max(baseSpeed, Math.min(baseSpeed * 2.5, currentSpeed));
      
      if (isWarping) {
         currentSpeed = baseSpeed * 4;
         warpCooldown--;
         if (warpCooldown <= 0) isWarping = false;
      }

      trackZ += currentSpeed;
      if (warpEnergy < 100 && !isWarping) warpEnergy += 0.1;
      
      setSpeed(Math.floor(currentSpeed * 10));

      // Clear Screen
      ctx.fillStyle = 'rgba(5, 5, 5, 0.4)'; // trails
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const middleX = width / 2;
      const middleY = height / 2 + 50;

      // Draw Track grid
      const playerSegment = Math.floor(trackZ / segmentLength);
      let dx = 0;
      let currentCurve = 0;
      
      for (let i = 0; i < 50; i++) {
         const segIndex = playerSegment + i;
         if (segIndex >= segments.length) break;
         const seg = segments[segIndex];
         currentCurve += seg.curve * 0.01;
         dx += currentCurve;
         
         const pz = (segIndex * segmentLength) - trackZ;
         if (pz < cameraDepth) continue;

         const scale = fov / (pz + fov);
         const x = middleX + (dx - playerX * 100) * scale;
         const y = middleY + 100 * scale; // camera height
         const w = 500 * scale;

         // Draw horizontal line
         ctx.strokeStyle = isWarping ? 'rgba(232, 121, 249, 0.5)' : `rgba(0, 82, 255, ${1 - i/50})`;
         ctx.lineWidth = 1;
         ctx.beginPath();
         ctx.moveTo(x - w, y);
         ctx.lineTo(x + w, y);
         ctx.stroke();

         // Draw road borders
         ctx.fillStyle = isWarping ? '#e879f9' : '#0052FF';
         if (i % 2 === 0) {
             ctx.fillRect(x - w - 10*scale, y, 10*scale, 5);
             ctx.fillRect(x + w, y, 10*scale, 5);
         }
      }

      // Draw and resolve Entities
      for (let i = 0; i < entities.length; i++) {
         const ent = entities[i];
         if (ent.collected || ent.z < trackZ) continue;
         
         const pz = ent.z - trackZ;
         if (pz > fov * 10 || pz < 10) continue;

         const idx = Math.floor(ent.z / segmentLength) - playerSegment;
         const scale = fov / (pz + fov);
         // approximate curve offset (simplified)
         const curveOffset = Math.sin(ent.z * 0.001) * 100 * (idx/50);
         const x = middleX + (curveOffset + (ent.x * 100) - playerX * 100) * scale;
         const y = middleY + 80 * scale; // hover slightly

         const size = 30 * scale;

         // Collision
         if (pz < 100 && Math.abs(playerX - ent.x) < 0.5 && !isWarping) {
             ent.collected = true;
             if (ent.type === 'obstacle') {
                 spawnParticle(x, y, pz, '#ef4444', 40);
                 setGameOver(true);
                 setIsPlaying(false);
                 setScore(currentScore);
             } else if (ent.type === 'orb') {
                 currentScore += 100 * comboMultiplier;
                 comboMultiplier += 0.1;
                 warpEnergy = Math.min(100, warpEnergy + 5);
                 spawnParticle(x, y, pz, '#0ea5e9', 15);
             } else if (ent.type === 'shard') {
                 currentScore += 500;
                 isWarping = true;
                 warpCooldown = 50;
                 warpEnergy = 100;
                 spawnParticle(x, y, pz, '#e879f9', 25);
             }
         }

         if (!ent.collected) {
             ctx.save();
             ctx.translate(x, y - (Math.sin(frameCount * 0.1) * 10 * scale));
             if (ent.type === 'obstacle') {
                 ctx.fillStyle = '#ef4444';
                 ctx.shadowColor = '#ef4444';
                 ctx.shadowBlur = 15;
                 ctx.fillRect(-size, -size, size*2, size*2);
             } else if (ent.type === 'orb') {
                 ctx.fillStyle = '#0ea5e9';
                 ctx.shadowColor = '#0ea5e9';
                 ctx.shadowBlur = 10;
                 ctx.beginPath();
                 ctx.arc(0, 0, size, 0, Math.PI * 2);
                 ctx.fill();
             } else if (ent.type === 'shard') {
                 ctx.fillStyle = '#e879f9';
                 ctx.shadowColor = '#e879f9';
                 ctx.shadowBlur = 20;
                 ctx.rotate(frameCount * 0.05);
                 ctx.beginPath();
                 ctx.moveTo(0, -size);
                 ctx.lineTo(size, size);
                 ctx.lineTo(-size, size);
                 ctx.fill();
             }
             ctx.restore();
         }
      }

      // Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.z -= p.vz;
          p.life -= 0.02;

          if (p.life <= 0 || p.z < 10) {
              particles.splice(i, 1);
              continue;
          }

          const scale = fov / (p.z + fov);
          const px = middleX + p.x * scale;
          const py = middleY + p.y * scale;

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.beginPath();
          ctx.arc(px, py, 3 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
      }

      // Draw Ship
      const shipY = height - 100;
      ctx.save();
      ctx.translate(middleX, shipY);
      
      // Ship banking
      ctx.rotate((keys.current['ArrowRight'] ? 0.2 : (keys.current['ArrowLeft'] ? -0.2 : 0)));
      
      // Ship geometry
      ctx.fillStyle = isWarping ? '#e879f9' : '#0052FF';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(20, 20);
      ctx.lineTo(0, 10);
      ctx.lineTo(-20, 20);
      ctx.closePath();
      ctx.fill();
      
      // Engine Glow
      ctx.fillStyle = isWarping ? '#c084fc' : (isBoostingNow ? '#60a5fa' : '#ef4444');
      ctx.beginPath();
      ctx.arc(0, 15, isBoostingNow ? 10 + Math.random()*5 : 5, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();

      // UI/HUD Overlays (drawn manually on canvas)
      // Speed Lines effect during warp/boost
      if (isWarping || isBoostingNow) {
          ctx.strokeStyle = isWarping ? 'rgba(232, 121, 249, 0.4)' : 'rgba(255, 255, 255, 0.2)';
          ctx.beginPath();
          for(let i=0; i<20; i++) {
              const lx = Math.random() * width;
              const ly = Math.random() * height;
              ctx.moveTo(lx, ly);
              ctx.lineTo(lx, ly + (Math.random() * 100 + 50));
          }
          ctx.stroke();
      }

      currentScore += Math.floor(currentSpeed);
      setScore(currentScore);
      setCombo(Math.floor(comboMultiplier * 10) / 10);
      frameCount++;

      if (!gameOver) {
        requestRef.current = requestAnimationFrame(update);
      }
    };

    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, gameOver]);

  return (
    <div className="flex flex-col items-center w-full">
      {!isPlaying && !gameOver ? (
        <div className="text-center w-full scale-110 origin-top">
          <Transactions onTxSuccess={() => {
              setIsPlaying(true);
              setGameOver(false);
              setScore(0);
          }} />
        </div>
      ) : (
        <div className="flex flex-col items-center w-full relative">
          
          {/* Main Race Canvas */}
          <div className="bg-black/80 border border-[#0052FF]/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,82,255,0.2)] relative w-full aspect-[4/3] sm:aspect-[2/1] max-h-[600px] mb-6">
            <canvas 
              ref={canvasRef} 
              width={1000} 
              height={600} 
              className="block bg-transparent w-full h-full object-cover touch-none"
            />
            
            {/* HTML HUD Overlay */}
            {isPlaying && !gameOver && (
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none">
                    <div className="flex flex-col gap-1">
                        <span className="text-[#0052FF] font-mono text-3xl font-black drop-shadow-md">
                            {score.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-2">
                           <span className="text-white/60 text-xs tracking-widest uppercase">COMBO</span>
                           <span className="text-yellow-400 font-bold bg-yellow-400/20 px-2 rounded-md">x{combo.toFixed(1)}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-blue-400 font-mono text-2xl font-bold">{speed}</span>
                            <span className="text-white/40 text-xs">KM/H</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className={`w-4 h-4 ${isBoosting ? 'text-cyan-400 animate-pulse' : 'text-white/20'}`} />
                            <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${Math.min(100, speed / 3)}%` }} />
                            </div>
                        </div>
                        {/* Warp Energy */}
                        <div className="flex gap-1 mt-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`w-6 h-1 rounded flex-1 ${combo > i ? 'bg-fuchsia-500 shadow-[0_0_10px_#d946ef]' : 'bg-white/10'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {gameOver && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center flex-col z-20 p-6 text-center">
                <Trophy className="w-24 h-24 text-yellow-500 mb-6 drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]" />
                <h3 className="text-5xl sm:text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40 mb-2 tracking-tighter">
                    RACE OVER
                </h3>
                <p className="text-[#0052FF] mb-10 font-mono text-2xl sm:text-3xl tracking-widest font-bold">
                    SCORE: {score.toLocaleString()}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
                  <button
                    onClick={() => {
                      setGameOver(false);
                      setIsPlaying(false);
                      setScore(0);
                      setIsSubmitted(false);
                    }}
                    className="flex-1 px-8 py-4 bg-white/5 text-white rounded-2xl font-bold tracking-widest border border-white/10 hover:bg-white/10 transition-all font-mono"
                  >
                    GARAGE
                  </button>
                  <button
                    onClick={handleSubmitScore}
                    disabled={isSubmitting || isSubmitted || score === 0}
                    className={`flex-[2] px-8 py-4 rounded-2xl font-bold tracking-widest transition-all flex items-center justify-center gap-2 font-mono ${
                        isSubmitted ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                        'bg-[#0052FF] text-white border border-[#0052FF] hover:scale-105 shadow-[0_0_30px_rgba(0,82,255,0.4)]'
                    } disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none`}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> WRITING ON-CHAIN...</>
                    ) : isSubmitted ? (
                      "RECORD SECURED"
                    ) : (
                      "SUBMIT HIGHSCORE"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {isPlaying && (
             <div className="mt-4 flex flex-col md:flex-row items-center gap-6 text-white/40 text-xs font-mono bg-white/5 px-6 py-3 rounded-full border border-white/5">
               <div className="flex items-center gap-2"><span className="p-1 px-2 bg-white/10 rounded flex items-center justify-center text-white font-bold leading-none">A/D</span> Steer</div>
               <div className="flex items-center gap-2"><span className="p-1 px-2 bg-white/10 rounded flex items-center justify-center text-white font-bold leading-none">SPACE</span> Boost</div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-fuchsia-500" /> Collect Shards to WARP</div>
             </div>
          )}
        </div>
      )}
    </div>
  );
}


