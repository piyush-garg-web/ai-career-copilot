// src/components/voice-interview/animated-waveform.jsx

import React from "react";
import { motion } from "framer-motion";

export function AnimatedWaveform({ volumeLevel = 0, status = "idle", className = "" }) {
  // Generate 12 bars for our visualizer
  const bars = Array.from({ length: 16 });

  // Compute visual heights based on volume level and speech status
  const getScaleY = (index) => {
    if (status === "processing") {
      // Slow pulse animation when thinking
      return [0.2, 0.6, 0.2];
    }
    if (status === "speaking") {
      // Sine wave pulsing when AI speaks
      return [0.15, 0.45 + Math.sin(Date.now() / 200 + index) * 0.2, 0.15];
    }
    if (status === "listening") {
      // Dynamic height based on live audio volume level
      const volumeFactor = volumeLevel / 100; // 0.0 to 1.0
      const variance = Math.sin(index * 0.5) * 0.3 + 0.7; // organic look
      return Math.max(0.15, volumeFactor * variance * 1.5);
    }
    // Idle state: tiny dots
    return 0.12;
  };

  const getTransition = (index) => {
    if (status === "processing") {
      return {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.08,
      };
    }
    if (status === "speaking") {
      return {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.05,
      };
    }
    // Dynamic mic tracking: instant spring responsiveness
    return {
      type: "spring",
      stiffness: 300,
      damping: 15,
    };
  };

  const getColor = () => {
    if (status === "processing") return "bg-indigo-500/80";
    if (status === "speaking") return "bg-blue-500/80";
    if (status === "listening") return "bg-emerald-500/80";
    return "bg-slate-400/40";
  };

  return (
    <div className={`flex items-center justify-center gap-1.5 h-20 ${className}`}>
      {bars.map((_, idx) => {
        const scale = getScaleY(idx);
        const animateProps = Array.isArray(scale) ? { scaleY: scale } : { scaleY: scale };

        return (
          <motion.div
            key={idx}
            animate={animateProps}
            transition={getTransition(idx)}
            className={`w-1.5 h-full rounded-full origin-center ${getColor()}`}
            style={{
              minHeight: "6px",
              height: "48px",
            }}
          />
        );
      })}
    </div>
  );
}
export default AnimatedWaveform;
