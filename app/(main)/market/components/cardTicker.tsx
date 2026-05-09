"use client";

import { MarketRanking } from "@/app/interface/dto/market";
import CustomTooltip from "@/components/tooltip/customTooltip";
import React from "react";

interface CardTickerProps {
  item: MarketRanking;
}

function CardTicker({ item }: CardTickerProps) {
  return (
    <CustomTooltip content={item.shortName} contentClass="fill-black bg-black">
      <div
        className="flex justify-center items-center border-[1.5px] border-gray-200 text-black bg-white hover:bg-black hover:text-white rounded-full px-2 py-0.5
                  transition-colors duration-300 "
      >
        <span className="text-sm">{item.symbol}</span>
      </div>
    </CustomTooltip>
  );
}

export default CardTicker;
