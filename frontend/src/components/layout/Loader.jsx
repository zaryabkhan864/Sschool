import React from "react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center mt-20">
      <div className="w-20 h-20 border-4 border-solid border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;