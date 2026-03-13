"use client";

import { useCallback, useState } from "react";
import { AgentMessage, PortfolioAnalysisInput } from "../ai/portfolioAgent";

export function usePortfolioAgent() {
  const [isLoading, setLoading] = useState(false);
  const [streamingTxt, setStreamingTxt] = useState("");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const analyzeStreaming = useCallback(
    async (input: PortfolioAnalysisInput) => {
      setLoading(true);
      setStreamingTxt("");
      setError(null);

      try {
        const res = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");

        let fullText = "";
        let rafId: number;

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          const lines = decoder.decode(value, { stream: true }).split("\n");
          for (const line of lines) {
            console.log("line:", line);
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const data = JSON.parse(line.slice(6));
                fullText += data.text;

                cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                  setStreamingTxt(fullText);
                });
                setStreamingTxt(fullText);
              } catch (error) {
                console.error("파싱 실패", error);
              }
            }
          }
        }

        cancelAnimationFrame(rafId);
        setMessages((prev) => [...prev, { role: "model", content: fullText }]);
      } catch (error) {
        setError("분석 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },

    [],
  );

  const sendMessage = useCallback(
    async (userMessage: string, portfolioContext?: PortfolioAnalysisInput) => {
      const newMessages: AgentMessage[] = [
        ...messages,
        { role: "user", content: userMessage },
      ];

      setMessages(newMessages);
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: newMessages, portfolioContext }),
        });

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "model", content: data.message },
        ]);
      } catch (error) {
        setError("메세지 전송 실패");
      } finally {
        setLoading(false);
      }
    },
    [messages],
  );

  const clearChat = () => {
    setMessages([]);
    setStreamingTxt("");
  };

  return {
    isLoading,
    streamingTxt,
    messages,
    error,
    analyzeStreaming,
    sendMessage,
    clearChat,
  };
}
