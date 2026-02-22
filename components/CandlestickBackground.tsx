"use client";
import React, { useEffect, useRef } from "react";

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
}

/* ===== Professional Chart Settings ===== */
const CANDLE_WIDTH = 5;
const CANDLE_GAP = 7;
const CANDLE_STEP = CANDLE_WIDTH + CANDLE_GAP;

const UP_COLOR = "#22c55e";
const DOWN_COLOR = "#ef4444";
const BG_COLOR = "#0b1220"; // deep dark blue

const SPEED = 32; // pixels per second (smooth cinematic)

function generateCandle(prevClose: number): Candle {
  const volatility = prevClose * 0.012;
  const direction = Math.random() > 0.48 ? 1 : -1;
  const move = Math.random() * volatility * direction;

  const open = prevClose;
  const close = open + move;

  const bodyHigh = Math.max(open, close);
  const bodyLow = Math.min(open, close);

  const high = bodyHigh + Math.random() * volatility * 0.6;
  const low = bodyLow - Math.random() * volatility * 0.6;

  return { open, high, low, close };
}

const CandlestickBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let candles: Candle[] = [];
    let offset = 0;
    let min = Infinity;
    let max = -Infinity;
    let lastTime = 0;

    /* ===== Retina Fix ===== */
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildCandles();
    };

    const buildCandles = () => {
      candles = [];
      offset = 0;

      const count = Math.ceil(window.innerWidth / CANDLE_STEP) + 40;
      let price = 100 + Math.random() * 50;

      for (let i = 0; i < count; i++) {
        const c = generateCandle(price);
        candles.push(c);
        price = c.close;
      }

      updateRange();
    };

    const updateRange = () => {
      min = Infinity;
      max = -Infinity;

      candles.forEach((c) => {
        if (c.low < min) min = c.low;
        if (c.high > max) max = c.high;
      });

      const padding = (max - min) * 0.2;
      min -= padding;
      max += padding;
    };

    const toY = (price: number) => {
      const range = max - min || 1;
      return (
        canvas.height / (window.devicePixelRatio || 1) -
        ((price - min) / range) *
          (canvas.height / (window.devicePixelRatio || 1))
      );
    };

    const draw = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const dt = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      offset += SPEED * dt;

      while (offset >= CANDLE_STEP) {
        offset -= CANDLE_STEP;
        candles.shift();
        const last = candles[candles.length - 1];
        candles.push(generateCandle(last.close));
        updateRange();
      }

      /* Background */
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(
        0,
        0,
        canvas.width / (window.devicePixelRatio || 1),
        canvas.height / (window.devicePixelRatio || 1),
      );

      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.95;

      candles.forEach((c, i) => {
        const x = i * CANDLE_STEP - offset;
        if (x < -CANDLE_WIDTH || x > window.innerWidth) return;

        const isUp = c.close >= c.open;
        const color = isUp ? UP_COLOR : DOWN_COLOR;

        const highY = toY(c.high);
        const lowY = toY(c.low);
        const openY = toY(c.open);
        const closeY = toY(c.close);

        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(Math.abs(closeY - openY), 1.5);
        const centerX = x + CANDLE_WIDTH / 2;

        /* Wick */
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(centerX, highY);
        ctx.lineTo(centerX, lowY);
        ctx.stroke();

        /* Body */
        ctx.fillStyle = color;
        ctx.fillRect(x, bodyTop, CANDLE_WIDTH, bodyHeight);
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};

export default CandlestickBackground;
