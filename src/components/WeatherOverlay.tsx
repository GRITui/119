import React, { useEffect, useRef } from 'react';
import { WeatherType, WeatherEffect } from '../types/game';

interface WeatherOverlayProps {
  weather?: WeatherType;
  effect?: WeatherEffect;
}

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ weather = 'clear' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
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

    // Weather particle systems
    interface RainParticle {
      x: number;
      y: number;
      length: number;
      speed: number;
      thickness: number;
      opacity: number;
    }

    interface HazeParticle {
      x: number;
      y: number;
      radius: number;
      speedY: number;
      speedX: number;
      opacity: number;
      phase: number;
    }

    interface MistParticle {
      x: number;
      y: number;
      radius: number;
      speedX: number;
      opacity: number;
    }

    interface DuskParticle {
      x: number;
      y: number;
      radius: number;
      speedY: number;
      speedX: number;
      opacity: number;
      color: string;
    }

    const rainDrops: RainParticle[] = Array.from({ length: 150 }, () => ({
      x: Math.random() * (width + 200),
      y: Math.random() * height,
      length: Math.random() * 24 + 16,
      speed: Math.random() * 14 + 16,
      thickness: Math.random() * 1.5 + 0.8,
      opacity: Math.random() * 0.35 + 0.2,
    }));

    const hazeParticles: HazeParticle[] = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 28 + 12,
      speedY: -(Math.random() * 0.8 + 0.3),
      speedX: (Math.random() - 0.5) * 0.6,
      opacity: Math.random() * 0.08 + 0.02,
      phase: Math.random() * Math.PI * 2,
    }));

    const mistParticles: MistParticle[] = Array.from({ length: 24 }, () => ({
      x: Math.random() * width,
      y: height - Math.random() * 180,
      radius: Math.random() * 60 + 40,
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.07 + 0.03,
    }));

    const duskParticles: DuskParticle[] = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.5 + 1.2,
      speedY: -(Math.random() * 0.4 + 0.1),
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.45 + 0.2,
      color: Math.random() > 0.5 ? '#f59e0b' : '#fbbf24',
    }));

    let lightningTimer = 0;
    let isFlashing = false;
    let timeTick = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      timeTick += 0.02;

      // 1. Monsoon Rain
      if (weather === 'monsoon') {
        // Occasional lightning flash
        lightningTimer++;
        if (lightningTimer > 400 && Math.random() < 0.02) {
          isFlashing = true;
          lightningTimer = 0;
          setTimeout(() => {
            isFlashing = false;
          }, 80);
        }

        if (isFlashing) {
          ctx.fillStyle = 'rgba(235, 245, 255, 0.22)';
          ctx.fillRect(0, 0, width, height);
        }

        rainDrops.forEach((drop) => {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(190, 220, 255, ${drop.opacity})`;
          ctx.lineWidth = drop.thickness;
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - drop.length * 0.28, drop.y + drop.length);
          ctx.stroke();

          drop.y += drop.speed;
          drop.x -= drop.speed * 0.28;

          if (drop.y > height) {
            drop.y = -drop.length;
            drop.x = Math.random() * (width + 300);
          }
        });
      }

      // 2. Scorching Heat Haze (Bangkok 37°C)
      else if (weather === 'heat_haze') {
        // Atmospheric amber tint
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.06)');
        gradient.addColorStop(1, 'rgba(234, 88, 12, 0.12)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Heat shimmering bubbles / dust waves
        hazeParticles.forEach((p) => {
          p.phase += 0.03;
          const wobbleX = Math.sin(p.phase) * 1.5;

          const radGrad = ctx.createRadialGradient(
            p.x + wobbleX,
            p.y,
            0,
            p.x + wobbleX,
            p.y,
            p.radius
          );
          radGrad.addColorStop(0, `rgba(251, 191, 36, ${p.opacity})`);
          radGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(p.x + wobbleX, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y < -p.radius) {
            p.y = height + p.radius;
            p.x = Math.random() * width;
          }
        });
      }

      // 3. Corporate Air-Conditioning Freeze (20°C high-rise contrast)
      else if (weather === 'ac_chill') {
        // Subtle cool blue vignette
        const grad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          width * 0.25,
          width / 2,
          height / 2,
          width * 0.8
        );
        grad.addColorStop(0, 'rgba(147, 197, 253, 0)');
        grad.addColorStop(1, 'rgba(30, 58, 138, 0.15)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Floating cool mist wisps along floor
        mistParticles.forEach((m) => {
          const mistGrad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.radius);
          mistGrad.addColorStop(0, `rgba(186, 230, 253, ${m.opacity})`);
          mistGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');

          ctx.fillStyle = mistGrad;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
          ctx.fill();

          m.x += m.speedX;
          if (m.x < -m.radius) m.x = width + m.radius;
          if (m.x > width + m.radius) m.x = -m.radius;
        });
      }

      // 4. Golden Hour Balcony Dusk
      else if (weather === 'golden_dusk') {
        // Warm sunset glow
        const duskGrad = ctx.createLinearGradient(0, 0, width, height);
        duskGrad.addColorStop(0, 'rgba(244, 63, 94, 0.05)');
        duskGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.08)');
        duskGrad.addColorStop(1, 'rgba(147, 51, 234, 0.06)');
        ctx.fillStyle = duskGrad;
        ctx.fillRect(0, 0, width, height);

        // Gentle floating golden dust motes
        duskParticles.forEach((d) => {
          ctx.fillStyle = d.color;
          ctx.globalAlpha = d.opacity * (0.6 + Math.sin(timeTick + d.x) * 0.4);
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;

          d.y += d.speedY;
          d.x += d.speedX;

          if (d.y < -10) {
            d.y = height + 10;
            d.x = Math.random() * width;
          }
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [weather]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      />
      {/* CSS Shimmer filter when Heat Haze is active */}
      {weather === 'heat_haze' && (
        <div className="pointer-events-none absolute inset-0 z-15 bg-gradient-to-t from-amber-500/10 via-transparent to-amber-500/5 mix-blend-color-dodge animate-pulse opacity-40" />
      )}
    </>
  );
};
