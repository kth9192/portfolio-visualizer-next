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

      let displayTxt = "";
      let textQueue = "";
      // let animationRunning = true;

      const CHARS_PER_TICK = 2;

      const worker = new Worker("/web-worker.js");

      worker.onmessage = () => {
        if (textQueue.length > 0) {
          //버퍼에서 글자 꺼냄
          const chunk = textQueue.slice(0, CHARS_PER_TICK);
          //자르고 버퍼갱신
          textQueue = textQueue.slice(CHARS_PER_TICK);
          displayTxt += chunk;
          setStreamingTxt(displayTxt);
        }
      };

      worker.postMessage("start");

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

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          const lines = decoder.decode(value, { stream: true }).split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const data = JSON.parse(line.slice(6));
                textQueue += data.text;
              } catch (error) {
                console.error("파싱 실패", error);
              }
            }
          }
        }

        await new Promise<void>((resolve) => {
          const check = setInterval(() => {
            if (textQueue.length === 0) {
              clearInterval(check);
              resolve();
            }
          }, 50);
        });

        // cancelAnimationFrame(rafId);
        setMessages((prev) => [
          ...prev,
          { role: "model", content: displayTxt },
        ]);
      } catch (error) {
        setError("분석 중 오류가 발생했습니다.");
      } finally {
        worker.postMessage("stop");
        worker.terminate();
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
