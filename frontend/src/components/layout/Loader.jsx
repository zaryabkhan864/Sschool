import React from "react";
import { useGetSchoolQuery } from "../../redux/api/schoolApi";

const Loader = () => {
  const { data: schoolData } = useGetSchoolQuery();
  const logoUrl = schoolData?.logo?.url;

  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="relative flex items-center justify-center w-48 h-48">
        {/* Outer Glowing Ring */}
        <div className="absolute w-48 h-48 border-8 border-orange-500/20 rounded-full"></div>

        {/* Animated Spinning Ring */}
        <div className="absolute w-48 h-48 border-8 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>

        {/* Middle Pulsing Circle — sits behind the logo, same soft glow as before */}
        <div className="absolute w-32 h-32 bg-orange-500/10 rounded-full animate-pulse"></div>

        {/* School Logo (center) — falls back to the old plain dot if no logo is set yet */}
        <div className="relative w-28 h-28 rounded-full bg-white shadow-md overflow-hidden flex items-center justify-center">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={schoolData?.name || "Loading"}
              className="w-full h-full object-contain p-3"
            />
          ) : (
            <div className="w-8 h-8 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.8)]"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Loader;