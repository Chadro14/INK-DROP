"use client";

import { useEffect, useRef } from "react";

interface LoaderProps {
  size?: number;
  speed?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export function Loader({ size = 48, speed = 1, className = "" }: LoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const flashRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);
  const rotationCountRef = useRef<number>(0);
  const isFusingRef = useRef<boolean>(false);
  const scaleRef = useRef<number>(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement?.getBoundingClientRect();
    const baseSize = size || 48;
    const canvasSize = Math.max(baseSize, 48);

    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;

    ctx.scale(dpr, dpr);

    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    const radius = canvasSize * 0.32;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const speedMultiplier = prefersReducedMotion ? 0 : speed;

    let particles: Particle[] = [];
    let flashIntensity = 0;
    let phase = 0;
    let rotationCount = 0;
    let isFusing = false;
    let scale = 1;

    // ============================================
    // CRÉER UNE TRAÎNÉE (particule)
    // ============================================
    function createTrail(x: number, y: number, color: string): Particle {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.5 + Math.random() * 0.5) * 1.5;
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.3,
        life: 1,
        maxLife: 0.4 + Math.random() * 0.3,
        size: 0.5 + Math.random() * 1.5,
      };
    }

    // ============================================
    // POSITION DES BOULES
    // ============================================
    function getBallPositions(t: number, scale: number): { x1: number; y1: number; x2: number; y2: number } {
      const angle = t * 2.5 * speedMultiplier;
      const currentRadius = radius * scale;
      const separation = 0.08;

      const x1 = centerX + Math.cos(angle) * currentRadius;
      const y1 = centerY + Math.sin(angle) * currentRadius;
      const x2 = centerX + Math.cos(angle + Math.PI + separation) * currentRadius * 0.95;
      const y2 = centerY + Math.sin(angle + Math.PI + separation) * currentRadius * 0.95;

      return { x1, y1, x2, y2 };
    }

    // ============================================
    // ANIMATION PRINCIPALE
    // ============================================
    function animate(timestamp: number) {
      if (!timeRef.current) timeRef.current = timestamp;
      const delta = (timestamp - timeRef.current) / 16.67;
      timeRef.current = timestamp;

      const t = phase;

      // Rotation
      const angle = t * 2.5 * speedMultiplier;
      const currentRadius = radius * scale;

      // Détection de la 4e rotation
      const currentRotation = t / (2 * Math.PI);
      if (currentRotation >= 3 && !isFusing) {
        isFusing = true;
        rotationCount = 3;
      }

      // Fusion
      if (isFusing) {
        const fuseProgress = (currentRotation - 3) / 0.3;
        if (fuseProgress < 1) {
          scale = 1 - fuseProgress * 0.6;
          flashIntensity = Math.sin(fuseProgress * Math.PI) * 0.8;
        } else {
          // Flash
          flashIntensity = 1;
          // Disparition
          setTimeout(() => {
            // Reset
            phase = 0;
            rotationCount = 0;
            isFusing = false;
            scale = 1;
            flashIntensity = 0;
            particles = [];
          }, 50);
          phase += delta * 0.001;
          return;
        }
      }

      const pos = getBallPositions(t, scale);

      // Ajouter des traînées
      if (Math.random() < 0.6 * speedMultiplier) {
        const color1 = `hsl(217, 91%, ${60 + Math.random() * 30}%)`;
        const color2 = `hsl(0, 0%, ${80 + Math.random() * 20}%)`;
        particles.push(createTrail(pos.x1, pos.y1, color1));
        particles.push(createTrail(pos.x2, pos.y2, color2));
      }

      // Limiter les particules
      if (particles.length > 120) {
        particles = particles.slice(-100);
      }

      // Mettre à jour les particules
      particles = particles
        .map((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.02;
          p.life -= 0.02;
          return p;
        })
        .filter((p) => p.life > 0);

      // ===== DESSIN =====
      ctx.clearRect(0, 0, canvasSize, canvasSize);

      // Flash
      if (flashIntensity > 0.01) {
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.8);
        gradient.addColorStop(0, `rgba(147, 197, 253, ${flashIntensity * 0.6})`);
        gradient.addColorStop(1, `rgba(147, 197, 253, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        // Lignes électriques
        for (let i = 0; i < 8; i++) {
          const angle2 = (i / 8) * Math.PI * 2 + t * 2;
          const len = (10 + Math.random() * 20) * flashIntensity * scale;
          const startX = centerX + Math.cos(angle2) * radius * scale * 0.3;
          const startY = centerY + Math.sin(angle2) * radius * scale * 0.3;
          const endX = startX + Math.cos(angle2 + (Math.random() - 0.5) * 1.2) * len;
          const endY = startY + Math.sin(angle2 + (Math.random() - 0.5) * 1.2) * len;

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = `rgba(147, 197, 253, ${flashIntensity * 0.5})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Traînées
      for (const p of particles) {
        const alpha = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 197, 253, ${alpha * 0.4})`;
        ctx.fill();
      }

      // ===== BOULE 1 : BLEUE =====
      const radius1 = 4.5 * scale;
      const glow1 = ctx.createRadialGradient(
        pos.x1 - radius1 * 0.3,
        pos.y1 - radius1 * 0.3,
        0,
        pos.x1,
        pos.y1,
        radius1 * 3
      );
      glow1.addColorStop(0, `rgba(59, 130, 246, ${0.6 + flashIntensity * 0.3})`);
      glow1.addColorStop(0.3, `rgba(59, 130, 246, ${0.2 + flashIntensity * 0.2})`);
      glow1.addColorStop(1, `rgba(59, 130, 246, 0)`);
      ctx.fillStyle = glow1;
      ctx.beginPath();
      ctx.arc(pos.x1, pos.y1, radius1 * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pos.x1, pos.y1, radius1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(147, 197, 253, ${0.9 + flashIntensity * 0.1})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pos.x1 - radius1 * 0.3, pos.y1 - radius1 * 0.3, radius1 * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + flashIntensity * 0.2})`;
      ctx.fill();

      // ===== BOULE 2 : BLANC/NOIR =====
      const radius2 = 4.5 * scale;
      const glow2 = ctx.createRadialGradient(
        pos.x2 - radius2 * 0.3,
        pos.y2 - radius2 * 0.3,
        0,
        pos.x2,
        pos.y2,
        radius2 * 3
      );
      glow2.addColorStop(0, `rgba(200, 200, 210, ${0.5 + flashIntensity * 0.3})`);
      glow2.addColorStop(0.3, `rgba(180, 180, 190, ${0.15 + flashIntensity * 0.2})`);
      glow2.addColorStop(1, `rgba(180, 180, 190, 0)`);
      ctx.fillStyle = glow2;
      ctx.beginPath();
      ctx.arc(pos.x2, pos.y2, radius2 * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pos.x2, pos.y2, radius2, 0, Math.PI * 2);
      const grayValue = Math.min(180 + Math.random() * 20, 220);
      ctx.fillStyle = `rgba(${grayValue}, ${grayValue}, ${grayValue + 10}, ${0.85 + flashIntensity * 0.1})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pos.x2 - radius2 * 0.3, pos.y2 - radius2 * 0.3, radius2 * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + flashIntensity * 0.2})`;
      ctx.fill();

      // Énergie de fusion (mélange des couleurs)
      if (isFusing && flashIntensity > 0.1) {
        const mixX = (pos.x1 + pos.x2) / 2;
        const mixY = (pos.y1 + pos.y2) / 2;
        const mixRadius = radius1 * 2 * flashIntensity;

        const mixGlow = ctx.createRadialGradient(mixX, mixY, 0, mixX, mixY, mixRadius);
        mixGlow.addColorStop(0, `rgba(147, 197, 253, ${flashIntensity * 0.4})`);
        mixGlow.addColorStop(0.4, `rgba(200, 200, 220, ${flashIntensity * 0.3})`);
        mixGlow.addColorStop(1, `rgba(147, 197, 253, 0)`);
        ctx.fillStyle = mixGlow;
        ctx.beginPath();
        ctx.arc(mixX, mixY, mixRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mise à jour de la phase
      phase += delta * 0.001 * speedMultiplier;

      // Flash intensity fade
      if (flashIntensity > 0.01) {
        flashIntensity *= 0.9;
      }

      particlesRef.current = particles;
      flashRef.current = flashIntensity;
      phaseRef.current = phase;
      rotationCountRef.current = rotationCount;
      isFusingRef.current = isFusing;
      scaleRef.current = scale;

      animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [size, speed]);

  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}