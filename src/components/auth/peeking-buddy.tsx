"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

// peeking.png is 800×800 with the "wall" edge the character hides behind at
// x≈316 and the fingers wrapping round it from x≈285. Sized at 260px, the
// wrapper starts at the fingertips (~10px over the panel) and clips anything
// further left, so the character slides out from *behind* the brand panel.
const SIZE = 260;
const FINGERTIP_X = (285 / 800) * SIZE;
const WALL_X = (316 / 800) * SIZE;
const VISIBLE_W = ((612 - 285) / 800) * SIZE;

export function PeekingBuddy() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-[14%] z-20 hidden overflow-hidden xl:block"
      style={{ left: -(WALL_X - FINGERTIP_X), width: VISIBLE_W + 8, height: SIZE }}
    >
      <motion.div
        className="absolute top-0"
        style={{ left: -FINGERTIP_X, width: SIZE, height: SIZE }}
        initial={reduceMotion ? false : { x: -VISIBLE_W - 10 }}
        animate={{ x: 0 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 120, damping: 14 }}
      >
        <Image src="/illustrations/peeking.png" alt="" fill sizes="260px" priority />
      </motion.div>
    </div>
  );
}
