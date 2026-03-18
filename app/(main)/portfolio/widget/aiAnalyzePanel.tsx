import { PortfolioDTO } from "@/app/interface/dto/portfolio";
import { Button } from "@/components/ui/button";
import { createPortfolioAnalysisInput } from "@/lib/ai/portfolioAgent";
import { usePortfolioAgent } from "@/lib/hooks/usePortfolioAgent";
import { set } from "better-auth";
import { Sparkles } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface AiAnalyzePanelProps {
  portfolio: PortfolioDTO;
}

function AiAnalyzePanel({ portfolio }: AiAnalyzePanelProps) {
  const hasAnalyzedRef = useRef(false);
  const {
    isLoading,
    streamingTxt,
    messages,
    error,
    analyzeStreaming,
    sendMessage,
    clearChat,
  } = usePortfolioAgent();

  useEffect(() => {
    const handleAnalyze = async () => {
      if (!hasAnalyzedRef.current) {
        hasAnalyzedRef.current = true;
        await analyzeStreaming(createPortfolioAnalysisInput(portfolio));
      }
    };

    handleAnalyze();

    return () => {
      clearChat();
    };
  }, []);

  //TODO: 대화 기능 UI 구현 어떻게?
  //TODO: 메세지 속도 조절

  return (
    <div className="flex flex-col rounded-lg bg-white p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-yellow-500" />
        <h2 className="font-semibold ">AI 분석</h2>
      </div>

      <div className="flex flex-col overflow-y-auto space-y-3">
        {error ? (
          <div>error</div>
        ) : (
          <div className="bg-muted rounded-lg p-3 text-sm whitespace-pre-wrap text-black">
            {streamingTxt}
            {isLoading && <span className="animate-pulse">▌</span>}
          </div>
        )}

        {/* {messages.map((message, idx) => (
          <div
            key={idx}
            className="bg-muted rounded-lg p-3 text-sm whitespace-pre-wrap"
          >
            {message.content}
          </div>
        ))} */}
      </div>
    </div>
  );
}

export default AiAnalyzePanel;
