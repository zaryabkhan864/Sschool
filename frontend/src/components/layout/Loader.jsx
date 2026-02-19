import React from "react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="relative flex items-center justify-center">
        {/* Outer Glowing Ring */}
        <div className="absolute w-20 h-20 border-4 border-orange-500/20 rounded-full"></div>
        
        {/* Animated Spinning Ring */}
        <div className="w-20 h-20 border-4 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        
        {/* Middle Pulsing Circle */}
        <div className="absolute w-12 h-12 bg-orange-500/10 rounded-full animate-pulse"></div>
        
        {/* Center Dot */}
        <div className="absolute w-4 h-4 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.8)]"></div>
      </div>
    </div>
  );
};

export default Loader;