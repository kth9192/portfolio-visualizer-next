import CustomSpinner from "@/components/spinner/customSpinner";
import React from "react";

function MarketPageLoading() {
  return (
    <div className="flex justify-center items-center w-full h-screen">
      <CustomSpinner size={60} />
    </div>
  );
}

export default MarketPageLoading;
