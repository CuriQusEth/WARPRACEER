import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Zap, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Transactions, ATTRIBUTION_CODE, BUILDER_CODE } from './Transactions';
import { useSendTransaction, useAccount } from 'wagmi';
import { parseEther, stringToHex } from 'viem';
import { appendERC8021 } from '../lib/erc8021';

export function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const requestRef = useRef<number>();
  const [touchLeft, setTouchLeft] = useState(false);
  const [touchRight, setTouchRight] = useState(false);
  
  const { address } = useAccount();
  const { sendTransactionAsync, isPending: isSubmitting } = useSendTransaction();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitScore = async () => {
    if (!address) return;
    try {
      await sendTransactionAsync({
        to: address,
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

    let playerX = canvas.width / 2;
    const playerY = canvas.height - 40;
    const playerWidth = 24;
    const playerHeight = 36;

    let obstacles: { x: number; y: number; width: number; height: number; speed: number; color: string }[] = [];
    let stars: { x: number; y: number; z: number }[] = Array.from({ length: 150 }).map(() => ({
      x: (Math.random() - 0.5) * canvas.width * 2,
      y: (Math.random() - 0.5) * canvas.height * 2,
      z: Math.random() * 2,
    }));
    
    let currentScore = 0;
    let frameCount = 0;
    let speedMultiplier = 1;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') playerX -= 30;
      if (e.key === 'ArrowRight') playerX += 30;
    };

    window.addEventListener('keydown', handleKeyDown);

    const update = () => {
      // Touch controls handling
      if (touchLeft) playerX -= 5;
      if (touchRight) playerX += 5;
      
      // Clamp player position
      playerX = Math.max(10, Math.min(canvas.width - playerWidth - 10, playerX));

      ctx.fillStyle = 'rgba(5, 5, 5, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Warp Stars
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      ctx.fillStyle = 'white';
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.z -= 0.05 * speedMultiplier;
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * canvas.width * 2;
          star.y = (Math.random() - 0.5) * canvas.height * 2;
          star.z = 2; 
        }

        const x = (star.x / star.z) + centerX;
        const y = (star.y / star.z) + centerY;
        const size = Math.max(0.1, 1.5 - star.z);

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - (10 * speedMultiplier) * size);
        ctx.stroke();
      }

      // Draw Grid / Ground effect
      ctx.strokeStyle = 'rgba(0, 82, 255, 0.1)';
      ctx.beginPath();
      for (let i = 0; i < canvas.height; i += Math.max(20, 20 * speedMultiplier)) {
        ctx.moveTo(0, (i + frameCount * speedMultiplier * 2) % canvas.height);
        ctx.lineTo(canvas.width, (i + frameCount * speedMultiplier * 2) % canvas.height);
      }
      ctx.stroke();

      // Draw Player Ship
      ctx.fillStyle = '#0052FF';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#0052FF';
      ctx.beginPath();
      ctx.moveTo(playerX + playerWidth / 2, playerY);
      ctx.lineTo(playerX + playerWidth, playerY + playerHeight);
      ctx.lineTo(playerX + playerWidth / 2, playerY + playerHeight - 10);
      ctx.lineTo(playerX, playerY + playerHeight);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Engine Flame
      ctx.fillStyle = (frameCount % 4 < 2) ? '#ef4444' : '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(playerX + playerWidth / 2 - 5, playerY + playerHeight - 8);
      ctx.lineTo(playerX + playerWidth / 2 + 5, playerY + playerHeight - 8);
      ctx.lineTo(playerX + playerWidth / 2, playerY + playerHeight + 10 * speedMultiplier);
      ctx.fill();

      // Increased Difficulty
      speedMultiplier = 1 + (currentScore / 1000);
      const spawnRate = Math.max(20, 60 - Math.floor(currentScore / 50));

      // Obstacles
      if (frameCount % spawnRate === 0) {
        const isEnergy = Math.random() > 0.8;
        obstacles.push({
          x: Math.random() * (canvas.width - 30),
          y: -30,
          width: 30,
          height: 30,
          speed: (3 + Math.random() * 3) * speedMultiplier,
          color: isEnergy ? '#10b981' : '#ef4444' // Green points or red obstacles
        });
      }

      for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        obs.y += obs.speed;
        
        ctx.fillStyle = obs.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = obs.color;
        
        ctx.save();
        ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
        ctx.rotate(frameCount * 0.05);
        ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);
        
        // Add neon inner glow
        ctx.fillStyle = '#111';
        ctx.fillRect(-obs.width / 2 + 4, -obs.height / 2 + 4, obs.width - 8, obs.height - 8);
        ctx.restore();
        
        ctx.shadowBlur = 0;

        // Collision Check (circle abstraction for better feel)
        const dx = (playerX + playerWidth / 2) - (obs.x + obs.width / 2);
        const dy = (playerY + playerHeight / 2) - (obs.y + obs.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (playerWidth / 2 + obs.width / 2 - 5)) {
          if (obs.color === '#10b981') {
            currentScore += 50; // Bonus points
            obs.y = canvas.height + 100; // remove from screen
          } else {
            setGameOver(true);
            setIsPlaying(false);
            setScore(currentScore);
          }
        }
      }

      obstacles = obstacles.filter((obs) => obs.y < canvas.height);
      currentScore += 1;
      setScore(currentScore);
      frameCount++;

      if (!gameOver) {
        requestRef.current = requestAnimationFrame(update);
      }
    };

    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, gameOver, touchLeft, touchRight]);

  return (
    <div className="flex flex-col items-center w-full">
      {!isPlaying && !gameOver ? (
        <div className="text-center w-full">
          <Transactions onTxSuccess={() => {
              setIsPlaying(true);
              setGameOver(false);
              setScore(0);
          }} />
        </div>
      ) : (
        <div className="flex flex-col items-center w-full relative">
          <div className="flex justify-between items-center w-full mb-4 px-4">
            <span className="text-[#0052FF] font-mono text-xl tracking-widest font-black shadow-sm">SCORE: {score}</span>
            {gameOver && <span className="text-red-500 font-bold uppercase tracking-widest animate-pulse">CRASHED!</span>}
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,82,255,0.15)] relative w-full aspect-[2/1] max-h-[400px]">
            <canvas 
              ref={canvasRef} 
              width={800} 
              height={400} 
              className="block bg-black w-full h-full object-cover"
            />
            
            {/* Mobile Touch Overlays */}
            {isPlaying && (
              <div className="absolute top-0 bottom-0 left-0 w-1/2 flex items-center justify-start p-4 opacity-50 sm:hidden z-10"
                onTouchStart={() => setTouchLeft(true)}
                onTouchEnd={() => setTouchLeft(false)}
                onMouseDown={() => setTouchLeft(true)}
                onMouseUp={() => setTouchLeft(false)}
                onMouseLeave={() => setTouchLeft(false)}
              >
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                  <ChevronLeft className="w-8 h-8 text-white" />
                </div>
              </div>
            )}
            {isPlaying && (
              <div className="absolute top-0 bottom-0 right-0 w-1/2 flex items-center justify-end p-4 opacity-50 sm:hidden z-10"
                onTouchStart={() => setTouchRight(true)}
                onTouchEnd={() => setTouchRight(false)}
                onMouseDown={() => setTouchRight(true)}
                onMouseUp={() => setTouchRight(false)}
                onMouseLeave={() => setTouchRight(false)}
              >
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                  <ChevronRight className="w-8 h-8 text-white" />
                </div>
              </div>
            )}
            
            {gameOver && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center flex-col z-20">
                <Trophy className="w-20 h-20 text-yellow-500 mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                <h3 className="text-4xl font-black italic text-white mb-2 tracking-tighter">RACE OVER</h3>
                <p className="text-[#0052FF] mb-8 font-mono text-xl tracking-widest">Final Score: {score}</p>
                <div className="flex flex-col gap-4 w-full max-w-xs">
                  <button
                    onClick={() => {
                      setGameOver(false);
                      setIsPlaying(false);
                      setScore(0);
                      setIsSubmitted(false);
                    }}
                    className="px-8 py-3 bg-[#0052FF] text-white rounded-full font-bold text-sm tracking-widest border border-[#0052FF] drop-shadow-[0_0_20px_rgba(0,82,255,0.4)] hover:scale-105 hover:bg-[#0052FF] transition-all"
                  >
                    RACE AGAIN
                  </button>
                  <button
                    onClick={handleSubmitScore}
                    disabled={isSubmitting || isSubmitted || score === 0}
                    className="px-8 py-3 bg-white/10 text-white rounded-full font-bold text-sm tracking-widest border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> SUBMITTING...</>
                    ) : isSubmitted ? (
                      "SCORE SUBMITTED"
                    ) : (
                      "SUBMIT SCORE"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {isPlaying && (
             <div className="mt-6 text-white/50 text-xs text-center font-mono max-w-sm hidden sm:block">
               Use <span className="text-white">←</span> and <span className="text-white">→</span> keys to dodge red obstacles. Collect green energy for bonus score!
             </div>
          )}
        </div>
      )}
    </div>
  );
}

