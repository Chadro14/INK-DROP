"use client";

import { useEffect, useRef } from "react";

interface InkDropLoaderProps {
  size?: number;
  speed?: number;
  className?: string;
}

type Point = {
  x: number;
  y: number;
};

const TAU = Math.PI * 2;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const easeInCubic = (t: number) => t * t * t;

export function InkDropLoader({
  size = 96,
  speed = 1.55,
  className = "",
}: InkDropLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!context) return;

    const ctx = context;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);

    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const center = size / 2;

    /*
     * Les boules restent volontairement proches.
     * Elles orbitent presque comme deux électrons.
     */
    const orbitRadius = size * 0.115;

    const particleRadius = size * 0.068;

    /*
     * Cycle rapide.
     *
     * 0 → 72% :
     * 3 tours rapides.
     *
     * 72 → 100% :
     * 4e tour + fusion ratée + disparition.
     */
    const cycleDuration = reducedMotion ? 900 : 1750 / speed;

    let animationFrame = 0;
    let startTime = performance.now();

    /*
     * Historique de positions pour créer
     * les traînées anime.
     */
    const blueTrail: Point[] = [];
    const whiteTrail: Point[] = [];

    const MAX_TRAIL = 10;

    const clear = () => {
      ctx.clearRect(0, 0, size, size);
    };

    const drawGlow = (
      x: number,
      y: number,
      radius: number,
      color: string,
      alpha: number
    ) => {
      const gradient = ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        radius
      );

      gradient.addColorStop(0, color);
      gradient.addColorStop(0.35, color.replace(")", `, ${alpha})`));
      gradient.addColorStop(1, "transparent");

      ctx.globalAlpha = alpha;
      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, TAU);
      ctx.fill();

      ctx.globalAlpha = 1;
    };

    const drawTrail = (
      trail: Point[],
      color: string,
      radius: number,
      alphaMultiplier = 1
    ) => {
      for (let i = trail.length - 1; i >= 0; i--) {
        const point = trail[i];

        const progress =
          trail.length <= 1
            ? 1
            : i / (trail.length - 1);

        const alpha =
          Math.pow(progress, 2.2) *
          0.25 *
          alphaMultiplier;

        const r =
          radius *
          (0.35 + progress * 0.55);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;

        ctx.beginPath();
        ctx.arc(point.x, point.y, r, 0, TAU);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    const drawParticle = (
      x: number,
      y: number,
      radius: number,
      color: string,
      alpha = 1
    ) => {
      /*
       * Aura externe
       */
      const aura = ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        radius * 4
      );

      aura.addColorStop(
        0,
        color === "#3B82F6"
          ? "rgba(59,130,246,.45)"
          : "rgba(255,255,255,.25)"
      );

      aura.addColorStop(1, "transparent");

      ctx.globalAlpha = alpha;

      ctx.fillStyle = aura;

      ctx.beginPath();
      ctx.arc(x, y, radius * 4, 0, TAU);
      ctx.fill();

      /*
       * Corps de la boule
       */
      const body = ctx.createRadialGradient(
        x - radius * 0.35,
        y - radius * 0.4,
        radius * 0.08,
        x,
        y,
        radius
      );

      if (color === "#3B82F6") {
        body.addColorStop(0, "#FFFFFF");
        body.addColorStop(0.22, "#93C5FD");
        body.addColorStop(0.6, "#3B82F6");
        body.addColorStop(1, "#123B82");
      } else {
        body.addColorStop(0, "#FFFFFF");
        body.addColorStop(0.55, "#E5E7EB");
        body.addColorStop(1, "#5B5B5B");
      }

      ctx.fillStyle = body;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, TAU);
      ctx.fill();

      /*
       * Reflet anime.
       */
      ctx.globalAlpha = alpha * 0.85;

      ctx.fillStyle = "#FFFFFF";

      ctx.beginPath();
      ctx.arc(
        x - radius * 0.32,
        y - radius * 0.34,
        radius * 0.19,
        0,
        TAU
      );

      ctx.fill();

      ctx.globalAlpha = 1;
    };

    const drawFusionEnergy = (
      amount: number,
      angle: number
    ) => {
      /*
       * Le moment où les deux couleurs
       * essayent de devenir une seule énergie.
       */
      const radius =
        particleRadius *
        (1 + amount * 1.9);

      const gradient = ctx.createRadialGradient(
        center,
        center,
        0,
        center,
        center,
        radius * 2.8
      );

      gradient.addColorStop(
        0,
        `rgba(210,235,255,${0.75 * amount})`
      );

      gradient.addColorStop(
        0.25,
        `rgba(96,165,250,${0.55 * amount})`
      );

      gradient.addColorStop(
        0.65,
        `rgba(59,130,246,${0.16 * amount})`
      );

      gradient.addColorStop(1, "transparent");

      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.arc(
        center,
        center,
        radius * 2.8,
        0,
        TAU
      );

      ctx.fill();

      /*
       * Petit anneau d'énergie.
       */
      ctx.save();

      ctx.translate(center, center);
      ctx.rotate(angle);

      ctx.strokeStyle = `rgba(147,197,253,${
        0.65 * amount
      })`;

      ctx.lineWidth = Math.max(1, size * 0.012);

      ctx.beginPath();

      ctx.arc(
        0,
        0,
        radius * 1.45,
        -Math.PI * 0.8,
        Math.PI * 0.3
      );

      ctx.stroke();

      ctx.restore();
    };

    const draw = (now: number) => {
      const elapsed = now - startTime;

      let cycleProgress =
        (elapsed % cycleDuration) /
        cycleDuration;

      /*
       * Petite accélération globale.
       */
      const fastProgress =
        reducedMotion
          ? cycleProgress
          : cycleProgress;

      clear();

      /*
       * 0 → 75% = trois rotations.
       *
       * 75 → 100% = quatrième rotation
       * et fusion.
       */
      const fusionStart = 0.75;

      let angle: number;
      let separation = orbitRadius;
      let fusion = 0;
      let opacity = 1;

      if (fastProgress < fusionStart) {
        /*
         * 3 tours.
         */
        const p =
          fastProgress / fusionStart;

        angle =
          p * TAU * 3;

        /*
         * Les boules respirent légèrement
         * sans s'éloigner.
         */
        separation =
          orbitRadius *
          (0.92 +
            Math.sin(p * TAU * 3) * 0.08);
      } else {
        /*
         * Quatrième tour.
         */
        const p =
          (fastProgress - fusionStart) /
          (1 - fusionStart);

        angle =
          TAU * 3 +
          p * TAU;

        /*
         * Elles se rapprochent rapidement.
         */
        const approach =
          easeInCubic(clamp(p / 0.68));

        separation =
          orbitRadius *
          lerp(1, 0.025, approach);

        /*
         * Moment de fusion.
         */
        if (p > 0.58) {
          fusion =
            easeOutCubic(
              clamp((p - 0.58) / 0.24)
            );
        }

        /*
         * Disparition brutale.
         */
        if (p > 0.82) {
          opacity =
            1 -
            easeInCubic(
              clamp((p - 0.82) / 0.18)
            );
        }
      }

      /*
       * Petite oscillation verticale
       * pour éviter un mouvement trop mécanique.
       */
      const breathing =
        Math.sin(now * 0.008) *
        size *
        0.008;

      const blue: Point = {
        x:
          center +
          Math.cos(angle) * separation,
        y:
          center +
          Math.sin(angle) * separation +
          breathing,
      };

      const white: Point = {
        x:
          center -
          Math.cos(angle) * separation,
        y:
          center -
          Math.sin(angle) * separation -
          breathing,
      };

      /*
       * Traînées.
       */
      blueTrail.unshift(blue);
      whiteTrail.unshift(white);

      if (blueTrail.length > MAX_TRAIL) {
        blueTrail.pop();
      }

      if (whiteTrail.length > MAX_TRAIL) {
        whiteTrail.pop();
      }

      drawTrail(
        blueTrail,
        "#3B82F6",
        particleRadius,
        opacity
      );

      drawTrail(
        whiteTrail,
        "#FFFFFF",
        particleRadius,
        opacity
      );

      /*
       * Aura centrale pendant la fusion.
       */
      if (fusion > 0) {
        drawFusionEnergy(
          fusion,
          angle
        );
      }

      /*
       * Les deux petites boules.
       */
      drawParticle(
        blue.x,
        blue.y,
        particleRadius,
        "#3B82F6",
        opacity
      );

      drawParticle(
        white.x,
        white.y,
        particleRadius,
        "#FFFFFF",
        opacity
      );

      /*
       * Éclair central très bref juste
       * avant la disparition.
       */
      if (
        fusion > 0.75 &&
        opacity > 0.25
      ) {
        const flash =
          fusion *
          opacity *
          0.55;

        const gradient =
          ctx.createRadialGradient(
            center,
            center,
            0,
            center,
            center,
            size * 0.19
          );

        gradient.addColorStop(
          0,
          `rgba(255,255,255,${flash})`
        );

        gradient.addColorStop(
          0.35,
          `rgba(96,165,250,${flash * 0.7})`
        );

        gradient.addColorStop(
          1,
          "transparent"
        );

        ctx.fillStyle = gradient;

        ctx.beginPath();

        ctx.arc(
          center,
          center,
          size * 0.19,
          0,
          TAU
        );

        ctx.fill();
      }

      animationFrame =
        requestAnimationFrame(draw);
    };

    animationFrame =
      requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(
        animationFrame
      );
    };
  }, [size, speed]);

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        background: "transparent",
      }}
      role="status"
      aria-label="Chargement"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
      />
    </div>
  );
}