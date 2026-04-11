import React from 'react';
import { motion } from 'motion/react';

export const FolderIcon = ({ delay, tabPosition, text = "REPS", subtext }: { delay: number; tabPosition: 'left' | 'center' | 'right'; text?: string; subtext?: string }) => {
  const tabX = tabPosition === 'left' ? 10 : tabPosition === 'center' ? 40 : 70;
  
  return (
    <motion.svg
      width="120"
      height="80"
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      {/* Folder Tab */}
      <motion.path
        d={`M${tabX} 10 L${tabX + 5} 5 L${tabX + 35} 5 L${tabX + 40} 10`}
        fill="white"
        stroke="#1a1a1a"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, fillOpacity: 0 }}
        animate={{ pathLength: 1, fillOpacity: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.8 }}
      />
      {/* Folder Body */}
      <motion.path
        d="M5 10 H115 V75 H5 V10 Z"
        fill="white"
        stroke="#1a1a1a"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, fillOpacity: 0 }}
        animate={{ pathLength: 1, fillOpacity: 1 }}
        transition={{ delay: delay + 0.4, duration: 1 }}
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))' }}
      />
      {/* Main Text */}
      <motion.text
        x="60"
        y={subtext ? "38" : "45"}
        textAnchor="middle"
        fill="#1a1a1a"
        fontSize={subtext ? "11" : "12"}
        fontWeight="900"
        fontFamily="JetBrains Mono, monospace"
        letterSpacing="0.2em"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 1, duration: 0.5 }}
      >
        {text}
      </motion.text>
      {/* Subtext (e.g., "ARCHIVE") */}
      {subtext && (
        <motion.text
          x="60"
          y="52"
          textAnchor="middle"
          fill="#1a1a1a"
          fontSize="9"
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
          letterSpacing="0.1em"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 1.2, duration: 0.5 }}
        >
          {subtext}
        </motion.text>
      )}
    </motion.svg>
  );
};

export const LoadingScreen = () => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-[#F5F5F5] flex items-center justify-center overflow-hidden"
    >
      <div className="relative flex flex-col items-center">
        {/* Folder Animation Container - This is the dead center */}
        <div className="relative w-[120px] h-[80px]">
          <div className="absolute inset-0" style={{ transform: 'translateY(-30px) translateX(-4px) scale(0.85)' }}>
            <FolderIcon delay={0.1} tabPosition="left" text="REPS" />
          </div>
          <div className="absolute inset-0" style={{ transform: 'translateY(-15px) translateX(4px) scale(0.9)' }}>
            <FolderIcon delay={0.3} tabPosition="center" text="REPS" />
          </div>
          <div className="absolute inset-0" style={{ transform: 'translateY(0px) translateX(-2px) scale(0.95)' }}>
            <FolderIcon delay={0.5} tabPosition="right" text="REPS" />
          </div>
          <div className="absolute inset-0" style={{ transform: 'translateY(15px) translateX(2px) scale(1)' }}>
            <FolderIcon delay={0.7} tabPosition="left" text="REPS" />
          </div>
          <div className="absolute inset-0" style={{ transform: 'translateY(30px) translateX(0px) scale(1.05)' }}>
            <FolderIcon delay={0.9} tabPosition="center" text="REP" subtext="ARCHIVE" />
          </div>
        </div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8 }}
          className="absolute top-[140px] text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] whitespace-nowrap"
        >
          Initializing App Data
        </motion.p>
      </div>
      
      {/* Subtle background grid to match app style */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ 
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
    </motion.div>
  );
};
