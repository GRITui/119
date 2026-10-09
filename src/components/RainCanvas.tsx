import React, { useEffect, useRef } from 'react';

interface RainCanvasProps {
  intensity?: 'light' | 'monsoon';
  active: boolean;
}

export const RainCanvas: React.FC<RainCanvasProps> = ({ intensity = 'monsoon', active }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const dropCount = intensity === 'monsoon' ? 140 : 60;
    const drops = Array.from({ length: dropCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 22 + 14,
      speed: Math.random() * 12 + 14,
      thickness: Math.random() * 1.5 + 0.8,
      opacity: Math.random() * 0.35 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      drops.forEach((drop) => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(200, 225, 255, ${drop.opacity})`;
        ctx.lineWidth = drop.thickness;
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - drop.length * 0.25, drop.y + drop.length);
        ctx.stroke();

        drop.y += drop.speed;
        drop.x -= drop.speed * 0.2;

        if (drop.y > height) {
          drop.y = -drop.length;
          drop.x = Math.random() * (width + 100);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active, intensity]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-70"
    />
  );
};
