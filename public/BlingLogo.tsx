"use client";
import React from "react";
import { motion } from "framer-motion";

const Icon = () => {
  return (
    <div className="relative flex h-full flex-col items-center justify-center">
      <div className="relative flex h-full flex-row items-center justify-center gap-8">
        <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/70 bg-black p-4 shadow-[0_0_15px_5px_#dbe0e2]">
          <img src={"/images/minimal.png"} alt="Logo 2" className="z-0 brightness-0 invert filter" />
          <motion.div
            className="absolute left-0 top-0 size-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 2,
              ease: "linear",
              repeat: Infinity,
              repeatType: "loop",
            }}
            style={{ willChange: "transform" }}
          />
        </div>
      </div>
    </div>
  );
};

export const LogoBling = () => {
  return (
    <div className="flex items-center justify-center">
      <Icon />
    </div>
  );
};
