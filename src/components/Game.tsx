import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Zap } from 'lucide-react';
import { Transactions } from './Transactions';

export function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const requestRef = useRef<number>();

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let playerX = canvas.width / 2;
    const playerY = canvas.height - 40;
    const playerWidth = 20;
    const playerHeight = 30;

    let obstacles: { x: number; y: number; width: number; height: number; speed: number }[] = [];
    let currentScore = 0;
    let frameCount = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') playerX -= 25;
      if (e.key === 'ArrowRight') playerX += 25;
      playerX = Math.max(0, Math.min(canvas.width - playerWidth, playerX));
    };

    window.addEventListener('keydown', handleKeyDown);

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid effect
      ctx.strokeStyle = 'rgba(0, 82, 255, 0.2)';
      ctx.beginPath();
      for (let i = 0; i < canvas.height; i += 20) {
        ctx.moveTo(0, (i + frameCount) % canvas.height);
        ctx.lineTo(canvas.width, (i + frameCount) % canvas.height);
      }
      ctx.stroke();

      // Draw player
      ctx.fillStyle = '#0052FF';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#0052FF';
      ctx.fillRect(playerX, playerY, playerWidth, playerHeight);
      ctx.shadowBlur = 0;

      // Obstacles
      if (frameCount % 60 === 0) {
        obstacles.push({
          x: Math.random() * (canvas.width - 20),
          y: -20,
          width: 20 + Math.random() * 30,
          height: 20,
          speed: 3 + Math.random() * 3,
        });
      }

      for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        obs.y += obs.speed;
        
        ctx.fillStyle = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ef4444';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.shadowBlur = 0;

        // Collision
        if (
          playerX < obs.x + obs.width &&
          playerX + playerWidth > obs.x &&
          playerY < obs.y + obs.height &&
          playerY + playerHeight > obs.y
        ) {
          setGameOver(true);
          setIsPlaying(false);
          setScore(currentScore);
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
  }, [isPlaying, gameOver]);

  return (
    <div className="flex flex-col items-center w-full">
      {!isPlaying && !gameOver ? (
        <div className="text-center w-full">
          <p className="text-white/60 mb-8 max-w-sm mx-auto text-sm">Use Right & Left arrow keys to dodge incoming obstacles.</p>
          <Transactions onTxSuccess={() => {
              setIsPlaying(true);
              setGameOver(false);
              setScore(0);
          }} />
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          <div className="flex justify-between items-center w-full mb-4 px-4">
            <span className="text-[#0052FF] font-mono text-xl tracking-widest font-bold">SCORE: {score}</span>
            {gameOver && <span className="text-red-500 font-bold uppercase tracking-widest animate-pulse">CRASHED!</span>}
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,82,255,0.1)] relative">
            <canvas 
              ref={canvasRef} 
              width={600} 
              height={300} 
              className="block bg-black w-full"
            />
            
            {gameOver && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center flex-col">
                <Trophy className="w-16 h-16 text-yellow-400 mb-4" />
                <h3 className="text-3xl font-black italic text-white mb-2">RACE OVER</h3>
                <p className="text-white/60 mb-6 uppercase tracking-widest">Final Score: {score}</p>
                <button
                  onClick={() => {
                    setGameOver(false);
                    setIsPlaying(false);
                    setScore(0);
                  }}
                  className="px-8 py-3 bg-[#0052FF] text-white rounded-full font-bold text-sm tracking-widest border border-white/20 hover:bg-[#0052FF]/80 transition-colors"
                >
                  RACE AGAIN
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
