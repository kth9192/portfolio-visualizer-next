import { analyzePortfolioStream } from "@/lib/ai/portfolioAgent";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const input = await req.json();

    //스트리밍

    const encorder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of analyzePortfolioStream(input)) {
            controller.enqueue(
              encorder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`),
            );
          }
          controller.enqueue(encorder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error(error);
    if (error.status === 429) {
      return Response.json(
        { error: "사용량 초과. 잠시 후 다시 시도하세요" },
        { status: 429 },
      );
    } else {
      return Response.json({ error: "AI 분석 실패" }, { status: 500 });
    }
  }
}
