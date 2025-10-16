"use client";

import React from "react";

function PortfolioListErrorPage() {
  return (
    <section className="flex flex-col w-full 2xl:w-4/5 gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">내 포트폴리오</h1>
      </div>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">포트폴리오를 불러오는데 실패했습니다.</p>
      </div>
    </section>
  );
}

export default PortfolioListErrorPage;
